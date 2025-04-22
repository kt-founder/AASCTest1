const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const bitrixRouter = require("./routes/bitrix.route");

dotenv.config();

const app = express();

// ✅ Bật CORS 
app.use(cors({
  origin: "http://localhost:3333",
}));
app.head('/', (req, res) => {
  // Trả về mã trạng thái 200 OK cho yêu cầu HEAD
  res.status(200).send();
});

// Các route khác của bạn (ví dụ: /install, /oauth/callback)
app.get('/install', (req, res) => {
  res.send('Install page');
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/", bitrixRouter);

app.listen(process.env.PORT, () => {
  console.log(`🚀 Server is running on port ${process.env.PORT}`);
});
