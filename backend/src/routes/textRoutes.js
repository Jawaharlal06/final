import express from "express";
import { verifyJWT } from "../middleware/authmiddleware.js";
import { addtext, gettext, googleSearch, openaiAnalyze } from "../controller/textcontroller.js";

const router = express.Router();

router.post("/addtext", verifyJWT, addtext);
router.get("/mytext", verifyJWT, gettext);
router.post("/google-search", verifyJWT, googleSearch);
router.post("/openai-analyze", verifyJWT, openaiAnalyze);

export default router;