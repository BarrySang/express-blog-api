const express = require("express");
const router = express.Router();
const connection = require("../Db");
const {
  generatePSParams,
  generateSQLQuery,
  isAuth,
} = require("../lib/lib-functions");

// create
router.post("/", isAuth, (req, res) => {
  const { user_id, title, body } = req.body;

  console.log(req.body);

  // check for empty fields
  if (!user_id || !title || !body) {
    const serverResponse = {
      success: 0,
      data: "missing fields",
    };

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
          const serverResponse = {
            success: 0,
            data: error,
          };
          res.status(500).json(serverResponse);
        } else {
          const serverResponse = {
            success: 1,
            data: "data entered succesfully",
          };
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
      console.log(error);
    } else {
      console.log(results);
    }
  });

  const serverResponse = {
    success: 1,
    data: "request succesful",
  };
  res.status(200).json({ serverResponse });
});

// read one
router.get("/:id", (req, res) => {
  const id = req.params.id;

  connection.query(
    "SELECT * FROM `blogs` WHERE `id` = ?",
    [id],
    (error, results, fields) => {
      error
        ? console.log("error: ", error)
        : console.log("results ", results[0].id);
    }
  );

  res.status(200).json({
    success: 1,
    data: "request succesful",
  });
});

// update
router.put("/", (req, res, next) => {
  // console.log(Object.keys(req.body));
  const fieldsToUpdate = Object.keys(req.body);
  // console.log(fieldsToUpdate.contains("id"));
  if (fieldsToUpdate.length < 2 || !fieldsToUpdate.includes("id")) {
    console.log("bad request");
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
        } else {
          console.log(results);
        }
      }
    );
  }

  res.status(200).json({
    success: 1,
    data: "request succesful",
  });
});

// delete
router.delete("/:id", (req, res, next) => {
  // TODO - use results.affectedRows to check for success or failure
  connection.query(
    "DELETE FROM `blogs` WHERE id = ?",
    [req.params.id],
    (error, results, fields) => {
      error ? console.log("error: ", error) : console.log("results: ", results);
    }
  );

  res.status(200).json({
    success: 2,
    data: "request succesful",
  });
});

module.exports = router;
