const User = require("../models/user.models");
const UserVerification = require("../models/userVerification");
const sendVerificationEmail = require("../services/email.services");
const response = require("../config/response");
const { google } = require("googleapis");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
const argon2 = require("argon2");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");

dotenv.config();

// Register account
exports.register = (data) =>
  new Promise((resolve, reject) => {
    console.log("Starting registration process...");
    User.findOne({ userName: data.userName })
      .then((user) => {
        if (user) {
          reject(response.commonErrorMsg("Username already exists!"));
        } else {
          console.log("User not found. Proceeding with registration...");

          // Hash password
          argon2
            .hash(data.password)
            .then((hash) => {
              console.log("Password hashed successfully.");
              data.password = hash;
              data.role = data.role || 2;
              data.verified = false;
              User.create(data)
                .then((createdUser) => {
                  console.log("User created successfully:", createdUser);

                  // Create verification token
                  const uniqueString = uuidv4() + createdUser._id;
                  bcrypt
                    .hash(uniqueString, 10)
                    .then((hashedUniqueString) => {
                      const newVerification = new UserVerification({
                        userId: createdUser._id,
                        uniqueString: hashedUniqueString,
                        expiresAt: Date.now() + 3600000, // 1 hour
                      });

                      newVerification
                        .save()
                        .then(() => {
                          // Send verification email
                          sendVerificationEmail(
                            createdUser.email,
                            createdUser.userName,
                            uniqueString
                          )
                            .then(() => {
                              console.log(
                                "Verification email sent successfully."
                              );
                              resolve(
                                response.commonSuccessMsg(
                                  "Successful registration! Please verify your email."
                                )
                              );
                            })
                            .catch((error) => {
                              console.error(
                                "Error sending verification email:",
                                error
                              );
                              resolve(
                                response.commonSuccessMsg(
                                  "Successful registration! Verification email could not be sent."
                                )
                              );
                            });
                        })
                        .catch((error) => {
                          console.error(
                            "Error saving user verification:",
                            error
                          );
                          reject(
                            response.commonErrorMsg(
                              "Failed to save verification data!"
                            )
                          );
                        });
                    })
                    .catch((error) => {
                      console.error(
                        "Error hashing verification string:",
                        error
                      );
                      reject(
                        response.commonErrorMsg(
                          "Failed to hash verification string!"
                        )
                      );
                    });
                })
                .catch((error) => {
                  console.error("Error creating user:", error);
                  reject(response.commonErrorMsg("Registration failed!"));
                });
            })
            .catch((error) => {
              console.error("Error hashing password:", error);
              reject(response.commonErrorMsg("Password hashing failed!"));
            });
        }
      })
      .catch((error) => {
        console.error("Error finding user:", error);
        reject(response.commonErrorMsg("Failed to find user!"));
      });
  });

// Verification email
exports.verifyEmail = (req, res) => {
  const { uniqueString } = req.params;

  UserVerification.findOne({})
    .then((record) => {
      if (record) {
        bcrypt.compare(uniqueString, record.uniqueString, (err, isMatch) => {
          if (err) {
            console.error("Error comparing unique strings:", err);
            return res
              .status(500)
              .json(response.commonErrorMsg("Error verifying email"));
          }
          if (isMatch) {
            const { userId } = record;
            User.updateOne({ _id: userId }, { verified: true })
              .then(() => {
                UserVerification.deleteOne({ _id: record._id })
                  .then(() => {
                    res
                      .status(200)
                      .json(
                        response.commonSuccessMsg(
                          "Email verified successfully!"
                        )
                      );
                  })
                  .catch((error) => {
                    console.error("Error deleting verification record:", error);
                    res
                      .status(500)
                      .json(
                        response.commonErrorMsg(
                          "Error deleting verification record"
                        )
                      );
                  });
              })
              .catch((error) => {
                console.error(
                  "Error updating user verification status:",
                  error
                );
                res
                  .status(500)
                  .json(
                    response.commonErrorMsg(
                      "Error updating user verification status"
                    )
                  );
              });
          } else {
            res
              .status(400)
              .json(
                response.commonErrorMsg("Invalid or expired verification link")
              );
          }
        });
      } else {
        res
          .status(400)
          .json(
            response.commonErrorMsg("Invalid or expired verification link")
          );
      }
    })
    .catch((error) => {
      console.error("Error verifying email:", error);
      res.status(500).json(response.commonErrorMsg("Error verifying email"));
    });
};

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
