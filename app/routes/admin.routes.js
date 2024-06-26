module.exports = (app) => {
  const admin = require("../controllers/admin.controllers");
  const { register } = require("../controllers/admin.controllers");
  const auth = require("../controllers/adminAuth.controller");
  const verification = require("../middelware/jwtVerify");
  const validateRegistration = require("../middelware/validateRegristation");
  const r = require("express").Router();
  const dotenv = require("dotenv");

  dotenv.config();

  // Register account
  const SECRET_CODE = process.env.SECRET_CODE;

  r.post("/signup", validateRegistration, (req, res) => {
    const { secretCode, ...data } = req.body;

    if (secretCode !== SECRET_CODE) {
      return res
        .status(403)
        .json({ message: "Forbidden: Invalid secret code" });
    }

    register(data)
      .then((result) => res.status(200).json(result))
      .catch((error) => res.status(400).json(error));
  });

  // Verification email for register account
  r.get("/verify/:uniqueString", admin.verifyEmail);

  // Login account
  r.post("/signin", auth.handleLogin);

  // Password reset
  r.post("/forgot-password", (req, res) => {
    admin.resetPassword(req, res);
  });

  // Verification email for password rest
  r.post("/verify", (req, res) => {
    admin.verifyResetPassword(req, res);
  });

  // Show data
  r.get("/list", verification, admin.findAll);
  r.get("/list/:id", admin.show);

  // Update data
  r.put("/update/:id", admin.update);

  // Delete data
  r.delete("/delete/:id", admin.delete);

  app.use("/admin", r);
};
