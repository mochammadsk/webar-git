const Admin = require("../models/admin.models");
const AdminVerification = require("../models/adminVerification");
const AdminPasswordReset = require("../models/adminPassReset.models");
const sendVerificationEmail = require("../services/adminVerification.services");
const sendResetPasswordEmail = require("../services/adminPassReset.services");
const response = require("../config/response");
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
    Admin.findOne({ userName: data.userName })
      .then((admin) => {
        if (admin) {
          reject(response.commonErrorMsg("Username already exists!"));
        } else {
          console.log("User not found. Proceeding with registration...");

          // Hash password
          argon2
            .hash(data.password)
            .then((hash) => {
              console.log("Password hashed successfully.");
              data.password = hash;
              Admin.create(data)
                .then((createdAdmin) => {
                  console.log("User created successfully:", createdAdmin);

                  // Create verification token
                  const uniqueString = uuidv4() + createdAdmin._id;
                  bcrypt
                    .hash(uniqueString, 10)
                    .then((hashedUniqueString) => {
                      const newVerification = new AdminVerification({
                        adminId: createdAdmin._id,
                        uniqueString: hashedUniqueString,
                        expiresAt: Date.now() + 3600000, // 1 hour
                      });

                      newVerification
                        .save()
                        .then(() => {
                          // Send verification email
                          sendVerificationEmail(
                            createdAdmin.email,
                            createdAdmin.userName,
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
                            "Error saving admin verification:",
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
                  console.error("Error creating admin:", error);
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
        console.error("Error finding admin:", error);
        reject(response.commonErrorMsg("Failed to find admin!"));
      });
  });

// Verification email for register account
exports.verifyEmail = (req, res) => {
  const { uniqueString } = req.params;

  AdminVerification.findOne({})
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
            const { adminId } = record;
            Admin.updateOne({ _id: adminId }, { verified: true })
              .then(() => {
                AdminVerification.deleteOne({ _id: record._id })
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
                  "Error updating admin verification status:",
                  error
                );
                res
                  .status(500)
                  .json(
                    response.commonErrorMsg(
                      "Error updating admin verification status"
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
    const admin = await Admin.findOne({ userName: data.userName });
    if (!admin) {
      throw new Error("Username not found!");
    }

    const match = await argon2.verify(admin.password, data.password);
    if (!match) {
      throw new Error("Wrong password!");
    }

    // Check status account
    if (!admin.verified) {
      throw new Error("Email not verified!");
    }

    // Check status role
    if (admin.role !== 1) {
      throw new Error("Unauthorized role!");
    }

    const token = jwt.sign(
      { userName: admin.userName },
      process.env.JWT_SECRET
    );
    return { message: "Login Successful", token };
  } catch (error) {
    throw new Error("Login Failed!");
  }
};

// Password reset
exports.resetPassword = (req, res) => {
  const { email } = req.body;

  Admin.findOne({ email })
    .then((admin) => {
      if (!admin) {
        return res.status(404).json({ error: true, msg: "Admin not found" });
      }

      const resetToken = uuidv4();
      const hashedToken = bcrypt.hashSync(resetToken, 10);
      const expiresAt = Date.now() + 3600000; // 1 hour

      const newPasswordReset = new AdminPasswordReset({
        adminId: admin._id,
        resetToken: hashedToken,
        createdAt: Date.now(),
        expiresAt,
      });

      newPasswordReset
        .save()
        .then(() => {
          sendResetPasswordEmail(admin.email, admin.userName, resetToken)
            .then(() => {
              res
                .status(200)
                .json({ error: false, msg: "Password reset email sent" });
            })
            .catch((error) => {
              console.error("Error sending reset email:", error);
              res
                .status(500)
                .json({ error: true, msg: "Error sending reset email" });
            });
        })
        .catch((error) => {
          console.error("Error saving password reset record:", error);
          res
            .status(500)
            .json({ error: true, msg: "Error processing reset request" });
        });
    })
    .catch((error) => {
      console.error("Error finding user:", error);
      res
        .status(500)
        .json({ error: true, msg: "Error processing reset request" });
    });
};

// Verification email password reset
exports.verifyResetPassword = (req, res) => {
  const { resetToken, newPassword } = req.body;

  AdminPasswordReset.find()
    .then((passwordResets) => {
      const passwordReset = passwordResets.find((pr) =>
        bcrypt.compareSync(resetToken, pr.resetToken)
      );

      if (!passwordReset) {
        return res
          .status(400)
          .json({ error: true, msg: "Invalid reset token" });
      }

      const { adminId, expiresAt } = passwordReset;

      if (expiresAt < Date.now()) {
        return res
          .status(400)
          .json({ error: true, msg: "Reset token has expired" });
      }

      // Update user password
      Admin.findById(adminId)
        .then((admin) => {
          if (!admin) {
            return res
              .status(400)
              .json({ error: true, msg: "Admin not found" });
          }

          // Hash new password
          argon2
            .hash(newPassword)
            .then((hashedPassword) => {
              admin.password = hashedPassword;
              admin
                .save()
                .then(() => {
                  // Delete the password reset token from the database
                  AdminPasswordReset.deleteOne({ _id: passwordReset._id })
                    .then(() => {
                      res.status(200).json({
                        success: true,
                        msg: "Password reset successfully",
                      });
                    })
                    .catch((error) => {
                      console.error(
                        "Error deleting password reset token:",
                        error
                      );
                      res
                        .status(500)
                        .json({ error: true, msg: "Failed to reset password" });
                    });
                })
                .catch((error) => {
                  console.error("Error saving new password:", error);
                  res
                    .status(500)
                    .json({ error: true, msg: "Failed to reset password" });
                });
            })
            .catch((error) => {
              console.error("Error hashing new password:", error);
              res
                .status(500)
                .json({ error: true, msg: "Failed to reset password" });
            });
        })
        .catch((error) => {
          console.error("Error finding user:", error);
          res
            .status(500)
            .json({ error: true, msg: "Failed to reset password" });
        });
    })
    .catch((error) => {
      console.error("Error finding password reset token:", error);
      res.status(500).json({ error: true, msg: "Failed to reset password" });
    });
};

// Show data
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

// Update data
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

// Delete data
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
