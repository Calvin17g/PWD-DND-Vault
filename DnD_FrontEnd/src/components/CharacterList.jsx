import { useState, useEffect, useCallback, memo } from "react";
import { FiEdit, FiTrash } from "react-icons/fi";

const API_BASE = "http://localhost:3000";

const CharacterItem = memo(({ char, onEdit, onDelete }) => (
  <div
    onDoubleClick={() => onEdit(char)}
    style={{
      border: "1px solid #ccc",
      padding: "10px",
      marginBottom: "10px",
      cursor: "pointer",
    }}
  >
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <div>
        <h3>{char.name}</h3>
        <p>
          {char.race} {char.class} Level {char.level}
        </p>
      </div>
      <div>
        <button onClick={() => onEdit(char)}>
          <FiEdit />
        </button>
        <button onClick={() => onDelete(char.id)}>
          <FiTrash />
        </button>
      </div>
    </div>
  </div>
));

function CharacterList({ onEdit, onCreate }) {
  const [characters, setCharacters] = useState([]);

  const fetchCharacters = useCallback(async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE}/characters`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setCharacters(data);
    }
  }, []);

  useEffect(() => {
    fetchCharacters();
  }, [fetchCharacters]);

  const handleDelete = useCallback(
    async (id) => {
      const token = localStorage.getItem("token");
      await fetch(`${API_BASE}/characters/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCharacters();
    },
    [fetchCharacters],
  );

  return (
    <div style={{ padding: "20px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <h1>My Characters</h1>
        <button onClick={onCreate}>Create New</button>
      </div>
      <div>
        {characters.map((char) => (
          <CharacterItem
            key={char.id}
            char={char}
            onEdit={onEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
}

export default memo(CharacterList);
