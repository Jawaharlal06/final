import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { User} from "../models/usermodel.js";
import { url } from "../models/urlmodel.js";
//import {uploadOnCloudinary} from "../utils/cloudinary.js"
import ApiResponse  from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";


const urlcontroller = async (req, res) => {
  try {
    const { mainurl, suburl } = req.body;
  
 const userId = req.user._id; // Provided by verifyJWT middleware

    if (!mainurl || !suburl) {
      return res.status(400).json({ message: "Both mainurl and suburl are required." });
    }
// Simple URL format check
const urlPattern = /^https?:\/\/.+/;
if (!urlPattern.test(mainurl) || !urlPattern.test(suburl)) {
  return res.status(400).json({ message: "Both URLs must be valid and start with http:// or https://" });
}
   

    const newUrl = await url.create({ userId, mainurl, suburl });
    res.status(201).json({ message: "URL mapping saved", data: newUrl });
    console.log("Saved URL mapping:", newUrl);
  } catch (error) {
    res.status(500).json({ message: "Failed to save URL mapping", error: error.message });
  }
};

export { urlcontroller };
//export default urlcontroller;