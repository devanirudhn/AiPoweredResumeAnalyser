import express from "express";

import mongoose from "mongoose";

import dotenv from "dotenv";

import cors from "cors";

import cookieParser from "cookie-parser";

import helmet from "helmet";

// import mongoSanitize from "express-mongo-sanitize"; // disabled due to incompatibility with Express 5

import rateLimit from "express-rate-limit";

import { userapp }
from "./api/userapi.js";

import { resumeApp }
from "./api/resumeapi.js";

dotenv.config();

const app = express();


// =====================================
// CORS
// =====================================

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));


// =====================================
// MIDDLEWARES
// =====================================

app.use(helmet());

// app.use(mongoSanitize({ on: ["body", "params"] })); // sanitize body and params, ignore query (read‑only in Express 5)

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later."
});
app.use(apiLimiter);

app.use(cookieParser());

app.use(express.json());


// =====================================
// ROUTES
// =====================================

app.use("/userapi", userapp);

app.use("/resume", resumeApp);


// =====================================
// DATABASE CONNECTION
// =====================================

const connectdb = async () => {

  try {

    await mongoose.connect(
      process.env.DB_URL
    );

    console.log(
      "Database connected successfully"
    );

    const port =
      process.env.PORT || 3000;

    app.listen(port, () =>

      console.log(
        `Server listening on port ${port}`
      )
    );

  } catch (err) {

    console.log(
      "Error in DB connection:",
      err
    );
  }
};

connectdb();