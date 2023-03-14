//사용자가 로그인했는지,안했는지 여부를 체크하는 미들웨어

exports.isLoggedIn = (req, res, next) => {
  //user객체가 있으면 next
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(403).send("로그인이 필요합니다");
  }
};

exports.isNotLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    next();
  } else {
    const message = encodeURIComponent("로그인한 상태입니다");
    res.redirect(`/?error=${message}`);
  }
};
