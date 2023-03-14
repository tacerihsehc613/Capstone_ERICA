const passport = require("passport");
const local = require("./localStrategy");
//const kakao = require("./kakaoStrategy");
const User = require("../models/user");

module.exports = () => {
  //auth.js에서 user객체 받아와서 seriallizeUser함수 실행
  //seriallizeUser:사용자 객체의 일부를 세션에 저장한다
  passport.serializeUser((user, done) => {
    done(null, user.id); //세션에 user의 id만 저장한다
    //auth.js실행
  });

  //세션에 저장된 사용자 ID를 복원하여 사용자 객체를 조회하여 req.user에 할당한다
  passport.deserializeUser((id, done) => {
    User.findOne({ where: id })
      .then((user) => done(null, user)) //req.user,req.isAuthenticated()
      .catch((err) => done(err));
  });

  local();
  //kakao();
};
