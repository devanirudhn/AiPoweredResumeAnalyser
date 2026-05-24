import exp from "express";
import { userModel } from "../Schema/userSchema.js"
import { hash, compare } from "bcryptjs";
import { config } from "dotenv";
config();
import jwt from "jsonwebtoken";
import { verifyToken } from "../middlewares/verifyToken.js";
const {sign} = jwt;



export const userapp = exp.Router();


//  REGISTER
userapp.post("/users", async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body;

    // validation
    if (!firstname || !email || !password) {
      return res.status(400).json({ message: "All required fields missing" });
    }

    // check existing
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    // hash password
    const hashedPassword = await hash(password, 12);

    // create user
    const newUser = new userModel({
      firstname,
      lastname,
      email,
      password: hashedPassword
    });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


//  LOGIN
userapp.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // find user
    const user = await userModel.findOne({ email });

    // check user exists
    if (!user) {
      return res.status(400).json({ message: "Invalid email" });
    }

    // compare password
    const isMatched = await compare(password, user.password);

    if (!isMatched) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // create token
    const signedToken = sign(
      { userId: user._id, email: user.email },
      process.env.SECRET_KEY,
      { expiresIn: "7d" }
    );

    // remove password
    const userObj = user.toObject();
    delete userObj.password;

    // send response
    res.status(200).json({
      message: "Login successful",
      token: signedToken,
      user: userObj
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/// logout


// ======================================
// LOGOUT
// ======================================

userapp.post(

  "/logout",

  (req, res) => {

    res.status(200).json({

      message: "Logout successful"
    });
  }
);