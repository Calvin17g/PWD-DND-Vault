import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { charactersAPI } from "../api";
import "./CharacterDetailPage.css";

// Helper: calculate ability modifier
const getMod = (score) => Math.floor((score - 10) / 2);
const fmtMod = (score) => {
  const m = getMod(score);
  return m >= 0 ? `+${m}` : `${m}`;
};

const ABILITIES = [
  { key: "strength", label: "Strength" },
  { key: "dexterity", label: "Dexterity" },
  { key: "constitution", label: "Constitution" },
  { key: "intelligence", label: "Intelligence" },
  { key: "wisdom", label: "Wisdom" },
  { key: "charisma", label: "Charisma" },
];

const SKILLS = [
  { key: "acrobatics", label: "Acrobatics", ability: "dexterity" },
  { key: "animalHandling", label: "Animal Handling", ability: "wisdom" },
  { key: "arcana", label: "Arcana", ability: "intelligence" },
  { key: "athletics", label: "Athletics", ability: "strength" },
  { key: "deception", label: "Deception", ability: "charisma" },
  { key: "history", label: "History", ability: "intelligence" },
  { key: "insight", label: "Insight", ability: "wisdom" },
  { key: "intimidation", label: "Intimidation", ability: "charisma" },
  { key: "investigation", label: "Investigation", ability: "intelligence" },
  { key: "medicine", label: "Medicine", ability: "wisdom" },
  { key: "nature", label: "Nature", ability: "intelligence" },
  { key: "perception", label: "Perception", ability: "wisdom" },
  { key: "performance", label: "Performance", ability: "charisma" },
  { key: "persuasion", label: "Persuasion", ability: "charisma" },
  { key: "religion", label: "Religion", ability: "intelligence" },
  { key: "sleightOfHand", label: "Sleight of Hand", ability: "dexterity" },
  { key: "stealth", label: "Stealth", ability: "dexterity" },
  { key: "survival", label: "Survival", ability: "wisdom" },
];

// Proficiency bonus by level
const profBonus = (level) => Math.ceil(level / 4) + 1;

// HP Tracker component
// Lets the user quickly modify HP without opening the full edit form
function HpTracker({ character, onUpdate }) {
  const [hp, setHp] = useState(character.hitPoints);
  const [tempHp, setTempHp] = useState(character.tempHitPoints || 0);
  const [deathSaves, setDeathSaves] = useState(
    character.deathSaves || { successes: 0, failures: 0 },
  );
  const [saving, setSaving] = useState(false);
  const [delta, setDelta] = useState("");

  const hpPercent = Math.max(
    0,
    Math.min(100, (hp / character.maxHitPoints) * 100),
  );

  const applyDelta = async (sign) => {
    const amount = parseInt(delta) || 0;
    if (amount === 0) return;
    const newHp = Math.max(
      0,
      Math.min(character.maxHitPoints, hp + sign * amount),
    );
    setHp(newHp);
    setDelta("");
    await save({ hitPoints: newHp, tempHitPoints: tempHp, deathSaves });
  };

  const toggleDeathSave = async (type) => {
    const current = deathSaves[type];
    const max = 3;
    const newVal = current >= max ? 0 : current + 1;
    const updated = { ...deathSaves, [type]: newVal };
    setDeathSaves(updated);
    await save({ hitPoints: hp, tempHitPoints: tempHp, deathSaves: updated });
  };

  const save = async (data) => {
    setSaving(true);
    try {
      const res = await charactersAPI.updateStats(character.id, data);
      onUpdate(res.data);
    } catch {
      // silently fail, values already updated locally
    } finally {
      setSaving(false);
    }
  };

  const hpColor =
    hpPercent > 50 ? "#2ecc71" : hpPercent > 25 ? "#f39c12" : "#e74c3c";

  return (
    <div className="hp-tracker card">
      <h3 className="tracker-title">⚔️ Live Session Tracker</h3>

      {/* HP Bar */}
      <div className="hp-bar-wrap">
        <div className="hp-bar-labels">
          <span className="hp-label">Hit Points</span>
          <span className="hp-value" style={{ color: hpColor }}>
            {hp} / {character.maxHitPoints}
          </span>
        </div>
        <div className="hp-bar-bg">
          <div
            className="hp-bar-fill"
            style={{ width: `${hpPercent}%`, background: hpColor }}
          />
        </div>
      </div>

      {/* HP Controls */}
      <div className="hp-controls">
        <button
          className="btn btn-danger hp-btn"
          onClick={() => applyDelta(-1)}
        >
          − Damage
        </button>
        <input
          type="number"
          min={0}
          className="form-input hp-delta-input"
          value={delta}
          onChange={(e) => setDelta(e.target.value)}
          placeholder="0"
        />
        <button className="btn btn-gold hp-btn" onClick={() => applyDelta(1)}>
          + Heal
        </button>
      </div>

      {/* Temp HP */}
      <div className="temp-hp-row">
        <span className="hp-label">Temp HP</span>
        <div className="temp-hp-controls">
          <button
            className="btn btn-ghost btn-sm"
            onClick={async () => {
              const n = Math.max(0, tempHp - 1);
              setTempHp(n);
              await save({ hitPoints: hp, tempHitPoints: n, deathSaves });
            }}
          >
            −
          </button>
          <span className="temp-hp-val">{tempHp}</span>
          <button
            className="btn btn-ghost btn-sm"
            onClick={async () => {
              const n = tempHp + 1;
              setTempHp(n);
              await save({ hitPoints: hp, tempHitPoints: n, deathSaves });
            }}
          >
            +
          </button>
        </div>
      </div>

      {/* Death Saves */}
      <div className="death-saves">
        <span className="hp-label">Death Saves</span>
        <div className="ds-row">
          <span className="ds-type ds-success">Successes</span>
          <div className="ds-pips">
            {[0, 1, 2].map((i) => (
              <button
                key={i}
                className={`ds-pip ${i < deathSaves.successes ? "filled success" : ""}`}
                onClick={() => toggleDeathSave("successes")}
              />
            ))}
          </div>
        </div>
        <div className="ds-row">
          <span className="ds-type ds-failure">Failures</span>
          <div className="ds-pips">
            {[0, 1, 2].map((i) => (
              <button
                key={i}
                className={`ds-pip ${i < deathSaves.failures ? "filled failure" : ""}`}
                onClick={() => toggleDeathSave("failures")}
              />
            ))}
          </div>
        </div>
      </div>

      {saving && <p className="tracker-saving">Saving...</p>}
    </div>
  );
}

// Main Detail Page
export default function CharacterDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await charactersAPI.getOne(id);
        setCharacter(res.data);
      } catch {
        setError("Character not found.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm(`Delete ${character.name}? This cannot be undone.`)) return;
    try {
      await charactersAPI.delete(id);
      navigate("/dashboard");
    } catch {
      alert("Failed to delete.");
    }
  };

  if (loading) return <div className="loading">Loading character...</div>;
  if (error)
    return (
      <div className="page-container">
        <div className="error-banner">{error}</div>
      </div>
    );

  const pb = profBonus(character.level);
  const skills = character.skills || {};
  const savingThrows = character.savingThrows || {};

  return (
    <div className="page-container fade-in">
      {/* Header */}
      <div className="detail-header">
        <div>
          <Link to="/dashboard" className="back-link">
            ← Back to Dashboard
          </Link>
          <h1 className="detail-name">{character.name}</h1>
          <p className="detail-subtitle">
            Level {character.level} {character.race} {character.class}
            {character.background ? ` • ${character.background}` : ""}
          </p>
        </div>
        <div className="detail-actions">
          <Link to={`/characters/${id}/edit`} className="btn btn-gold">
            Edit Character
          </Link>
          <button className="btn btn-danger" onClick={handleDelete}>
            Delete
          </button>
        </div>
      </div>

      <div className="detail-layout">
        {/* Left column */}
        <div className="detail-left">
          {/* Ability Scores */}
          <div className="card">
            <h2 className="section-title">Ability Scores</h2>
            <div className="ability-grid">
              {ABILITIES.map(({ key, label }) => (
                <div key={key} className="stat-box">
                  <span className="stat-label">
                    {label.slice(0, 3).toUpperCase()}
                  </span>
                  <span className="stat-value">{character[key]}</span>
                  <span className="stat-mod">{fmtMod(character[key])}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Saving Throws */}
          <div className="card" style={{ marginTop: "1rem" }}>
            <h2 className="section-title">Saving Throws</h2>
            <div className="saves-list">
              {ABILITIES.map(({ key, label }) => {
                const prof = savingThrows[key];
                const bonus = getMod(character[key]) + (prof ? pb : 0);
                return (
                  <div key={key} className="save-row">
                    <span className={`prof-dot ${prof ? "proficient" : ""}`} />
                    <span className="save-val">
                      {bonus >= 0 ? `+${bonus}` : bonus}
                    </span>
                    <span className="save-name">{label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Skills */}
          <div className="card" style={{ marginTop: "1rem" }}>
            <h2 className="section-title">Skills</h2>
            <div className="saves-list">
              {SKILLS.map(({ key, label, ability }) => {
                const prof = skills[key];
                const bonus = getMod(character[ability]) + (prof ? pb : 0);
                return (
                  <div key={key} className="save-row">
                    <span className={`prof-dot ${prof ? "proficient" : ""}`} />
                    <span className="save-val">
                      {bonus >= 0 ? `+${bonus}` : bonus}
                    </span>
                    <span className="save-name">{label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="detail-right">
          {/* Combat Stats */}
          <div className="card">
            <h2 className="section-title">Combat</h2>
            <div className="combat-row">
              <div className="stat-box">
                <span className="stat-label">Armor Class</span>
                <span className="stat-value">{character.armorClass}</span>
              </div>
              <div className="stat-box">
                <span className="stat-label">Initiative</span>
                <span className="stat-value">
                  {fmtMod(character.dexterity)}
                </span>
              </div>
              <div className="stat-box">
                <span className="stat-label">Speed</span>
                <span className="stat-value">{character.speed}</span>
                <span className="stat-mod">ft</span>
              </div>
              <div className="stat-box">
                <span className="stat-label">Hit Dice</span>
                <span className="stat-value" style={{ fontSize: "1rem" }}>
                  {character.hitDice}
                </span>
              </div>
              <div className="stat-box">
                <span className="stat-label">Prof. Bonus</span>
                <span className="stat-value">+{pb}</span>
              </div>
            </div>
          </div>

          {/* Advanced Feature: Live HP Tracker */}
          <HpTracker character={character} onUpdate={setCharacter} />

          {/* Details */}
          {[
            { key: "abilities", label: "✨ Features & Abilities" },
            { key: "weapons", label: "⚔️ Weapons & Attacks" },
            { key: "inventory", label: "🎒 Inventory" },
            { key: "spells", label: "🔮 Spells" },
            { key: "notes", label: "📜 Notes" },
          ].map(({ key, label }) =>
            character[key] ? (
              <div key={key} className="card detail-text-card">
                <h2 className="section-title">{label}</h2>
                <p className="detail-text">{character[key]}</p>
              </div>
            ) : null,
          )}
        </div>
      </div>
    </div>
  );
}
