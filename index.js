const express = require("express");
const app = express();
const cors = require("cors");
require("./config/dbConnection.js");
const authRoutes = require("./routes/auth.js");
const blogRoutes = require("./routes/blogs.js");
const cookieParser = require("cookie-parser");

app.use(express.json());
app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/blogs", blogRoutes);

app.listen(8000, () => {
  console.log("Server started on localhost port no. 8000");
});
