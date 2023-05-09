const express = require("express");
const User = require("../models/user");
const { isLoggedIn, isNotLoggedIn } = require("./middlewares");
const { getWeather } = require("./weather");

const router = express.Router();

router.route("/").get(isLoggedIn, (req, res) => {
  getWeather(req, res, () => {});
  res.render("main");
});

module.exports = router; //이거 안작성해서 30분넘게 버림
