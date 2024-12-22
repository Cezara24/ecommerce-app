const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { models } = require("../db");
const { User, Role } = models;
const { authMiddleware } = require("../middlewares/auth");
const router = express.Router();

// New user registration
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      roleId: 2,
    });
    res.status(201).json({
      message: "User successfully registered!",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roleId: user.roleId,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Registration error", details: error.message });
  }
});

// User authentication
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({
      where: { email },
      include: {
        model: Role,
        required: true,
      },
    });

    if (!user) {
      console.log("User does not exist.");
      return res.status(404).json({ error: "Incorrect email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log("Incorrect password.");
      return res.status(401).json({ error: "Incorrect email or password" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.Role.name },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await models.AuthToken.create({
      userId: user.id,
      token,
      type: "access",
      expiresAt,
    });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roleId: user.roleId,
      },
    });
  } catch (error) {
    console.error("Error during authentication:", error);
    res
      .status(500)
      .json({ error: "Authentication error", details: error.message });
  }
});

// User logout
router.post("/logout", authMiddleware, async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const authToken = await models.AuthToken.findOne({ where: { token } });
    if (!authToken || authToken.userId !== req.user.id) {
      return res
        .status(403)
        .json({ error: "You do not have permission to revoke this token." });
    }
    await authToken.update({ isRevoked: true });
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Logout error", details: error.message });
  }
});

// User role assignment
router.post("/assign-role/:id", authMiddleware, async (req, res) => {
  const { roleId } = req.body;
  const targetUserId = parseInt(req.params.id, 10);

  try {
    const user = await User.findByPk(targetUserId);
    if (!user) {
      return res.status(404).json({ error: "User does not exist." });
    }

    if (user.roleId === roleId) {
      return res.status(200).json({
        message: "No changes made. User already has this role.",
      });
    }

    if (req.user.role === "admin") {
      await user.update({ roleId });
      return res.json({ message: "Role successfully assigned!" });
    }

    if (req.user.id === targetUserId) {
      if (
        (req.user.role === "customer" && roleId === 3) ||
        (req.user.role === "merchant" && roleId === 2)
      ) {
        await user.update({ roleId });
        return res.json({
          message: "Role successfully assigned!",
          user: {
            roleId: roleId,
          },
        });
      }
      return res.status(403).json({
        error: "You do not have permission to set this role.",
      });
    }

    return res.status(403).json({
      error: "You do not have permission to modify this user.",
    });
  } catch (error) {
    console.error("Error while assigning role:", error);
    return res.status(500).json({
      error: "Error while assigning role",
      details: error.message,
    });
  }
});

module.exports = router;
