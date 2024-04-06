const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const db = require("./app/config/database");
const bodyParser = require("body-parser");

const app = express();
const corsOption = {
  origin: "*",
};

// Register cors middelware
app.use(cors(corsOption));
app.use(express.json());

app.use(
  bodyParser.json({
    extended: true,
    limit: "50mb",
  })
);

app.use(
  bodyParser.urlencoded({
    extended: true,
    limit: "50mb",
  })
);

// Connection to database
mongoose
  .connect(db.url, db.mongooseConfig)
  .then(() => console.log("Connected to database!"))
  .catch((err) => {
    console.log(`Failed to connect - ${err.message}`);
    process.exit();
  });

// Call routes
require("./app/routes/admin.routes")(app);
// require("./app/routes/user.routes")(app);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
