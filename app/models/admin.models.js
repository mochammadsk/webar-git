const mongoose = require("mongoose");

const adminSchema = mongoose.Schema(
  {
    nim: { type: Number, required: true },
    nama_lengkap: { type: String, required: true },
    university: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

adminSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

module.exports = mongoose.model("admin", adminSchema);
