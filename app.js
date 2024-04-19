const express = require("express");
const cors = require("cors");
const flash = require("connect-flash");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();

const corsOption = {
  origin: "*",
};

const session = require("express-session");
app.use(
  session({
    secret: "rahasia",
    resave: false,
    saveUninitialized: true,
  })
);

// Middelware
app.use(flash());
app.use(express.json());
app.use(cors(corsOption));
app.use(express.urlencoded({ extended: true }));
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

// View Engine EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "app/views"));

// Call routes
require("./app/routes/admin.routes")(app);
require("./app/routes/user.routes")(app);

module.exports = app;
