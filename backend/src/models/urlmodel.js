import mongoose from 'mongoose';

const urlSchema=new mongoose.Schema({

    userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  mainurl: {
    type: String,
    required: true,
  },
  suburl: {
    type: String,
    required: true,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  }
});

export const url=mongoose.model("url", urlSchema);