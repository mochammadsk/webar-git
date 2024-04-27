module.exports = (app) => {
  const subscribe = require("../controllers/subscription.controller");
  const r = require("express").Router();

  r.post("/subscribe", subscribe.subscribe);

  app.use("/subscribe", r);
};
