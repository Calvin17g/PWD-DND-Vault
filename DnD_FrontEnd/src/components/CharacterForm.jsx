import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  ButtonGroup,
  Checkbox,
  Flex,
  Heading,
  Input,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  Wrap,
  WrapItem,
  Badge,
} from "@chakra-ui/react";

const API_BASE = "http://localhost:3000";

function CharacterForm({ character, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: "",
    race: "",
    class: "",
    level: 1,
    background: "",
    alignment: "",
    experiencePoints: 0,
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
    hitPointsMax: 10,
    hitPointsCurrent: 10,
    armorClass: 10,
    initiative: 0,
    speed: 30,
    hitDice: "",
    deathSaves: {
      successes: [false, false, false],
      failures: [false, false, false],
    },
    proficiencyBonus: 2,
    savingThrows: {
      strength: false,
      dexterity: false,
      constitution: false,
      intelligence: false,
      wisdom: false,
      charisma: false,
    },
    skills: {
      acrobatics: false,
      animalHandling: false,
      arcana: false,
      athletics: false,
      deception: false,
      history: false,
      insight: false,
      intimidation: false,
      investigation: false,
      medicine: false,
      nature: false,
      perception: false,
      performance: false,
      persuasion: false,
      religion: false,
      sleightOfHand: false,
      stealth: false,
      survival: false,
    },
    proficiencies: "",
    languages: "",
    equipment: "",
    spells: "",
    personalityTraits: "",
    ideals: "",
    bonds: "",
    flaws: "",
    backstory: "",
    appearance: "",
    age: "",
    height: "",
    weight: "",
    eyes: "",
    skin: "",
    hair: "",
  });

  useEffect(() => {
    if (character) {
      const dexMod = Math.floor((character.dexterity - 10) / 2);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        ...character,
        initiative: character.initiative - dexMod,
      });
    }
  }, [character]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleNumberChange = useCallback((name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value === "" ? "" : parseInt(value) || 0,
    }));
  }, []);

  const getProficiencyBonus = useCallback((level) => {
    if (level <= 4) return 2;
    if (level <= 8) return 3;
    if (level <= 12) return 4;
    if (level <= 16) return 5;
    return 6;
  }, []);

  const handleCheckboxChange = useCallback((category, name, checked) => {
    setFormData((prev) => ({
      ...prev,
      [category]: { ...prev[category], [name]: checked },
    }));
  }, []);

  const handleDeathSaveChange = useCallback((type, index, checked) => {
    setFormData((prev) => {
      const updated = [...prev.deathSaves[type]];
      updated[index] = checked;
      return {
        ...prev,
        deathSaves: {
          ...prev.deathSaves,
          [type]: updated,
        },
      };
    });
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const token = localStorage.getItem("token");
      const method = character ? "PUT" : "POST";
      const url = character
        ? `${API_BASE}/characters/${character.id}`
        : `${API_BASE}/characters`;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          initiative:
            (formData.initiative || 0) +
            Math.floor((formData.dexterity - 10) / 2),
          proficiencyBonus: getProficiencyBonus(formData.level),
          maxHitDice: formData.level,
        }),
      });

      if (res.ok) {
        onSave();
      }
    },
    [character, formData, onSave, getProficiencyBonus],
  );

  const handleFormKeyDown = useCallback((e) => {
    if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") {
      e.preventDefault();
    }
  }, []);

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "24px" }}>
      <div
        style={{
          background: "white",
          padding: "48px",
          borderRadius: "24px",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
          border: "1px solid #e5e7eb",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "16px",
              }}
            >
              <div>
                <h1 style={{ fontSize: "36px", fontWeight: "bold" }}>
                  Character Sheet
                </h1>
                <p style={{ color: "#6b7280", marginTop: "8px" }}>
                  {character
                    ? `Editing ${character.name}`
                    : "Create a new character"}
                </p>
              </div>
              <span
                style={{
                  background: "#ddd6fe",
                  color: "#7c3aed",
                  padding: "4px 12px",
                  borderRadius: "6px",
                  fontSize: "14px",
                  alignSelf: "center",
                }}
              >
                Level {formData.level}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} onKeyDown={handleFormKeyDown}>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "40px" }}
            >
              <div>
                <h2
                  style={{
                    fontSize: "24px",
                    fontWeight: "600",
                    marginBottom: "16px",
                  }}
                >
                  Basic Information
                </h2>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "16px",
                  }}
                >
                  <div style={{ marginBottom: "16px" }}>
                    <label
                      style={{
                        fontSize: "14px",
                        fontWeight: "500",
                        marginBottom: "8px",
                        color: "#374151",
                        display: "block",
                      }}
                    >
                      Name
                    </label>
                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        border: "1px solid #d1d5db",
                        borderRadius: "6px",
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: "16px" }}>
                    <label
                      style={{
                        fontSize: "14px",
                        fontWeight: "500",
                        marginBottom: "8px",
                        color: "#374151",
                        display: "block",
                      }}
                    >
                      Race
                    </label>
                    <input
                      name="race"
                      value={formData.race}
                      onChange={handleChange}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        border: "1px solid #d1d5db",
                        borderRadius: "6px",
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: "16px" }}>
                    <label
                      style={{
                        fontSize: "14px",
                        fontWeight: "500",
                        marginBottom: "8px",
                        color: "#374151",
                        display: "block",
                      }}
                    >
                      Class
                    </label>
                    <input
                      name="class"
                      value={formData.class}
                      onChange={handleChange}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        border: "1px solid #d1d5db",
                        borderRadius: "6px",
                      }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <div style={{ display: "flex", gap: "16px" }}>
                  <button
                    type="submit"
                    style={{
                      background: "#3182ce",
                      color: "white",
                      padding: "8px 16px",
                      borderRadius: "6px",
                      border: "none",
                    }}
                  >
                    {character ? "Update Character" : "Create Character"}
                  </button>
                  <button
                    type="button"
                    onClick={onCancel}
                    style={{
                      background: "transparent",
                      color: "#3182ce",
                      padding: "8px 16px",
                      border: "1px solid #3182ce",
                      borderRadius: "6px",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CharacterForm;
