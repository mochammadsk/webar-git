const Product = require("../models/product.models");

// Create data
exports.createProduct = async (req, res) => {
  try {
    const { name, price, stock } = req.body;
    const product = new Product({ name, price });
    await product.save();
    res
      .status(201)
      .json({ message: "Product created successfully", product: product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update data
exports.updateProduct = (req, res) => {
  const id = req.params.id;

  Product.findByIdAndUpdate(id, req.body, { productsFindAndModify: false })
    .then((data) => {
      if (!data) {
        res.status(404).send({ message: "Data can't be updated!" });
      }
      res
        .status(200)
        .json({ message: "Data updated successfully!", product: data });
    })
    .catch((err) => res.status(500).send({ message: err.message }));
};

// Show data
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getProductById = (req, res) => {
  const id = req.params.id;

  Product.findById(id)
    .then((data) => res.send(data))
    .catch((err) => res.status(500).send({ message: err.message }));
};
