const authService = require("../controllers/user.controllers");

// Handler untuk rute login
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
