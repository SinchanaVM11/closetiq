require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const garmentRoutes = require("./routes/garmentRoutes");
const errorHandler = require("./middleware/errorHandler");
const outfitRoutes = require("./routes/outfitRoutes");
const imageRoutes = require("./routes/imageRoutes");

const app = express();

const PORT = Number(process.env.PORT) || 5050;
let databaseStatus = "disconnected";

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  })
);

app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "ClosetIQ API is running",
    status: databaseStatus,
    port: PORT,
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use("/api/garments", garmentRoutes);
app.use("/api/outfits", outfitRoutes);
app.use("/api/images", imageRoutes);

// Error handler — must be after routes
app.use(errorHandler);

const startServer = async () => {
  const dbConnected = await connectDB();
  databaseStatus = dbConnected ? "connected" : "disconnected";

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ClosetIQ API running on port ${PORT}`);
  });
};

startServer();