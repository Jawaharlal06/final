import mongoose from "mongoose";

const textContentSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
    },

  text: {
     type: String,
     required: true 
     },
  createdAt: { type: Date, default: Date.now }
});

export const Text = mongoose.model("text", textContentSchema);