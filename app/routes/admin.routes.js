module.exports = (app) => {
  const admin = require("../controllers/admin.controllers");
  const r = require("express").Router();

  r.post("/register", (req, res) => {
    admin
      .create(req.body)
      .then((result) => res.json(result))
      .catch((err) => res.json(err));
  });

  r.get("/", admin.findAll);
  r.get("/:id", admin.show);
  r.put("/:id", admin.update);
  r.delete("/:id", admin.delete);

  app.use("/admin", r);
};
