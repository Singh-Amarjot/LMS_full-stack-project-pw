// importing  express
import express from "express";
// importing and congiguring dotenv
import dotenv from "dotenv";
dotenv.config();
// importing cors
import cors from "cors";
// importing userRouter
import userRouter from "./routes/userRoutes.js";
// importing courseRouter
import courseRouter from "./routes/courseRoutes.js";
// importing morgan to use it as a logger
import morgan from "morgan";
// importing cookie_parser
import cookieParser from "cookie-parser";
// importing errormiddleware
import errorMiddleware from "./middlewares/error.middleware.js";
// creating an app using express

const app = express();

const corsOptions = {
  origin: "*",
  credentials: true,
};

// setting up middlewares
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan("dev"));

// handling routes
app.use("/api/v1/user", userRouter);
app.use("/api/v1/course", courseRouter);

app.all("*", (req, res) => {
  res.status(404).send("OOPS! the request page not found !");
});

app.use(errorMiddleware);
// exporting the app
export default app;
