import express from "express";
import path from "path";
const app = express();
const port = 4000;

const __dirname = path.resolve();

app.use(express.static(path.join(__dirname, "images")));

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "src", "index.html"));
});

app.get("/*.css", (req, res) => {
  const filename = req.params[0];
  res.sendFile(path.join(__dirname, "src", `${filename}.css`));
});

app.get("/*.js", (req, res) => {
  const filename = req.params[0];
  res.sendFile(path.join(__dirname, "src", `${filename}.js`));
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
