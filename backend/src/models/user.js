import mongoose from 'mongoose';

const userSchema=new mongoose.Schema(
    {
        name:{
            type:String,
            required:[true,"name is required"],
        },
        email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false, // will NOT return password in queries by default
    },
},
{
    timestamps:true,
}
    
);