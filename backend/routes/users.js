const express = require("express");
const bcrypt = require("bcrypt");
const { models } = require("../db");
const { User, UserAddress, Role, Permission } = models;
const { authMiddleware } = require("../middlewares/auth");
const { roleMiddleware } = require("../middlewares/role");
const { permissionMiddleware } = require("../middlewares/permission");

const router = express.Router();

// Create a new user (Admin only)
router.post(
  "/",
  [authMiddleware, roleMiddleware(["admin"])],
  async (req, res) => {
    const { name, email, password, roleId, phoneNumber } = req.body;
    if (!name || !email || !password || !roleId) {
      return res
        .status(400)
        .json({ error: "All fields (name, email, password, roleId) are required." });
    }
    try {
      const role = await Role.findByPk(roleId);
      if (!role) {
        return res.status(404).json({ error: "The specified role does not exist." });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await User.create({
        name,
        email,
        password: hashedPassword,
        roleId,
        phoneNumber,
      });
      res.status(201).json({
        message: "New user successfully created!",
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          roleId: newUser.roleId,
          phoneNumber: newUser.phoneNumber,
        },
      });
    } catch (error) {
      console.error("Error creating user:", error);
      res
        .status(500)
        .json({ error: "Error creating user", details: error.message });
    }
  }
);

// GET all users (Admin only)
router.get(
  "/",
  [
    authMiddleware,
    roleMiddleware(["admin"]),
    permissionMiddleware("view_users"),
  ],
  async (req, res) => {
    try {
      const users = await User.findAll({
        include: [
          {
            model: Role,
            include: [Permission],
          },
        ],
      });

      res.json(users);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Error getting users.", details: error.message });
    }
  }
);

// GET user by ID (Admin or the user themselves)
router.get("/:id", [authMiddleware], async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const user = await User.findByPk(userId, {
      include: { model: Role, include: [Permission] },
    });
    if (!user) return res.status(404).json({ error: "User not found." });
    const isAdmin = req.user.role === "admin";
    const isSelf = req.user.id === userId;
    if (!isAdmin && !isSelf) {
      return res.status(403).json({ error: "Access prohibited." });
    }
    res.json(user);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error getting user.", details: error.message });
  }
});

// UPDATE user by ID (Admin or the user themselves)
router.put(
  "/:id",
  [authMiddleware],
  async (req, res) => {
    try {
      const userId = parseInt(req.params.id, 10);
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: "Utilizatorul nu a fost găsit." });
      }
      const isAdmin = req.user.roleId === 1;
      const isSelf = req.user.id === userId;
      if (!isAdmin && !isSelf) {
        return res.status(403).json({ error: "Acces interzis." });
      }
      const { name, email, phoneNumber, profilePicture } = req.body;
      const updates = { name, email, phoneNumber, profilePicture };
      if (phoneNumber && phoneNumber !== user.phoneNumber) {
        updates.isVerified = false;
      }
      await user.update(updates);
      res.json({ message: "Utilizator actualizat cu succes!", user });
    } catch (error) {
      res.status(500).json({
        error: "Eroare la actualizarea utilizatorului.",
        details: error.message,
      });
    }
  }
);

// DELETE user by ID (Admin only)
router.delete(
  "/:id",
  [
    authMiddleware,
    roleMiddleware(["admin"]),
    permissionMiddleware("delete_user"),
  ],
  async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);

      if (!user)
        return res.status(404).json({ error: "Utilizatorul nu a fost găsit." });

      await user.destroy();
      res.json({ message: "Utilizator șters cu succes!" });
    } catch (error) {
      res.status(500).json({
        error: "Eroare la ștergerea utilizatorului.",
        details: error.message,
      });
    }
  }
);

// GET addresses for a user (Admin or the user themselves)
router.get(
  "/:id/addresses",
  [
    authMiddleware,
    roleMiddleware(["admin", "customer"]),
    permissionMiddleware("view_addresses"),
  ],
  async (req, res) => {
    try {
      const userAddresses = await UserAddress.findAll({
        where: { userId: req.params.id },
      });

      if (
        req.user.role === "customer" &&
        parseInt(req.params.id, 10) !== req.user.id
      ) {
        return res.status(403).json({ error: "Acces interzis." });
      }

      res.json(userAddresses);
    } catch (error) {
      res.status(500).json({
        error: "Eroare la obținerea adreselor utilizatorului.",
        details: error.message,
      });
    }
  }
);

module.exports = router;
