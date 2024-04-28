module.exports = (app) => {
  const product = require("../controllers/product.controller");
  const r = require("express").Router();

  // Create data
  r.post("/create", product.createProduct);

  // Update data
  r.put("/update/:id", product.updateProduct);

  // Show data
  r.get("/list", product.getAllProducts);
  r.get("/list/:id", product.getProductById);

  app.use("/products", r);
};
