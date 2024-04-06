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
  .then(() => console.log("Connected database!"))
  .catch((err) => {
    console.log(`Failed to connect - ${err.message}`);
    process.exit();
  });

// Call routes user
require("./app/routes/admin.routes")(app);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
