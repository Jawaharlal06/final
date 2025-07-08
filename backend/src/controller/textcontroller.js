import path from "path";
import { fileURLToPath } from "url";
import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { User} from "../models/usermodel.js";
import { url } from "../models/urlmodel.js";
import ApiResponse  from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";
import { Text } from "../models/textmodel.js";
import { spawn } from "child_process";
import axios from "axios";

export const addtext = async (req, res) => {
  try {
    const userId = req.user._id;
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "Text is required" });

    const newText = await Text.create({ userId, text });
    res.status(201).json({ message: "Text saved", data: newText });
  } catch (error) {
    res.status(500).json({ message: "Failed to save text", error: error.message });
  }
};

export const gettext = async (req, res) => {
  try {
    const userId = req.user._id;
    const texts = await Text.find({ userId });
    res.status(200).json({ texts });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch texts", error: error.message });
  }
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//import path from "path";
// Google search using SerpAPI Python script
export const googleSearch = async (req, res) => {
  try {
    const { query, type } = req.body;
    if (!query) return res.status(400).json({ message: "Query is required" });

    // Default to "all" if not specified
    const searchType = (type === "images" || type === "videos" || type === "articles") ? type : "all";

    const scriptPath = path.join(__dirname, "../utils/serpapiScript.py");
    const py = spawn("python", [scriptPath,searchType,  query]);

    let data = "";
    let error = "";

    py.stdout.on("data", (chunk) => {
      data += chunk.toString();
    });

    py.stderr.on("data", (chunk) => {
      error += chunk.toString();
    });

    py.on("close", (code) => {
      if (code !== 0 || error) {
        return res.status(500).json({ message: "Python script error", error });
      }
      try {
        const results = JSON.parse(data);
        res.status(200).json({ results });
      } catch (e) {
        res.status(500).json({ message: "Failed to parse Python output", error: e.message });
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to perform Google search", error: error.message });
  }
};

// OpenAI API content analysis endpoint
/*export const openaiAnalyze = async (req, res) => {
  try {
    const { urls, topic } = req.body;
    if (!urls || urls.length === 0) {
      return res.status(400).json({ message: "urls are required" });
    }
    if(!topic || topic.length === 0) {
      return res.status(400).json({ message: "Video topic is required" });
    }

    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return res.status(500).json({ message: "OpenAI API key not set in environment" });
    }

    // You can customize the prompt as needed
    const userPrompt = prompt || `Summarize the following content:\n\n${content}`;

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo", // or "gpt-4" if you have access
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: userPrompt }
        ],
        max_tokens: 512
      },
      {
        headers: {
          "Authorization": `Bearer ${openaiApiKey}`,
          "Content-Type": "application/json"
        },
        timeout: 60000
      }
    );

    const result = response.data;
    const analysis = result.choices?.[0]?.message?.content || "";
    res.status(200).json({ analysis });
  } catch (error) {
    res.status(500).json({ message: "Failed to analyze content with OpenAI", error: error.message });
  }
};*/

export const openaiAnalyze = asyncHandler(async (req, res) => {
  // Using a Promise to handle the async nature of spawn within asyncHandler
  return new Promise((resolve, reject) => {
    const { urls, topic } = req.body;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return reject(new ApiError(400, "An array of URLs is required."));
    }
    if (!topic || typeof topic !== 'string' || topic.trim() === '') {
      return reject(new ApiError(400, "A video topic is required."));
    }

    const openaiApiKey = process.env.DEEPSEEK_API_KEY;
    if (!openaiApiKey) {
      // The Python script reads this from the environment, but this is a good fail-fast check.
      return reject(new ApiError(500, "OpenAI API key not set in server environment."));
    }
    
    const scriptPath = path.join(__dirname, "../utils/extraction_url.py");
    // The python script expects the key "video_topic"
    const inputData = JSON.stringify({ urls, video_topic: topic });

    const py = spawn("python", [scriptPath, inputData]);

    let data = "";
    let error = "";

    py.stdout.on("data", (chunk) => {
      data += chunk.toString();
    });

    py.stderr.on("data", (chunk) => {
      error += chunk.toString();
    });

    py.on("close", (code) => {
      if (code !== 0) {
        console.error(`Python script error (code ${code}): ${error}`);
        // Send the Python error back to the client for better debugging
        return reject(new ApiError(500, `Analysis script failed: ${error || 'Unknown error'}`));
      }
      try {
        const results = JSON.parse(data);
        res.status(200).json(new ApiResponse(200, results, "Content analyzed successfully."));
        resolve();
      } catch (e) {
        console.error(`Failed to parse Python output: ${e.message}`);
        console.error(`Raw output from script: ${data}`);
        reject(new ApiError(500, "Failed to parse analysis results from script."));
      }
    });

    py.on('error', (err) => {
        console.error('Failed to start subprocess.', err);
        reject(new ApiError(500, 'Failed to start analysis script. Is Python installed and in the PATH?'));
    });
  });
});
