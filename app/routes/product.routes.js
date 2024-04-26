module.exports = (app) => {
  const product = require("../controllers/product.controller");
  const r = require("express").Router();

  r.get("/", product.getAllProducts);
  r.get("/:id", product.getProductById);
  r.post("/create", product.createProduct);
  r.put("/:id", product.updateProduct);

  app.use("/products", r);
};
