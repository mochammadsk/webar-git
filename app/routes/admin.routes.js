module.exports = (app) => {
  const admin = require("../controllers/admin.controllers");
  const r = require("express").Router();

  r.get("/", admin.findAll);
  r.get("/:id", admin.show);
  r.post("/", admin.create);
  r.put("/:id", admin.update);
  r.delete("/:id", admin.delete);

  app.use("/admin", r);
};
