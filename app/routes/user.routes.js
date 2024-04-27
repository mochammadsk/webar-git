module.exports = (app) => {
  const user = require("../controllers/user.controllers");
  const auth = require("../controllers/auth.controller");
  const verification = require("../middelware/verifytoken");
  const r = require("express").Router();

  // Register account
  r.post("/register", (req, res) => {
    user
      .register(req.body)
      .then((result) => res.json(result))
      .catch((err) => res.json(err));
  });

  // Login account
  r.post("/login", auth.handleLogin);

  // Show data
  r.get("/", verification, user.findAll);

  // Update data
  r.put("/:id", user.update);

  // Delete data
  r.delete("/:id", user.delete);

  // Google Auth
  r.get("/auth/google", user.googleAuthRedirect);
  r.get("/auth/google/callback", user.googleAuthCallback);

  app.use("/user", r);
};
