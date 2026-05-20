const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Data files
const USERS_FILE = path.join(__dirname, "data", "users.json");
const CHARACTERS_FILE = path.join(__dirname, "data", "characters.json");

// In-memory sessions (token -> userId)
const sessions = new Map();

// Helper functions
function readJSON(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (err) {
    return [];
  }
}

function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function validatePassword(password) {
  // 8+ chars, letters, numbers, special char
  const minLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  return minLength && hasLetter && hasNumber && hasSpecial;
}

// Auth middleware
function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token || !sessions.has(token)) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  req.userId = sessions.get(token);
  next();
}

// Routes

// Signup
app.post("/signup", (req, res) => {
  const { email, username, password } = req.body;
  if (!email || !username || !password) {
    return res
      .status(400)
      .json({ error: "Email, username, and password required" });
  }
  if (!validatePassword(password)) {
    return res.status(400).json({
      error:
        "Password must be 8+ characters with letters, numbers, and special character",
    });
  }

  const users = readJSON(USERS_FILE);
  if (users.find((u) => u.username === username || u.email === email)) {
    return res.status(400).json({ error: "Username or email already exists" });
  }

  const newUser = {
    id: uuidv4(),
    username,
    email,
    password, // Plain text for prototype
    displayName: username,
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  writeJSON(USERS_FILE, users);

  res.status(201).json({ message: "Account created" });
});

// Login
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }

  const users = readJSON(USERS_FILE);
  const user = users.find(
    (u) => u.username === username && u.password === password,
  );
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = uuidv4();
  sessions.set(token, user.id);

  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
    },
  });
});

// Logout
app.post("/logout", requireAuth, (req, res) => {
  sessions.delete(req.headers.authorization?.replace("Bearer ", ""));
  res.json({ message: "Logged out" });
});

// Get user's characters
app.get("/characters", requireAuth, (req, res) => {
  const characters = readJSON(CHARACTERS_FILE);
  const userCharacters = characters.filter((c) => c.ownerId === req.userId);
  res.json(userCharacters);
});

// Create character
app.post("/characters", requireAuth, (req, res) => {
  const character = req.body;
  character.id = uuidv4();
  character.ownerId = req.userId;

  const characters = readJSON(CHARACTERS_FILE);
  characters.push(character);
  writeJSON(CHARACTERS_FILE, characters);

  res.status(201).json(character);
});

// Update character
app.put("/characters/:id", requireAuth, (req, res) => {
  const { id } = req.params;
  const characters = readJSON(CHARACTERS_FILE);
  const index = characters.findIndex(
    (c) => c.id === id && c.ownerId === req.userId,
  );
  if (index === -1) {
    return res.status(404).json({ error: "Character not found" });
  }

  characters[index] = { ...characters[index], ...req.body };
  writeJSON(CHARACTERS_FILE, characters);

  res.json(characters[index]);
});

// Delete character
app.delete("/characters/:id", requireAuth, (req, res) => {
  const { id } = req.params;
  const characters = readJSON(CHARACTERS_FILE);
  const filtered = characters.filter(
    (c) => !(c.id === id && c.ownerId === req.userId),
  );
  if (filtered.length === characters.length) {
    return res.status(404).json({ error: "Character not found" });
  }

  writeJSON(CHARACTERS_FILE, filtered);
  res.json({ message: "Character deleted" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
