const mongoose = require("mongoose");
require("dotenv").config();
const db = process.env.DB;

mongoose.set("strictQuery", true);
mongoose
  .connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to database successfully"))
  .catch((e) => console.log(e));
