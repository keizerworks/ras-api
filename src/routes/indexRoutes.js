// import { Router } from "express";
// const router = Router();
// import { ensureAuthenticated } from "../middleware/authMiddleware";

// router.get("/", (req, res) => {
//   res.send(
//     req.isAuthenticated()
//       ? `Hello ${req.user.name || req.user.email}`
//       : "Not authenticated"
//   );
// });

// router.get("/dashboard", ensureAuthenticated, (req, res) => {
//   res.send(`Welcome to your dashboard, ${req.user.name || req.user.email}`);
// });

// export default router;


import { Router } from "express";
import { ensureAuthenticated } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", (req, res) => {
  res.send(
    req.isAuthenticated()
      ? `Hello ${req.user.name || req.user.email}`
      : "Not authenticated"
  );
});

router.get("/dashboard", ensureAuthenticated, (req, res) => {
  res.send(`Welcome to your dashboard, ${req.user.name || req.user.email}`);
});

export default router;