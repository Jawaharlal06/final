import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { User} from "../models/usermodel.js";
import { url } from "../models/urlmodel.js";
//import {uploadOnCloudinary} from "../utils/cloudinary.js"
import ApiResponse  from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";


const addurls = async (req, res) => {
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
   
 // Check if the URL mapping already exists for this user
    const exists = await url.findOne({ userId, mainurl, suburl });
    if (exists) {
      return res.status(409).json({ message: "This URL mapping already exists." });
    }

    const newUrl = await url.create({ userId, mainurl, suburl });
    res.status(201).json({ message: "URL mapping saved", data: newUrl });
    console.log("Saved URL mapping:", newUrl);
  } 
  catch (error) {
    res.status(500).json({ message: "Failed to save URL mapping", error: error.message });
  }
};

 const myurls = async (req, res) => {
  try {
    const userId = req.user._id;
    // Only select mainurl and suburl fields
    const urls = await url.find({ userId }).select("mainurl suburl _id");
    res.status(200).json({ urls });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch URLs", error: error.message });
  }
};

const deleteurl = async (req, res) => {
  try {
    const userId = req.user._id;
    const urlId = req.params.id;

    // Find the URL and ensure it belongs to the logged-in user
    const urlDoc = await url.findOne({ _id: urlId, userId });
    if (!urlDoc) {
      return res.status(404).json({ message: "URL not found or not authorized" });
    }

    await url.deleteOne({ _id: urlId });
    res.status(200).json({ message: "URL deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete URL", error: error.message });
  }
};

import { scrapeWebpage } from "../utils/scrapeWebpage.js";

const extractContext = async (req, res) => {
  try {
    const { url: targetUrl } = req.body;
    if (!targetUrl) {
      return res.status(400).json({ message: "URL is required" });
    }
    const result = await scrapeWebpage(targetUrl);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  addurls,
  myurls,
  deleteurl,
  extractContext
};
//export default urlcontroller;