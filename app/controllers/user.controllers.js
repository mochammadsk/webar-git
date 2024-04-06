const User = require("../models/user.models");
const response = require("../config/response");
const bcrypt = require("bcrypt");

exports.register = (data) =>
  new Promise((resolve, reject) => {
    User.findOne({ userName: data.userName })
      .then((user) => {
        if (user) {
          resolve(response.commonErrorMsg("username already exists!"));
        } else {
          bcrypt.hash(data.password, 10, (err, hash) => {
            if (err) {
              reject(response.commonErrorMsg);
            } else {
              data.password = hash;
              User.create(data)
                .then(() =>
                  resolve(response.commonSuccessMsg("Successful registration!"))
                )
                .catch(() =>
                  reject(response.commonErrorMsg("Registration failed!"))
                );
            }
          });
        }
      })
      .catch(() => reject(response.commonErrorMsg));
  });
