const express = require("express");
const router = express.Router();
const connection = require("../Db");
const {
  generatePSParams,
  generateSQLQuery,
  isAuth,
  ServerResponse,
} = require("../lib/lib-functions");

// create
router.post("/", isAuth, (req, res) => {
  const { user_id, title, body } = req.body;

  console.log(req.body);

  // check for empty fields
  if (!user_id || !title || !body) {
    const serverResponse = new ServerResponse(0, "missing fields");

    res.status(400).json(serverResponse);
  } else {
    // create blog
    const newBlog = {
      user_id: user_id,
      title: title,
      body: body,
    };

    // insert blog to blogs table
    connection.query(
      "INSERT INTO blogs (user_id, title, body) VALUES (?, ?, ?)",
      [newBlog.user_id, newBlog.title, newBlog.body],
      (error, results, field) => {
        if (error) {
          console.log(error);
          const serverResponse = new ServerResponse(0, error);
          res.status(500).json(serverResponse);
        } else {
          const serverResponse = new ServerResponse(1, results);
          res.status(200).json(serverResponse);
        }
      }
    );
  }
});

// read all
router.get("/", (req, res) => {
  connection.query("SELECT * FROM `blogs`", (error, results, fields) => {
    if (error) {
      const serverResponse = new ServerResponse(0, error);
      console.log(error);
      res.status(500).json(serverResponse);
    } else {
      const serverResponse = new ServerResponse(1, results);
      console.log(results);
      res.status(200).json(serverResponse);
    }
  });
});

// read one
router.get("/:id", (req, res) => {
  const id = req.params.id;

  connection.query(
    "SELECT * FROM `blogs` WHERE `id` = ?",
    [id],
    (error, results, fields) => {
      console.log(results);
      error
        ? res.status(500).json(new ServerResponse(0, error))
        : results.length
        ? res.status(500).json(new ServerResponse(1, results))
        : res.status(404).json(new ServerResponse(0, "blog not found"));
    }
  );
});

// update
router.put("/", isAuth, (req, res, next) => {
  // console.log(Object.keys(req.body));
  const fieldsToUpdate = Object.keys(req.body);
  // console.log(fieldsToUpdate.contains("id"));
  if (fieldsToUpdate.length < 2 || !fieldsToUpdate.includes("id")) {
    console.log("bad request");
    res.status(400).json(new ServerResponse(0, "missing fields"));
  } else {
    console.log("good request");
    const newFields = fieldsToUpdate.filter((field) => field !== "id");
    console.log(newFields);

    const sqlQuery =
      generateSQLQuery("update", "blogs", newFields) + "WHERE id = ?";
    console.log(sqlQuery);

    // connection.query(sqlQuery, []);
    const prepStatementsParams = generatePSParams(
      newFields,
      req.body,
      req.body.id
    );
    console.log(prepStatementsParams);

    connection.query(
      sqlQuery,
      prepStatementsParams,
      (error, results, fields) => {
        if (error) {
          console.log("error: ", error);
          res.status(500).json(new ServerResponse(0, error));
        } else if (!results.affectedRows) {
          console.log(results);
          res.status(400).json(new ServerResponse(0, results));
        } else {
          console.log(results);
          res.status(200).json(new ServerResponse(1, results));
        }
      }
    );
  }
});

// delete
router.delete("/:id", isAuth, (req, res, next) => {
  // TODO - use results.affectedRows to check for success or failure
  connection.query(
    "DELETE FROM `blogs` WHERE id = ?",
    [req.params.id],
    (error, results, fields) => {
      error
        ? res.status(500).json(new ServerResponse(0, error))
        : !results.affectedRows
        ? res.status(400).json(new ServerResponse(0, results))
        : res.status(200).json(new ServerResponse(1, results));
    }
  );
});

module.exports = router;
