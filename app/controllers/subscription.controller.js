const Product = require("../models/product.models");
const Subscription = require("../models/subscription.models");

exports.subscribe = async (req, res) => {
  try {
    const { productId } = req.body;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const subscription = new Subscription({
      user: req.user._id,
      product: productId,
      subscribedAt: new Date(),
    });
    await subscription.save();

    req.user.hasSubscribed = true;
    await req.user.save();

    res
      .status(200)
      .json({ message: "Subscription successful", subscription: subscription });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
