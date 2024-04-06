const { mongo } = require("mongoose");

module.exports = (mongoose) => {
  const schema = mongoose.Schema(
    {
      nim: Number,
      nama_lengkap: String,
      university: String,
    },
    {
      timestamps: true,
    }
  );

  schema.method("toJSON", function () {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;

    return object;
  });

  return mongoose.model("user", schema);
};
