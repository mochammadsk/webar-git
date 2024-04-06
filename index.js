const express = require("express");
const cors = require("cors");
const db = require("./app/models/index");

const app = express();
const corsOption = {
  origin: "*",
};

// Register cors middelware
app.use(cors(corsOption));
app.use(express.json());

// Connection to database

const mongooseConfig = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

db.mongoose
  .connect(db.url, mongooseConfig)
  .then(() => console.log("Database connected!"))
  .catch((err) => {
    console.log(`Gagal konek ${err.message}`);
    process.exit();
  });

// Call routes user
require("./app/routes/user.routes")(app);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
