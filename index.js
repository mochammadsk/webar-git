const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const { google } = require("googleapis");
const prisma = require("@prisma/client");
const bodyParser = require("body-parser");
const db = require("./app/config/database");

const app = express();
const PORT = 8000;

const corsOption = {
  origin: "*",
};

// Register cors middelware
app.use(cors(corsOption));
app.use(express.json());

app.use(
  bodyParser.json({
    extended: true,
    limit: "50mb",
  })
);

app.use(
  bodyParser.urlencoded({
    extended: true,
    limit: "50mb",
  })
);

// // Configuration OAuth
// const oauth2Client = new google.auth.OAuth2(
//   process.env.GOOGLE_CLIENT_ID,
//   process.env.GOOGLE_CLIENT_SECRET,
//   "http://localhost:8000/auth/google/callback"
// );

// // Tautan untuk memulai proses otentikasi
// app.get("/auth/google", (req, res) => {
//   const authUrl = oauth2Client.generateAuthUrl({
//     access_type: "offline",
//     scope: [
//       "https://www.googleapis.com/auth/userinfo.profile",
//       "https://www.googleapis.com/auth/userinfo.email",
//     ],
//     include_granted_scopes: true,
//   });
//   res.redirect(authUrl);
// });

// // Tanggapan dari Google setelah pengguna berhasil diautentikasi
// app.get("/auth/google/callback", async (req, res) => {
//   const { code } = req.query;
//   try {
//     const { tokens } = await oauth2Client.getToken(code);
//     oauth2Client.setCredentials(tokens);
//     const userInfo = google
//       .oauth2({ version: "v2", auth: oauth2Client })
//       .userinfo.get();
//     // Di sinilah Anda dapat menggunakan informasi pengguna userInfo
//     console.log("User Info:", userInfo.data);
//     res.send("Authentication successful!"); // Atau tautan ke halaman lain
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).send("Authentication failed!");
//   }
// });

// Connection to database
mongoose
  .connect(db.url, db.mongooseConfig)
  .then(() => console.log("Connected to database!"))
  .catch((err) => {
    console.log(`Failed to connect - ${err.message}`);
    process.exit();
  });

// Call routes
require("./app/routes/admin.routes")(app);
require("./app/routes/user.routes")(app);

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
