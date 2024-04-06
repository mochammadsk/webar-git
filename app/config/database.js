const mongoose = require("mongoose");

const dbConfig = {
  url: "mongodb://127.0.0.1:27017/webar_git",
  mongooseConfig: {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
  },
};

module.exports = dbConfig;
