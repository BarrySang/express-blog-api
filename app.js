const express = require("express");
const TextGenerator = require("./lib/TextGenerator");
const { generateBlogs, getUpdatedFields } = require("./lib/lib-functions");
const bodyParser = require("body-parser");
const blogsRouter = require("./routes/blogs");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const mysql = require("mysql");
const crypto = require("crypto");
let session = require("express-session");
let MySQLStore = require("express-mysql-session")(session);
const connection = require("./Db");
const cors = require("cors");

const app = express();
const port = 5000;

app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: "http://localhost",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

/**
 * routes
 */
class ServerResponse {
  constructor(success, data) {
    this.success = success;
    this.data = data;
  }
}

// middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    key: "session_cookie_name",
    secret: "session_cookie_secret",
    store: new MySQLStore({
      host: "localhost",
      port: 3306,
      user: "root",
      database: "cookie_user",
    }),
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

/**
 * passport setup
 */
// custom fields
const customFields = {
  usernameField: "email",
  passwordField: "password",
};

// console.log(connection.query('SELECT * FROM users WHERE email = ? ', ['email']))

const verifyCallBack = (email, password, done) => {
  console.log("verify callback starts here");
  connection.query(
    "SELECT * FROM users WHERE email = ? ",
    [email],
    function (error, results, fields) {
      if (error) {
        console.log("error: ", error);
        return done(error);
      }

      if (results.length == 0) {
        return done(null, false);
      }

      const isValid = validPassword(password, results[0].hash, results[0].salt);

      if (isValid) {
        return done(null, {
          id: results[0].id,
          email: results[0].email,
          hash: results[0].hash,
          salt: results[0].salt,
        });
      } else {
        return done(null, false);
      }
    }
  );
};

const strategy = new LocalStrategy(customFields, verifyCallBack);
passport.use(strategy);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((userId, done) => {
  connection.query(
    "SELECT * FROM users WHERE id = ? ",
    [userId],
    function (error, results) {
      done(null, results[0]);
    }
  );
});

// valid password function
function validPassword(password, hash, salt) {
  let hashVerify = crypto
    .pbkdf2Sync(password, salt, 10000, 60, "sha512")
    .toString("hex");
  return (hash = hashVerify);
}

function genPassword(password) {
  console.log(password);
  let salt = crypto.randomBytes(32).toString("hex");
  let genHash = crypto
    .pbkdf2Sync(password, salt, 10000, 60, "sha512")
    .toString("hex");
  return {
    salt: salt,
    hash: genHash,
  };
}

function isAuth(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(401).json({
      success: 0,
      data: "user not authorized",
    });
  }
}

function userExists(req, res, next) {
  connection.query(
    "SELECT * FROM users WHERE email = ?",
    [req.body.email],
    (error, results, fields) => {
      if (error) {
        res.status(500).json("an error occured");
      }

      if (results.length > 0) {
        const serverResponse = new ServerResponse(
          0,
          "email has already been used"
        );
        console.log(serverResponse);
        // res.status(400).json(serverResponse)
      }

      next();
    }
  );
}

/**
 * routes
 */
// 'blogs' routes
app.use("/blogs", blogsRouter);

app.post("/register", userExists, (req, res, next) => {
  console.log(req.body);
  const saltHash = genPassword(req.body.password);
  const salt = saltHash.salt;
  const hash = saltHash.hash;

  connection.query(
    "INSERT INTO users(email, hash, salt) values(?, ?, ?)",
    [req.body.email, hash, salt],
    (error, results, field) => {
      if (error) {
        // console.log(error)
        const serverResponse = new ServerResponse(0, "internal server error");
        res.status(500).json(serverResponse);
      } else {
        const serverResponse = new ServerResponse(
          1,
          "user registration succesful"
        );
        res.status(200).json(serverResponse);
      }
    }
  );
});

app.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login-failure",
    successRedirect: "/login-success",
  })
);

app.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
  });
  console.log("logged out");
  res.status(200).json({
    success: 1,
    data: "logged out",
  });
});

app.get("/login-success", (req, res) => {
  console.log(res);
  const serverResponse = new ServerResponse(1, "login succesful");
  res.status(200).json({ serverResponse });
});

app.get("/login-failure", (req, res) => {
  console.log(res);
  const serverResponse = new ServerResponse(0, "login failed");
  res.status(200).json({ serverResponse });
});

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
