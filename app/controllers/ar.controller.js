const ar = require("../models/ar.models");

// Kontroler untuk membuat konten baru
exports.createContent = async (req, res) => {
  try {
    const newContent = await ar.create(req.body);
    res.status(201).json(newContent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.findAllContent = async (req, res) => {
  try {
    const allContent = await ar.find();
    res.status(200).json(allContent);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// exports.showContent = (req, res) => {
//   const id = req.params.id;

//   ar.findById(id)
//     .then((data) => res.send(data))
//     .catch((err) => res.status(500).send({ message: err.message }));
// };
