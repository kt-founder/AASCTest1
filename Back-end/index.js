const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const bitrixRouter = require("./routes/bitrix.route");

dotenv.config();

const app = express();

// ✅ Bật CORS cho tất cả frontend
app.use(cors({
  origin: "http://localhost:3333",
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/", bitrixRouter);

app.listen(process.env.PORT, () => {
  console.log(`🚀 Server is running on port ${process.env.PORT}`);
});
