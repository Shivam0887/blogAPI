const express = require("express");
const router = express.Router();
const { signup, signin, logout, refresh_token }= require("../controllers/authController.js");

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/logout", logout);
router.post('/refresh_token', refresh_token);

module.exports = router;
