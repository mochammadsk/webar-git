const dbConfig = require("../config/database.js");
const mongoose = require("mongoose");

module.exports = {
  mongoose,
  url: dbConfig.url,
  admin: require("./admin.models.js")(mongoose),
};
