// Import required packages
import express from "express"; // web server framework
import cors from "cors"; // allow frontend to access backend (cross-origin)
import dotenv from "dotenv"; // manage environment variables
import fetch from "node-fetch"; // to call external API

// Load environment variables from .env file (if any)
dotenv.config();

// Create express app
const app = express(); // initialize express app
const PORT = process.env.PORT || 5000; // use .env port or default 5000

// Enable middleware
app.use(cors()); // allow CORS
app.use(express.json()); // parse JSON request body

// ---------- ROUTES ---------- //

// Level 1: Fetch meals starting with 'b' from TheMealDB API
app.get("/meals", async (req, res) => {
  try {
    // Fetch data from external API
    const response = await fetch("https://www.themealdb.com/api/json/v1/1/search.php?f=b");
    const data = await response.json();

    // Send JSON response back to client
    res.json(data);
  } catch (error) {
    // If error happens, send error message
    res.status(500).json({ message: "Error fetching meals", error });
  }
});

// ---------- SERVER START ---------- //
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
