const authService = require("./admin.controllers");

// Handler login routes
exports.handleLogin = async (req, res) => {
  try {
    const response = await authService.login(req.body);
    res
      .header("auth-token", response.token)
      .json({ message: response.message });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
