const bcrypt = require("bcrypt");
const User = require("../models/users.js");
const jwt = require("jsonwebtoken");
require("dotenv").config();

//Signup route
const signup = async (req, res) => {
  try {
    const { fname, lname, email, password, cpassword } = req.body;

    if (!fname || !lname || !email || !password || !cpassword) {
      res
        .status(400)
        .json({ status: false, message: "Please fill all the fields." });
      return;
    }

    if (await User.findOne({ email })) {
      res.status(409).json({ status: false, message: "Email already exists" });
      return;
    }

    if (password !== cpassword) {
      res.status(400).json({
        status: false,
        message: "Password and Confirm password doesn't match.",
      });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({
      fname,
      lname,
      email,
      password: hashedPassword,
    });
    await newUser.save();
    res.status(201).json({ status: true, message: "Successfully registered" });
  } catch (err) {
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};

//Signin route
const signin = async (req, res) => {
  try {
    
    if(!req?.body?.email || !req?.body?.password){
      res.status(401).json({ status: false, message: "Please fill all the fields." });
      return
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      res.status(401).json({
        status: false,
        message: "Invalid email or password",
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({
        status: false,
        message: "Invalid email or password",
      });
      return;
    }

    const access_token = jwt.sign(
      { _id: user._id},
      process.env.ACCESS_TOKEN_SECRET,
      {expiresIn: "10m"}
    );
    const refresh_token = jwt.sign(
      { _id: user._id },
      process.env.REFRESH_TOKEN_SECRET,{expiresIn: "1 day"}
    );

    user.tokens = {
      accessToken: {
        token: access_token,
        expireAt: Date.now() + 10 * 60 * 1000,
      },
      refreshToken: {
        token: refresh_token,
        expireAt: Date.now() + 24 * 60 * 60 * 1000,
      },
    };

    await user.save();

    res.cookie("accessToken", access_token, {
      httpOnly: true,
      expires: new Date(Date.now() + 10 * 60 * 1000)
    });
    res.cookie("refreshToken", refresh_token, {
      httpOnly: true,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });

    res
      .status(200)
      .json({ status: true, message: "login successfully", _id: user._id , exp: `${Date.now() + 10 * 60 * 1000}`});
  } catch (error) {
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};

//logout route
const logout = (req, res) => {
  if(!req.cookies?.refreshToken){
    res.status(400).json({ status: false, message: "Refresh token is expired" });
    return;
  }
  jwt.verify(
    req.cookies.refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, user) => {
      if (err) {
        res.status(401).json({ status: false, message: "Unauthorized user" });
        return;
      }

      await User.findByIdAndUpdate(
        { _id: user._id },
        { tokens: {} },
        { new: true }
      );

      res
        .clearCookie("refreshToken")
        .status(200)
        .json({ status: true, message: "logout successfully" });
    }
  );
};

//Refresh-token route
const refresh_token = (req, res) => {

  if (!req?.cookies?.refreshToken) {
    return res
      .status(401)
      .json({ status: false, message: "Unauthorized user" });
  }

  try {
    const refreshToken = req.cookies.refreshToken;
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      async function (err, payload) {
        if (err) return res.status(401).json({status: false, message: "Invalid refresh token"});

        // retrieve the corresponding user record from the database
        const user = await User.findById({ _id: payload._id });
        if (!user)
          return res
            .status(401)
            .json({ status: false, message: "Unauthorized user" });

        const accessToken = jwt.sign(
          { _id: user._id },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: "10m" }
        );

        user.tokens.accessToken.token = accessToken;
        user.tokens.accessToken.expireAt = Date.now() + 10 * 60 * 1000;
        await user.save();

        res.cookie("accessToken", accessToken, { httpOnly: true, expires: new Date(Date.now() + 10 * 60 * 1000) });

        res.status(200).json({
          status: true,
          message: "New access token generated",
          _id: user._id,
          exp: `${Date.now() + 10 * 60 * 1000}`,
        });
      }
    );
  } catch (error) {
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};

module.exports = { signup, signin, logout, refresh_token };
