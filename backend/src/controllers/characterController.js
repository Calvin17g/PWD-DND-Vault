import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /characters — get all characters belonging to logged-in user
export const getCharacters = async (req, res) => {
  try {
    const characters = await prisma.character.findMany({
      where: { userId: req.user.id },
      orderBy: { updatedAt: "desc" },
    });
    res.json(characters);
  } catch (error) {
    console.error("Get characters error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

// GET /characters/:id — get a single character
export const getCharacter = async (req, res) => {
  const { id } = req.params;

  try {
    const character = await prisma.character.findUnique({
      where: { id: parseInt(id) },
    });

    if (!character) {
      return res.status(404).json({ error: "Character not found." });
    }

    // Make sure the character belongs to the requesting user
    if (character.userId !== req.user.id) {
      return res.status(403).json({ error: "Not authorized." });
    }

    res.json(character);
  } catch (error) {
    console.error("Get character error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

// POST /characters — create a new character
export const createCharacter = async (req, res) => {
  const {
    name,
    race,
    class: charClass,
    level,
    background,
    strength,
    dexterity,
    constitution,
    intelligence,
    wisdom,
    charisma,
    hitPoints,
    maxHitPoints,
    tempHitPoints,
    armorClass,
    initiative,
    speed,
    hitDice,
    deathSaves,
    skills,
    savingThrows,
    abilities,
    weapons,
    inventory,
    spells,
    notes,
  } = req.body;

  try {
    const character = await prisma.character.create({
      data: {
        userId: req.user.id,
        name,
        race,
        class: charClass,
        level: level || 1,
        background,
        strength: strength || 10,
        dexterity: dexterity || 10,
        constitution: constitution || 10,
        intelligence: intelligence || 10,
        wisdom: wisdom || 10,
        charisma: charisma || 10,
        hitPoints: hitPoints || 10,
        maxHitPoints: maxHitPoints || hitPoints || 10,
        tempHitPoints: tempHitPoints || 0,
        armorClass: armorClass || 10,
        initiative: initiative || 0,
        speed: speed || 30,
        hitDice: hitDice || "1d8",
        deathSaves: deathSaves || { successes: 0, failures: 0 },
        skills: skills || {},
        savingThrows: savingThrows || {},
        abilities,
        weapons,
        inventory,
        spells,
        notes,
      },
    });

    res.status(201).json(character);
  } catch (error) {
    console.error("Create character error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

// PUT /characters/:id — full update of a character
export const updateCharacter = async (req, res) => {
  const { id } = req.params;

  try {
    // Check character exists and belongs to user
    const existing = await prisma.character.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existing)
      return res.status(404).json({ error: "Character not found." });
    if (existing.userId !== req.user.id)
      return res.status(403).json({ error: "Not authorized." });

    const updated = await prisma.character.update({
      where: { id: parseInt(id) },
      data: { ...req.body },
    });

    res.json(updated);
  } catch (error) {
    console.error("Update character error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

// PATCH /characters/:id/stats — advanced feature: quick in-session stat update
// Allows updating only combat stats (HP, death saves, temp HP) without a full form submission
export const updateStats = async (req, res) => {
  const { id } = req.params;
  const { hitPoints, tempHitPoints, deathSaves } = req.body;

  try {
    const existing = await prisma.character.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existing)
      return res.status(404).json({ error: "Character not found." });
    if (existing.userId !== req.user.id)
      return res.status(403).json({ error: "Not authorized." });

    // Only update the fields that were sent
    const updateData = {};
    if (hitPoints !== undefined) updateData.hitPoints = hitPoints;
    if (tempHitPoints !== undefined) updateData.tempHitPoints = tempHitPoints;
    if (deathSaves !== undefined) updateData.deathSaves = deathSaves;

    const updated = await prisma.character.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    res.json(updated);
  } catch (error) {
    console.error("Update stats error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

// DELETE /characters/:id — delete a character
export const deleteCharacter = async (req, res) => {
  const { id } = req.params;

  try {
    const existing = await prisma.character.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existing)
      return res.status(404).json({ error: "Character not found." });
    if (existing.userId !== req.user.id)
      return res.status(403).json({ error: "Not authorized." });

    await prisma.character.delete({ where: { id: parseInt(id) } });

    res.json({ message: "Character deleted successfully." });
  } catch (error) {
    console.error("Delete character error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};
