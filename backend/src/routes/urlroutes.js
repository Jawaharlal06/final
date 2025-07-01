import express from "express";
import { Router } from "express";
import { addurls } from "../controller/urlcontroller.js";
import { verifyJWT } from "../middleware/authmiddleware.js";
import { myurls } from "../controller/urlcontroller.js";
import { deleteurl } from "../controller/urlcontroller.js"; 
const router = express.Router();

router.route("/add").post(verifyJWT, addurls);
router.get("/myurls", verifyJWT, myurls);
router.delete("/delete/:id", verifyJWT, deleteurl);

export default router;