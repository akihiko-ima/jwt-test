const express = require("express");
const app = express();
const PORT = 5000;
const auth = require("./routes/auth");
const post = require("./routes/post");

// jsonをexpressで使用できるようにする。
app.use(express.json());

// エンドポイントを指定する
app.use("/auth", auth);
app.use("/post", post);


app.get("/", (req, res) => {
  res.send("Hello express");
})

app.listen(PORT, () => {
  console.log("サーバーを起動中・・・ http://localhost:5000");
});
