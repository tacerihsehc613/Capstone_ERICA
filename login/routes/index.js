const express = require("express");

const router = express.Router();

//GET /라우터
router.route("/").get((req, res) => {
  res.render("index");
});

module.exports = router;
