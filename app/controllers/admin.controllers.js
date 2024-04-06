const db = require("../models");
const Admin = db.admin;

exports.create = (req, res) => {
  Admin.create(req.body)
    .then(() => res.send({ message: "Data entered successfully!" }))
    .catch((err) => res.status(500).send({ message: err.message }));
};

exports.findAll = (req, res) => {
  Admin.find()
    .then((data) => res.send(data))
    .catch((err) => res.status(500).send({ message: err.message }));
};

exports.show = (req, res) => {
  const id = req.params.id;

  Admin.findById(id)
    .then((data) => res.send(data))
    .catch((err) => res.status(500).send({ message: err.message }));
};

exports.update = (req, res) => {
  const id = req.params.id;

  Admin.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
    .then((data) => {
      if (!data) {
        res.status(404).send({ message: "Data can't be updated!" });
      }
      res.send({ message: "Data updated successfully!" });
    })
    .catch((err) => res.status(500).send({ message: err.message }));
};

exports.delete = (req, res) => {
  const id = req.params.id;

  Admin.findOneAndDelete(id)
    .then((data) => {
      if (!data) {
        res.status(404).send({ message: "Data can't be deleted!" });
      }
      res.send({ message: "Data deleted successfully!" });
    })
    .catch((err) => res.status(500).send({ message: err.message }));
};
