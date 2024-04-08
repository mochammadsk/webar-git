module.exports = (app) => {
  const ar = require("../controllers/ar.controller");
  const r = require("express").Router();

  r.get("/", ar.findAllContent);
  //   r.get("/:id", ar.showContent);
  r.post("/", ar.createContent);

  app.use("/create", r);
};
