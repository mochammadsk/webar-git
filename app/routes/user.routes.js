module.exports = (app) => {
  const user = require("../controllers/user.controllers");
  const r = require("express").Router();

  r.post("/register", (req, res) => {
    user
      .register(req.body)
      .then((result) => res.json(result))
      .catch((err) => res.json(err));
  });

  r.post("/login", (req, res) => {
    user
      .login(req.body)
      .then((result) => res.json(result))
      .catch((err) => res.json(err));
  });

  r.get("/", user.findAll);
  r.delete("/:id", user.delete);

  r.get("/auth/google", user.googleAuthRedirect);
  r.get("/auth/google/callback", user.googleAuthCallback);

  app.use("/user", r);
};
