const { User } = require("../db/User");
const router = require("express").Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const fsPromises = require("fs/promises");
const path = require("path");
const jwt = require("jsonwebtoken");

// ファイルパスを指定
const filePath = path.resolve("db", "User.js");

router.get("/", (req, res) => {
  res.send("hello Auth.Js");
});

// ユーザ新規登録用のAPI
router.post(
  "/register",
  // username must be an email
  body("email").isEmail(),
  // password must be at least 6 chars long
  body("password").isLength({ min: 6 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // reuestで来たプロパティの受け取り
    const { email, password } = req.body;

    // dbにユーザーが存在しているか確認
    const user = User.find((user) => user.email === email);
    if (user) {
      return res.status(400).json([
        {
          message: "すでにそのユーザーは存在しています。",
        },
      ]);
    }

    // パスワードの暗号化
    let hashedPassword = await bcrypt.hash(password, 10);
    // ==================================
    // dbへ保存
    // ==================================
    // 追加する要素
    const newUser = {
      email: email,
      password: hashedPassword,
    };

    // ファイルを非同期で読み込む
    try {
      const data = await fsPromises.readFile(filePath, "utf8");
      const { User } = eval(data);
      User.push(newUser);
      const updatedCode = `const User = ${JSON.stringify(
        User,
        null,
        2
      )};\n\nmodule.exports = { User };`;
      await fsPromises.writeFile(filePath, updatedCode, "utf8");
      console.log("要素が追加されました。");
    } catch (err) {
      console.error("ファイルの操作エラー:", err);
    }

    // クライアントへJWTを発行する
    const token = await jwt.sign(
      {
        email,
      },
      "SECRET_KEY",
      {
        expiresIn: "24h",
      }
    );

    return res.json({
      token: token,
    });
  }
);

// ログイン用のAPI
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = User.find((user) => user.email === email);
  if (!user) {
    return res.status(400).json([
      {
        message: "そのユーザーは存在しません",
      },
    ]);
  }

  // パスワードの複合と照合
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json([
      {
        message: "パスワードが異なります",
      },
    ]);
  }

  // クライアントへJWTを発行する
  const token = await jwt.sign(
    {
      email,
    },
    "SECRET_KEY",
    {
      expiresIn: "1d",
    }
  );
  
  return res.json({
    token: token,
  });
  
});

// dbのユーザーを確認するAPI
router.get("/allUsers", (req, res) => {
  return res.json(User);
});

module.exports = router;
