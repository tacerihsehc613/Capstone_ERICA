const express = require("express");

const router = express.Router();

router.route("/").get((req, res, next) => {
  res.render("mypage");
});

module.exports = router;