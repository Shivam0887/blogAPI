const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/users");

// Authenticate user - logged in or not
const authenticateUser = (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res
      .status(401)
      .json({ status: false, message: "Unauthorized user" });
  }

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, details) => {
      if (err)
        return res
          .status(401)
          .json({ status: false, message: "Unauthorized user", error: err });

      try {
        if (!(await User.findById({ _id: details._id })))
          res.status(401).json({ status: false, message: "Unauthorized user" });
        next();
      } catch (err) {
        return res
          .status(500)
          .json({
            status: false,
            message: "Internal server error",
            error: err,
          });
      }
    }
  );
};

module.exports = authenticateUser;
