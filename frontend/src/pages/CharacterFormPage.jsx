import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { charactersAPI } from "../api";
import "./CharacterFormPage.css";

// All D&D skills with their governing ability
const SKILLS = [
  { key: "acrobatics", label: "Acrobatics", ability: "DEX" },
  { key: "animalHandling", label: "Animal Handling", ability: "WIS" },
  { key: "arcana", label: "Arcana", ability: "INT" },
  { key: "athletics", label: "Athletics", ability: "STR" },
  { key: "deception", label: "Deception", ability: "CHA" },
  { key: "history", label: "History", ability: "INT" },
  { key: "insight", label: "Insight", ability: "WIS" },
  { key: "intimidation", label: "Intimidation", ability: "CHA" },
  { key: "investigation", label: "Investigation", ability: "INT" },
  { key: "medicine", label: "Medicine", ability: "WIS" },
  { key: "nature", label: "Nature", ability: "INT" },
  { key: "perception", label: "Perception", ability: "WIS" },
  { key: "performance", label: "Performance", ability: "CHA" },
  { key: "persuasion", label: "Persuasion", ability: "CHA" },
  { key: "religion", label: "Religion", ability: "INT" },
  { key: "sleightOfHand", label: "Sleight of Hand", ability: "DEX" },
  { key: "stealth", label: "Stealth", ability: "DEX" },
  { key: "survival", label: "Survival", ability: "WIS" },
];

const ABILITY_SCORES = [
  "strength",
  "dexterity",
  "constitution",
  "intelligence",
  "wisdom",
  "charisma",
];
const SAVING_THROWS = [
  "strength",
  "dexterity",
  "constitution",
  "intelligence",
  "wisdom",
  "charisma",
];

const DND_RACES = [
  "Human",
  "Elf",
  "Dwarf",
  "Halfling",
  "Gnome",
  "Half-Elf",
  "Half-Orc",
  "Tiefling",
  "Dragonborn",
  "Other",
];
const DND_CLASSES = [
  "Barbarian",
  "Bard",
  "Cleric",
  "Druid",
  "Fighter",
  "Monk",
  "Paladin",
  "Ranger",
  "Rogue",
  "Sorcerer",
  "Warlock",
  "Wizard",
  "Artificer",
  "Blood Hunter",
];

// Zod schema - validates required fields
const characterSchema = z.object({
  name: z.string().min(1, "Character name is required.").max(50),
  race: z.string().min(1, "Race is required."),
  class: z.string().min(1, "Class is required."),
  level: z.coerce.number().int().min(1).max(20),
  background: z.string().optional(),
  strength: z.coerce.number().int().min(1).max(30),
  dexterity: z.coerce.number().int().min(1).max(30),
  constitution: z.coerce.number().int().min(1).max(30),
  intelligence: z.coerce.number().int().min(1).max(30),
  wisdom: z.coerce.number().int().min(1).max(30),
  charisma: z.coerce.number().int().min(1).max(30),
  hitPoints: z.coerce.number().int().min(0),
  maxHitPoints: z.coerce.number().int().min(1),
  armorClass: z.coerce.number().int().min(1),
  speed: z.coerce.number().int().min(0),
  initiative: z.coerce.number().int(),
  hitDice: z.string().min(1, "Hit dice is required."),
  abilities: z.string().optional(),
  weapons: z.string().optional(),
  inventory: z.string().optional(),
  spells: z.string().optional(),
  notes: z.string().optional(),
});

export default function CharacterFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [serverError, setServerError] = useState("");
  const [skills, setSkills] = useState(() =>
    Object.fromEntries(SKILLS.map((s) => [s.key, false])),
  );
  const [savingThrows, setSavingThrows] = useState(() =>
    Object.fromEntries(SAVING_THROWS.map((s) => [s, false])),
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(characterSchema),
    defaultValues: {
      level: 1,
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
      hitPoints: 10,
      maxHitPoints: 10,
      armorClass: 10,
      speed: 30,
      initiative: 0,
      hitDice: "1d8",
    },
  });

  // If editing, load existing character data into the form
  useEffect(() => {
    if (!isEdit) return;
    const fetch = async () => {
      try {
        const res = await charactersAPI.getOne(id);
        const char = res.data;
        reset(char);
        if (char.skills) setSkills(char.skills);
        if (char.savingThrows) setSavingThrows(char.savingThrows);
      } catch {
        setServerError("Failed to load character.");
      }
    };
    fetch();
  }, [id, isEdit, reset]);

  const onSubmit = async (data) => {
    setServerError("");
    const payload = { ...data, skills, savingThrows };
    try {
      if (isEdit) {
        await charactersAPI.update(id, payload);
      } else {
        const res = await charactersAPI.create(payload);
        navigate(`/characters/${res.data.id}`);
        return;
      }
      navigate(`/characters/${id}`);
    } catch (err) {
      setServerError(err.response?.data?.error || "Something went wrong.");
    }
  };

  const toggleSkill = (key) =>
    setSkills((prev) => ({ ...prev, [key]: !prev[key] }));
  const toggleSave = (key) =>
    setSavingThrows((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="page-container fade-in">
      <div className="form-page-header">
        <h1 className="form-page-title">
          {isEdit ? "Edit Character" : "Create New Character"}
        </h1>
        <button className="btn btn-ghost" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>

      {serverError && <div className="error-banner">{serverError}</div>}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Identity */}
        <section className="form-section card">
          <h2 className="section-title">Identity</h2>
          <div className="form-grid-3">
            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label className="form-label">Character Name *</label>
              <input
                {...register("name")}
                className={`form-input ${errors.name ? "error" : ""}`}
                placeholder="Aldric Stormweaver"
              />
              {errors.name && (
                <span className="form-error">{errors.name.message}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Race *</label>
              <select
                {...register("race")}
                className={`form-input ${errors.race ? "error" : ""}`}
              >
                <option value="">Select race...</option>
                {DND_RACES.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
              {errors.race && (
                <span className="form-error">{errors.race.message}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Class *</label>
              <select
                {...register("class")}
                className={`form-input ${errors.class ? "error" : ""}`}
              >
                <option value="">Select class...</option>
                {DND_CLASSES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              {errors.class && (
                <span className="form-error">{errors.class.message}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Level *</label>
              <input
                {...register("level")}
                type="number"
                min={1}
                max={20}
                className={`form-input ${errors.level ? "error" : ""}`}
              />
              {errors.level && (
                <span className="form-error">{errors.level.message}</span>
              )}
            </div>

            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label className="form-label">Background</label>
              <input
                {...register("background")}
                className="form-input"
                placeholder="Acolyte, Criminal, Sage..."
              />
            </div>
          </div>
        </section>

        {/*  Ability Scores  */}
        <section className="form-section card">
          <h2 className="section-title">Ability Scores</h2>
          <div className="form-grid-6">
            {ABILITY_SCORES.map((ability) => (
              <div key={ability} className="form-group">
                <label className="form-label">
                  {ability.slice(0, 3).toUpperCase()}
                </label>
                <input
                  {...register(ability)}
                  type="number"
                  min={1}
                  max={30}
                  className={`form-input text-center ${errors[ability] ? "error" : ""}`}
                />
                {errors[ability] && (
                  <span className="form-error">{errors[ability].message}</span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Combat */}
        <section className="form-section card">
          <h2 className="section-title">Combat</h2>
          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label">Hit Points *</label>
              <input
                {...register("hitPoints")}
                type="number"
                min={0}
                className={`form-input ${errors.hitPoints ? "error" : ""}`}
              />
              {errors.hitPoints && (
                <span className="form-error">{errors.hitPoints.message}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Max Hit Points *</label>
              <input
                {...register("maxHitPoints")}
                type="number"
                min={1}
                className={`form-input ${errors.maxHitPoints ? "error" : ""}`}
              />
              {errors.maxHitPoints && (
                <span className="form-error">
                  {errors.maxHitPoints.message}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Armor Class *</label>
              <input
                {...register("armorClass")}
                type="number"
                min={1}
                className={`form-input ${errors.armorClass ? "error" : ""}`}
              />
              {errors.armorClass && (
                <span className="form-error">{errors.armorClass.message}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Speed (ft) *</label>
              <input
                {...register("speed")}
                type="number"
                min={0}
                className={`form-input ${errors.speed ? "error" : ""}`}
              />
              {errors.speed && (
                <span className="form-error">{errors.speed.message}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Initiative *</label>
              <input
                {...register("initiative")}
                type="number"
                className={`form-input ${errors.initiative ? "error" : ""}`}
              />
              {errors.initiative && (
                <span className="form-error">{errors.initiative.message}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Hit Dice *</label>
              <input
                {...register("hitDice")}
                className={`form-input ${errors.hitDice ? "error" : ""}`}
                placeholder="1d8"
              />
              {errors.hitDice && (
                <span className="form-error">{errors.hitDice.message}</span>
              )}
            </div>
          </div>
        </section>

        {/* Skills & Saving Throws */}
        <section className="form-section card">
          <h2 className="section-title">Proficiencies</h2>
          <div className="proficiency-cols">
            <div>
              <h3 className="sub-section-title">Saving Throws</h3>
              <div className="proficiency-list">
                {SAVING_THROWS.map((s) => (
                  <label key={s} className="proficiency-item">
                    <input
                      type="checkbox"
                      checked={savingThrows[s] || false}
                      onChange={() => toggleSave(s)}
                      className="prof-checkbox"
                    />
                    <span className="prof-label">
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="sub-section-title">Skills</h3>
              <div className="proficiency-list">
                {SKILLS.map((s) => (
                  <label key={s.key} className="proficiency-item">
                    <input
                      type="checkbox"
                      checked={skills[s.key] || false}
                      onChange={() => toggleSkill(s.key)}
                      className="prof-checkbox"
                    />
                    <span className="prof-label">
                      {s.label}{" "}
                      <span className="prof-ability">({s.ability})</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Free Text Fields */}
        <section className="form-section card">
          <h2 className="section-title">Details</h2>
          <div className="form-grid-2">
            {[
              {
                key: "abilities",
                label: "Features & Abilities",
                placeholder: "Darkvision, Brave, Lucky...",
              },
              {
                key: "weapons",
                label: "Weapons & Attacks",
                placeholder: "Longsword +5, 1d8+3 slashing...",
              },
              {
                key: "inventory",
                label: "Inventory & Equipment",
                placeholder: "Backpack, rope, torches...",
              },
              {
                key: "spells",
                label: "Spells",
                placeholder: "Fireball, Healing Word...",
              },
              {
                key: "notes",
                label: "Notes",
                placeholder: "Backstory, personality, bonds...",
              },
            ].map(({ key, label, placeholder }) => (
              <div key={key} className="form-group">
                <label className="form-label">{label}</label>
                <textarea
                  {...register(key)}
                  className="form-input"
                  placeholder={placeholder}
                  rows={4}
                />
              </div>
            ))}
          </div>
        </section>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-gold"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Saving..."
              : isEdit
                ? "Save Changes"
                : "Create Character"}
          </button>
        </div>
      </form>
    </div>
  );
}
