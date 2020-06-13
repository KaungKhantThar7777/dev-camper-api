const express = require("express");
const router = express.Router();

const {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  updateDetails,
  logout,
  updatePassword,
} = require("../controllers/auth");
const { protect } = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);
router.get("/me", protect, getMe);
router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword/:resetToken", resetPassword);
router.patch("/updatedetails", protect, updateDetails);
router.patch("/updatepassword", protect, updatePassword);

module.exports = router;
