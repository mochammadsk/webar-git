const cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");
const flash = require("connect-flash");
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
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "app/views"));
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

// Call routes
require("./app/routes/admin.routes")(app);
require("./app/routes/user.routes")(app);
require("./app/routes/ar.routes")(app);

module.exports = app;
