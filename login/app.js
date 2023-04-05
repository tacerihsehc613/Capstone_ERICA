const express = require("express");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const path = require("path");
const morgan = require("morgan");
const nunjucks = require("nunjucks");
const dotenv = require("dotenv");
const passport = require("passport");

dotenv.config();

const { sequelize } = require("./models");
const indexRouter = require("./routes");
//const registerRouter = require("./routes/register");
const authRouter = require("./routes/auth");
const mainRouter = require("./routes/main");
const passportConfig = require("./passport");

//express로부터 app을 가져온다
const app = express();

//3001번 port setting
app.set("port", process.env.PORT || 3001);

app.set("view engine", "html");
nunjucks.configure("views", {
  express: app,
  watch: true,
});

//node에서 mysql연결이 된다(sequelize를 통해서)
sequelize
  .sync({ force: false })
  .then(() => {
    console.log("데이터베이스 연결 성공");
  })
  .catch((err) => {
    console.error(err);
  });
passportConfig();

app.use(morgan("dev")); //서버로 들어온 요청과 응답을 기록해주는 미들웨어
//app.use(express.static(path.join(__dirname, "public")));
app.use(express.json()); //클라이언트에서 json데이터를 보냈을 때  json데이터 파싱
app.use(express.urlencoded({ extended: false })); //클라이언트에서 form data보낼때 form 파싱하며 이미지,url은 처리 못한다

app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
      httpOnly: true,
      secure: false,
    },
  })
);

app.use(passport.initialize());
//로그인 후에는 그 다음 요청부터 passport.session()을 실행한다
app.use(passport.session());

app.use("/", indexRouter);
//app.use("/register", registerRouter);
app.use("/auth", authRouter);
app.use("/main", mainRouter);

//클라이언트가 잘못된 url로 들어갔을때 404에러를 보낸다
app.use((req, res, next) => {
  const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
  error.status = 404;
  next(error);
});

//서버에러
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV !== "production" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});

//서버를 시작하고, 클라이언트로부터 들어오는 HTTP 요청을 수신하여 처리
app.listen(app.get("port"), () => {
  console.log(app.get("port"), "번 포트에서 대기 중");
});
