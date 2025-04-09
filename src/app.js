const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");
const clientRoutes = require("./routes/client.routes");
require("dotenv").config();
const serverless = require('serverless-http');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check route
app.get("/", (req, res) => {
   res.json({ message: "System is running fine" });
});

// Routes
app.use("/auth", authRoutes);
app.use("/client", clientRoutes);


// For local development
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
   console.log(`Server is running on port ${PORT}`);
});

// Export the app for testing and the handler for Lambda
module.exports = app;

// module.exports.handler = serverless(app);
