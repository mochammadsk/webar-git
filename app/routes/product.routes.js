module.exports = (app) => {
  const product = require("../controllers/product.controller");
  const r = require("express").Router();

  r.get("/", product.getAllProducts);
  r.get("/:productId", product.getProductById);
  r.post("/", product.createProduct);

  app.use("/products", r);
};
