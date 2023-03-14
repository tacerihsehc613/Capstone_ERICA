const Sequelize = require("sequelize");
const User = require("./user");

const env = process.env.NODE_ENV || "development";
const config = require("../config/config")[env];
const db = {};

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

db.sequelize = sequelize;

db.User = User;

//위의 연결 객체인 sequelize, 연결객체를 init한다(테이블이랑 모델이랑 mysql연결)
User.init(sequelize);

module.exports = db;
