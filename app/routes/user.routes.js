module.exports = (app) => {
  const user = require("../controllers/user.controllers");
  const r = require("express").Router();

  r.post("/register", (req, res) => {
    user
      .register(req.body)
      .then((result) => res.json(result))
      .catch((err) => res.json(err));
  });

  app.use("/user", r);
};
