import express from "express";
import session from "express-session";
import passport from "passport";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import indexRoutes from "./routes/indexRoutes.js";

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();

// Passport configuration
import "./config/passport.js";

// Set up session and passport middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Use routes
app.use("/", indexRoutes);
app.use("/", authRoutes);

// server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

