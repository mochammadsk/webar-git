module.exports = (app) => {
  const user = require("../controllers/user.controllers");
  const { register } = require("../controllers/user.controllers");
  const auth = require("../controllers/userAuth.controller");
  const validateRegistration = require("../middelware/validateRegristation");
  const r = require("express").Router();

  // Register account
  r.post("/signup", validateRegistration, (req, res) => {
    const data = req.body;
    register(data)
      .then((result) => res.status(200).json(result))
      .catch((error) => res.status(400).json(error));
  });

  // Verification email for register account
  r.get("/verify/:uniqueString", user.verifyEmail);

  // Login account
  r.post("/signin", auth.handleLogin);

  // Password reset
  r.post("/forgot-password", (req, res) => {
    user.resetPassword(req, res);
  });

  // Verification email for password rest
  r.post("/verify", (req, res) => {
    user.verifyResetPassword(req, res);
  });

  // Update data
  r.put("/update/:id", user.update);

  // Delete data
  r.delete("/delete/:id", user.delete);

  // Google Auth
  r.get("/auth/google", user.googleAuthRedirect);
  r.get("/auth/google/callback", user.googleAuthCallback);

  app.use("/user", r);
};
