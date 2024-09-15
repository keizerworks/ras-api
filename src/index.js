const express = require("express");
const session = require("express-session");
const passport = require("passport");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");
const indexRoutes = require("./routes/indexRoutes");

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();

// Passport configuration
require("./config/passport");

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
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});

