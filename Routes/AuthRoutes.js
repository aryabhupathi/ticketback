const express = require("express");
const User = require("../Models/User");
const jwt = require("jsonwebtoken");
const router = express.Router();
const authenticateToken = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    if (users.length === 0) {
      return res.status(404).json({ message: "No users found." });
    }
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users: " + err.message });
  }
});
router.post("/signup", async (req, res) => {
  const { name, email, password, mobile } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ message: "User already exists with this email" });
    }
    if (mobile) {
      user = await User.findOne({ mobile });
      if (user) {
        return res
          .status(400)
          .json({ message: "User already exists with this mobile" });
      }
    }
    user = new User({ name, email, mobile, password });
    await user.save();
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res
      .status(201)
      .json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
        },
      });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});
router.post("/login", async (req, res) => {
  const { email, mobile, password } = req.body;
  try {
    let user = null;
    if (email) {
      user = await User.findOne({ email });
    } else if (mobile) {
      user = await User.findOne({ mobile });
    }
    if (!user) return res.status(400).json({ message: "User not found" });
    if (user.password !== password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res
      .status(200)
      .json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
        },
      });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});
router.post("/forgot-password", async (req, res) => {
  const { email, mobile, newPassword } = req.body;
  if (!newPassword) {
    return res.status(400).json({ message: "New password is required" });
  }
  try {
    let user = null;
    if (email) {
      user = await User.findOne({ email });
    } else if (mobile) {
      user = await User.findOne({ mobile });
    }
    if (!user) return res.status(404).json({ message: "User not found" });
    user.password = newPassword;
    await user.save();
    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password"); // Exclude password
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});
router.put("/profile", authenticateToken, async (req, res) => {
  const { name, email, mobile } = req.body;
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { name, email, mobile },
      { new: true, runValidators: true }
    );
    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});
router.delete("/delete-account", authenticateToken, async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.user.id);
    if (!deletedUser)
      return res.status(404).json({ message: "User not found" });
    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});
router.post("/check-user-exist", async (req, res) => {
  const { email, mobile, name } = req.body;
  try {
    if (email) {
      const userByEmail = await User.findOne({ email });
      if (userByEmail) {
        return res.status(200).json({
          message:
            "User already exists with this email. You can reset your password.",
          resetPassword: true,
        });
      }
    }
    if (mobile) {
      const userByMobile = await User.findOne({ mobile });
      if (userByMobile) {
        return res.status(200).json({
          message:
            "User already exists with this mobile. You can reset your password.",
          resetPassword: true,
        });
      }
    }
    if (name) {
      const userByname = await User.findOne({ name });
      if (userByname) {
        return res.status(200).json({
          message:
            "User already exists with this name. You can reset your password.",
          resetPassword: true,
        });
      }
    }
    return res
      .status(404)
      .json({ message: "No user found with this name or mobile." });
  } catch (error) {
    console.error("Error checking user existence:", error);
    res.status(500).json({ message: "Server error" });
  }
});
module.exports = router;
