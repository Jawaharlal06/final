import express from "express";
import { Router } from "express";
import { urlcontroller } from "../controller/urlcontroller.js";
import { verifyJWT } from "../middleware/authmiddleware.js";

const router = express.Router();

router.route("/add").post(verifyJWT, urlcontroller);

export default router;