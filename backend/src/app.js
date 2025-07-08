import express from "express"
import cors from "cors"
import userRoutes from "./routes/userRoutes.js";
import urlRoutes from "./routes/urlRoutes.js";
import textRoutes from "./routes/textRoutes.js";
import cookieParser from "cookie-parser";

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.get("/", (req, res) => {
  res.send("API is working!");
});

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


app.use("/api/users", userRoutes);
app.use("/api/urls", urlRoutes);
app.use("/api/texts", textRoutes);

export {app}