const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../middleware/authMiddleware");

router.get("/", (req, res) => {
  res.send(
    req.isAuthenticated()
      ? `Hello ${req.user.displayName}`
      : "Not authenticated"
  );
});

router.get('/protected', ensureAuthenticated, (req, res) => {
  res.send('This is a protected route');
});

module.exports = router;

