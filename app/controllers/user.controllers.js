const User = require("../models/user.models");
const response = require("../config/response");
const { google } = require("googleapis");
const jwt = require("jsonwebtoken");
const argon2 = require("argon2");
const dotenv = require("dotenv");

dotenv.config();

// Register account
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

// Login account
exports.login = async (data) => {
  try {
    const user = await User.findOne({ userName: data.userName });
    if (!user) {
      throw new Error("Username not found!");
    }

    const match = await argon2.verify(user.password, data.password);
    if (!match) {
      throw new Error("Wrong password!");
    }

    const token = jwt.sign({ userName: user.userName }, process.env.JWT_SECRET);
    return { message: "Login Successful", token };
  } catch (error) {
    throw new Error("Login Failed!");
  }
};

// Show data
exports.findAll = (req, res) => {
  User.find()
    .then((data) => res.send(data))
    .catch((err) => res.status(500).send({ message: err.message }));
};

// Update data
exports.update = (req, res) => {
  const id = req.params.id;

  User.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
    .then((data) => {
      if (!data) {
        res.status(404).send({ message: "Data can't be updated!" });
      }
      res.send({ message: "Data updated successfully!" });
    })
    .catch((err) => res.status(500).send({ message: err.message }));
};

// Delete data
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

// Login Google
const OAuth2 = google.auth.OAuth2;
const oauth2Client = new OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "http://localhost:8000/user/auth/google/callback"
);

exports.googleAuthRedirect = (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
    include_granted_scopes: true,
  });
  res.redirect(authUrl);
};

exports.googleAuthCallback = async (req, res) => {
  const { code } = req.query;
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    const userInfo = await google
      .oauth2({ version: "v2", auth: oauth2Client })
      .userinfo.get();

    // Simpan informasi pengguna ke dalam database
    User.findOneAndUpdate(
      { email: userInfo.data.email, fullName: userInfo.data.name, role: 2 },
      userInfo.data,
      { upsert: true, new: true } // Untuk membuat entri baru jika tidak ditemukan
    )
      .then((user) => {
        console.log("User Info:", user);
        res.send("Authentication successful!");
      })
      .catch((error) => {
        console.error("Error:", error);
        res.status(500).send("Failed to save user data!");
      });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Authentication failed!");
  }
};
