import express from "express";
import authCheck from "../../middlewares/authCheck.js";

const router = express.Router();

router.post("/authCheck", authCheck, (req, res) => {
  res.json({
    status: true,
    message: "Authenticated User",
    user: req.userData, // Send user data from authCheck middleware
  });
});

export default router;
