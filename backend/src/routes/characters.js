import { Router } from "express";
import {
  getCharacters,
  getCharacter,
  createCharacter,
  updateCharacter,
  updateStats,
  deleteCharacter,
} from "../controllers/characterController.js";
import authenticateToken from "../middleware/auth.js";

const router = Router();

// All character routes are protected — user must be logged in
router.use(authenticateToken);

// GET /characters — fetch all characters for the logged-in user
router.get("/", getCharacters);

// GET /characters/:id — fetch a single character
router.get("/:id", getCharacter);

// POST /characters — create a new character
router.post("/", createCharacter);

// PUT /characters/:id — full update of a character
router.put("/:id", updateCharacter);

// PATCH /characters/:id/stats — advanced feature: quick in-session stat update
router.patch("/:id/stats", updateStats);

// DELETE /characters/:id — delete a character
router.delete("/:id", deleteCharacter);

export default router;
