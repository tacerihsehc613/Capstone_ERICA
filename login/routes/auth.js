const express = require("express");
//로그인 과정을 쉽게 처리할 수 있게 도와주는 패키지
const passport = require("passport");
const bcrypt = require("bcrypt");

const User = require("../models/user");

const { isLoggedIn, isNotLoggedIn } = require("./middlewares");

const router = express.Router();

//회원가입 라우터
//로그인을 하지 않은 사람만 회원가입을 할 수 있다
router
  .route("/register")
  //가져오기
  .get((req, res, next) => {
    res.render("signup");
  })
  //등록하기
  .post(isNotLoggedIn, async (req, res, next) => {
    const { userID, password, name, birthDate, gender, area } = req.body;
    try {
      //기존에 ID로 가입한 사람이 있는지 확인한다
      const exUser = await User.findOne({ where: { userID: req.body.userID } });
      if (exUser) {
        //같은 ID로 가입한 사람이 있다면
        return res.redirect("./register?error=exist"); //존재한다고 알려줌(나중에 수정)
      }

      //ID가 db에 없다면 회원가입을 한다. 비밀번호를 저장할때 해쉬화해서 저장한다
      const hash = await bcrypt.hash(password, 12);
      await User.create({
        userID,
        password: hash,
        name,
        birthDate,
        gender,
        area,
        last_login: Date.now(),
      });

      //다시 메인페이지로 돌려보낸다
      return res.redirect("/");
    } catch (err) {
      console.error(err);
      return next(err);
    }
  });

//로그인 라우터(index.js삭제,)
router.post("/login", isNotLoggedIn, (req, res, next) => {
  //passport가 localStrategy를 찾는다
  //사용자가 제출한 폼 데이터 검사를 한다. 검사 성공시 done()함수 호출
  //done(에러객체,유저객체,로그인 실패 시 메시지)
  passport.authenticate("local", (authError, user, info) => {
    if (authError) {
      console.error(authError);
      return next(authError);
    }
    //req.user객체가 없다면
    if (!user) {
      //로그인 실패시 메시지를 담아서 프론트에게 보내준다
      return res.redirect(`/?loginError=${info.message}`);
    }
    //req.loogin()함수는 passport index.js로 간다
    return req.login(user, (loginError) => {
      //index.js의 done함수 실행시 콜백함수 실행
      if (loginError) {
        console.error(loginError);
        return next(loginError);
      }
      //세션 쿠키를 브라우저로 보내준다
      //에러 없으면 로그인 성공
      User.update(
        { last_login: new Date() },
        { where: { userID: req.body.userID } }
      )
        .then(() => {
          console.log("Update successful");
        })
        .catch((err) => {
          console.error("Update failed", err);
        });

      return res.redirect("/main"); //redirect->get(2023.4.1)
    });
  })(req, res, next);
});

//로그인 한 사람만 로그아웃 할 수 있게 해야한다
router.get("/logout", isLoggedIn, (req, res) => {
  req.logout(); //세션 쿠키가 사라진다
  req.session.destroy();
  res.redirect("/");
});

module.exports = router;
