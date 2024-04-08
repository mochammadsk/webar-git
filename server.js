const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const db = require("./app/config/database");
const path = require("path");

const app = express();
const PORT = 8000;

const corsOption = {
  origin: "*",
};

// Register cors middelware
app.use(cors(corsOption));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

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
require("./app/routes/user.routes")(app);
require("./app/routes/ar.routes")(app);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "app/views", "index.html"));
});

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
