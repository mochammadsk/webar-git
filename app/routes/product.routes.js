module.exports = (app) => {
  const product = require("../controllers/product.controller");
  const r = require("express").Router();

  // Create data
  r.post("/create", product.createProduct);

  // Update data
  r.put("/:id", product.updateProduct);

  // Show data
  r.get("/", product.getAllProducts);
  r.get("/:id", product.getProductById);

  app.use("/products", r);
};
