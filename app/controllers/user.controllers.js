const db = require("../models");
const User = db.user;

exports.create = (req, res) => {
  User.create(req.body)
    .then(() => res.send({ message: "Data succesfully input!" }))
    .catch((err) => res.status(500).send({ message: err.message }));
};

exports.findAll = (req, res) => {
  User.find()
    .then((data) => res.send(data))
    .catch((err) => res.status(500).send({ message: err.message }));
};

exports.show = (req, res) => {
  const id = req.params.id;

  User.findById(id)
    .then((data) => res.send(data))
    .catch((err) => res.status(500).send({ message: err.message }));
};

exports.update = (req, res) => {
  const id = req.params.id;

  User.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
    .then((data) => {
      if (!data) {
        res.status(404).send({ message: "Data can't update!" });
      }
      res.send({ message: "Data succesfully update!" });
    })
    .catch((err) => res.status(500).send({ message: err.message }));
};

exports.delete = (req, res) => {
  const id = req.params.id;

  User.findOneAndDelete(id)
    .then((data) => {
      if (!data) {
        res.status(404).send({ message: "Data can't delete!" });
      }
      res.send({ message: "Data succesfully delete!" });
    })
    .catch((err) => res.status(500).send({ message: err.message }));
};
