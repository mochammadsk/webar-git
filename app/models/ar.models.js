const mongoose = require("mongoose");

const arSchema = new mongoose.Schema({
  title: String,
  description: String,
  // Tambahkan bidang lain sesuai kebutuhan (misalnya, URL model 3D)
});

module.exports = mongoose.model("ar", arSchema);
