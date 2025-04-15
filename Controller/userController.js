import { validationResult } from "express-validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../Models/user.js";
import HttpError from "../middlewares/httpError.js";

//Create Signup
export const signUp = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log("error", errors);
      return next(
        new HttpError(
          "Invalid data inputs passed, Please check your data before retry!",
          422
        )
      );
    }
    const {
      firstName,
      lastName,
      gender,
      dateOfBirth,
      phoneNumber,
      email,
      password,
      passwordConfirm,
      userRole,
    } = req.body;

    // Check if user already exists with the same email
    const existingEmailUser = await User.findOne({ email });
    if (existingEmailUser) {
      return res.status(401).json({
        status: "error",
        message: "Email already exists",
      });
    }

    // Check if user already exists with the same phone number
    const existingPhoneUser = await User.findOne({ phoneNumber });
    if (existingPhoneUser) {
      return res.status(401).json({
        status: "error",
        message: "Phone number already exists",
      });
    }

    //password Confirm matches password
    if (password !== passwordConfirm) {
      return next(new HttpError("Passwords do not match!", 400));
    }

    // Hash password before saving
    const saltRounds = parseInt(process.env.SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await User.create({
      firstName,
      lastName,
      gender,
      dateOfBirth,
      phoneNumber,
      email,
      password: hashedPassword,
      userRole,
    });

    // Generate JWT Token
    const token = jwt.sign(
      { userId: newUser._id, role: newUser.userRole },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
      }
    );

    res.status(201).json({
      status: true,
      message: "User registered successfully...!",
      data: newUser,
      access_token: token,
      access_token: token,
      user_role: logUser.userRole,
      userId:logUser.userId
    });
  } catch (err) {
    console.error(err);
    return next(
      new HttpError("Oops! Process failed, please contact admin", 500)
    );
  }
};

// Create Login
export const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log("error", errors);
      return next(
        new HttpError(
          "Invalid data inputs passed, Please check your data before retry!",
          422
        )
      );
    }

    const { email, password } = req.body;

    // Check if user exists
    const logUser = await User.findOne({ email });
    if (!logUser) {
      return res.status(401).json({
        status: "error",
        message: "User not found",
      });
    }

    // Compare hashed password
    const isPasswordValid = await bcrypt.compare(password, logUser.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: "error",
        message: "Incorrect password",
      });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { userId: logUser._id, role: logUser.userRole },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
      }
    );

    res.status(200).json({
      status: true,
      message: "User logged in successfully...!",
      data: logUser,
      access_token: token,
      user_role: logUser.userRole,
      userId:logUser._id
    });
  } catch (err) {
    console.error(err);
    return next(
      new HttpError("Oops! Process failed, please contact admin", 500)
    );
  }
};
