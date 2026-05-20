import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { charactersAPI } from "../api";
import { useAuth } from "../context/AuthContext";
import "./DashboardPage.css";

// Helper: calculate ability score modifier
const getMod = (score) => Math.floor((score - 10) / 2);
const formatMod = (score) => {
  const m = getMod(score);
  return m >= 0 ? `+${m}` : `${m}`;
};

// Character card shown in the dashboard grid
function CharacterCard({ character, onDelete }) {
  const navigate = useNavigate();

  const handleDelete = async (e) => {
    e.preventDefault();
    if (!confirm(`Are you sure you want to delete ${character.name}?`)) return;
    try {
      await charactersAPI.delete(character.id);
      onDelete(character.id);
    } catch {
      alert("Failed to delete character.");
    }
  };

  return (
    <div
      className="char-card card fade-in"
      onClick={() => navigate(`/characters/${character.id}`)}
    >
      <div className="char-card-header">
        <div>
          <h2 className="char-name">{character.name}</h2>
          <p className="char-subtitle">
            Level {character.level} {character.race} {character.class}
          </p>
        </div>
        <div className="char-level-badge">{character.level}</div>
      </div>

      <div className="char-stats-row">
        <div className="char-stat-mini">
          <span className="csl">HP</span>
          <span className="csv">
            {character.hitPoints}/{character.maxHitPoints}
          </span>
        </div>
        <div className="char-stat-mini">
          <span className="csl">AC</span>
          <span className="csv">{character.armorClass}</span>
        </div>
        <div className="char-stat-mini">
          <span className="csl">SPD</span>
          <span className="csv">{character.speed}ft</span>
        </div>
        <div className="char-stat-mini">
          <span className="csl">INIT</span>
          <span className="csv">{formatMod(character.dexterity)}</span>
        </div>
      </div>

      <div className="char-card-footer" onClick={(e) => e.stopPropagation()}>
        <Link
          to={`/characters/${character.id}/edit`}
          className="btn btn-ghost btn-sm"
        >
          Edit
        </Link>
        <button className="btn btn-danger btn-sm" onClick={handleDelete}>
          Delete
        </button>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const res = await charactersAPI.getAll();
        setCharacters(res.data);
      } catch {
        setError("Failed to load characters.");
      } finally {
        setLoading(false);
      }
    };
    fetchCharacters();
  }, []);

  const handleDelete = (id) => {
    setCharacters((prev) => prev.filter((c) => c.id !== id));
  };

  if (loading) return <div className="loading">Loading your characters...</div>;

  return (
    <div className="page-container fade-in">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Your Characters</h1>
          <p className="dashboard-sub">Welcome back, {user?.username}</p>
        </div>
        <Link to="/characters/new" className="btn btn-gold">
          + New Character
        </Link>
      </div>

      <div className="divider">⚔️</div>

      {error && <div className="error-banner">{error}</div>}

      {characters.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎲</div>
          <h2>No characters yet</h2>
          <p>Your adventure begins with a single character sheet.</p>
          <Link
            to="/characters/new"
            className="btn btn-primary"
            style={{ marginTop: "1rem" }}
          >
            Create Your First Character
          </Link>
        </div>
      ) : (
        <div className="char-grid">
          {characters.map((char) => (
            <CharacterCard
              key={char.id}
              character={char}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
