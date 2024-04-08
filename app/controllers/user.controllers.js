const User = require("../models/user.models");
const response = require("../config/response");
const argon2 = require("argon2");

exports.register = (data) =>
  new Promise((resolve, reject) => {
    User.findOne({ userName: data.userName })
      .then((user) => {
        if (user) {
          reject(response.commonErrorMsg("Username already exists!"));
        } else {
          // Hash password
          argon2
            .hash(data.password)
            .then((hash) => {
              data.password = hash;
              User.create(data)
                .then(() =>
                  resolve(response.commonSuccessMsg("Successful registration!"))
                )
                .catch(() =>
                  reject(response.commonErrorMsg("Registration failed!"))
                );
            })
            .catch(() =>
              reject(response.commonErrorMsg("Password hashing failed!"))
            );
        }
      })
      .catch(() => reject(response.commonErrorMsg("Failed to find user!")));
  });

exports.login = (data) =>
  new Promise((resolve, reject) => {
    User.findOne({
      userName: data.userName,
    }).then((user) => {
      if (user) {
        // Verifikasi password
        argon2
          .verify(user.password, data.password)
          .then((match) => {
            if (match) {
              resolve(response.commonResult(user));
            } else {
              reject(response.commonErrorMsg("Wrong password!"));
            }
          })
          .catch(() => {
            reject(response.commonErrorMsg("Failed to verify password!"));
          });
      } else {
        reject(response.commonErrorMsg("Username not found!"));
      }
    });
  });

exports.findAll = (req, res) => {
  User.find()
    .then((data) => res.send(data))
    .catch((err) => res.status(500).send({ message: err.message }));
};

exports.delete = (req, res) => {
  const id = req.params.id;

  User.findOneAndDelete(id)
    .then((data) => {
      if (!data) {
        res.status(404).send({ message: "Data can't be deleted!" });
      }
      res.send({ message: "Data deleted successfully!" });
    })
    .catch((err) => res.status(500).send({ message: err.message }));
};
