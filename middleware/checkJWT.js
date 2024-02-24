const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  // JWTを持っているか確認
  const token = req.header("x-auth-token");

  if (!token) {
    return res.status(400).json([
      {
        message: "閲覧権限がありません。",
      },
    ]);
  }

  try {
    let user = await jwt.verify(token, "SECRET_KEY");
    console.log(user);
    req.user = user.email;
    // 次のreq, resの処理へ移る
    next();
  } catch {
    return res.status(400).json([
      {
        message: "トークンが一致しません",
      },
    ]);
  }
};
