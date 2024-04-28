module.exports = (app) => {
  const admin = require("../controllers/admin.controllers");
  const auth = require("../controllers/auth.controller");
  const verification = require("../middelware/verifytoken");
  const r = require("express").Router();

  // Register account
  r.post("/register", (req, res) => {
    admin
      .create(req.body)
      .then((result) => res.json(result))
      .catch((err) => res.json(err));
  });

  // Login account
  r.post("/login", auth.handleLogin);

  // Show data
  r.get("/list", verification, admin.findAll);
  r.get("/list/:id", admin.show);

  // Update data
  r.put("/update/:id", admin.update);

  // Delete data
  r.delete("/delete/:id", admin.delete);

  app.use("/admin", r);
};
