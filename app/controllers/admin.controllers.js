const Admin = require("../models/user.models");
const response = require("../config/response");
const argon2 = require("argon2");

exports.create = (data) =>
  new Promise((resolve, reject) => {
    Admin.findOne({ userName: data.userName })
      .then((user) => {
        if (user) {
          reject(response.commonErrorMsg("Username already exists!"));
        } else {
          if (!data.password) {
            reject(response.commonErrorMsg("Password is required!"));
          } else {
            argon2
              .hash(data.password)
              .then((hash) => {
                data.password = hash;
                Admin.create(data)
                  .then(() =>
                    resolve(
                      response.commonSuccessMsg("Successful registration!")
                    )
                  )
                  .catch(() =>
                    reject(response.commonErrorMsg("Registration failed!"))
                  );
              })
              .catch(() =>
                reject(response.commonErrorMsg("Password hashing failed!"))
              );
          }
        }
      })
      .catch(() => reject(response.commonErrorMsg("Failed to find user!")));
  });

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
