import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import path, { resolve } from "path";
import { cloudinaryConfig } from "./configs/cloudinary";
import timeoutMiddleware from "./middlewares/timeout";
import routes from "./routes";

dotenv.config();
const app = express();

// middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cloudinaryConfig);
app.use(timeoutMiddleware);

// Routes
app.use("/api", routes);

// Commom api
app.get("/payment-result", (req, res) => {
  const { resultCode, orderId, amount, message } = req.query;

  res.render("payment-result", {
    resultCode,
    orderId,
    amount,
    message,
  });
});

app.get("/timeout/:second", async (req, res) => {
  try {
    const timeoutSecond = Number(req.params.second);
    await new Promise((resolve) => setTimeout(resolve, timeoutSecond * 1000));

    res.status(200).json({ msg: `Hoàn thành sau ${timeoutSecond} giây` });
  } catch (error) {
    res.status(500).json({ msg: "Lỗi trong quá trình xử lý" });
  }
});

// Database
import "./configs/database";

// EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Static
app.use(express.static(resolve(__dirname, "public")));

// Start server listening
const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(
    `${new Date().toLocaleString()}: Express is listening on port ${port}`,
  );
});
