const dbConfig = require("../config/database.js");
const mongoose = require("mongoose");

module.exports = {
  mongoose,
  url: dbConfig.url,
  user: require("./user.models.js")(mongoose),
};
