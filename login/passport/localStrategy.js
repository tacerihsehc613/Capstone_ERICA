const passport = require("passport");
const LocalStrategy = require("passport-local");
const bcrypt = require("bcrypt");

const User = require("../models/user");

module.exports = () => {
  passport.use(
    new LocalStrategy(
      {
        usernameField: "userID", //req.body.userID
        passwordField: "password", //req.body.password
      },
      async (userID, password, done) => {
        try {
          const exUser = await User.findOne({ where: { userID } }); //(수정)

          if (exUser) {
            //회원가입이 되어 있다면
            const result = await bcrypt.compare(password, exUser.password);
            if (result) {
              //비밀번호 일치시
              done(null, exUser);
            } else {
              done(null, false, { message: "비밀번호가 일치하지 않습니다" });
            }
          } else {
            //회원가입이 되어 있지 않다면(auth.js)
            done(null, false, { message: "가입되지 않은 회원입니다" });
          }
        } catch (error) {
          console.error(error);
          done(error);
        }
      }
    )
  );
};
