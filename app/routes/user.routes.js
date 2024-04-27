module.exports = (app) => {
  const user = require("../controllers/user.controllers");
  const auth = require("../controllers/auth.controller");
  const verification = require("../middelware/verifytoken");
  const r = require("express").Router();

  r.post("/register", (req, res) => {
    user
      .register(req.body)
      .then((result) => res.json(result))
      .catch((err) => res.json(err));
  });

  r.post("/login", auth.handleLogin);
  r.get("/", verification, user.findAll);
  r.put("/:id", user.update);
  r.delete("/:id", user.delete);

  r.get("/auth/google", user.googleAuthRedirect);
  r.get("/auth/google/callback", user.googleAuthCallback);

  app.use("/user", r);
};
