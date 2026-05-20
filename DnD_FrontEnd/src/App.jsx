import { useState, useEffect } from "react";
import { Box, Button, Flex, Text, Heading } from "@chakra-ui/react";
import AuthForm from "./components/AuthForm";
import CharacterList from "./components/CharacterList";
import CharacterForm from "./components/CharacterForm";

function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("auth");
  const [editingCharacter, setEditingCharacter] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (token && userData) {
      setUser(JSON.parse(userData));
      setView("list");
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setView("list");
  };

  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    await fetch("http://localhost:8000/logout", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setView("auth");
  };

  const handleCreate = () => {
    setEditingCharacter(null);
    setView("form");
  };

  const handleEdit = (character) => {
    setEditingCharacter(character);
    setView("form");
  };

  const handleSave = () => {
    setView("list");
  };

  const handleCancel = () => {
    setView("list");
  };

  if (view === "auth") {
    return <AuthForm onLogin={handleLogin} />;
  }

  return (
    <Box p={{ base: 4, md: 8 }}>
      <Flex justify="space-between" align="center" mb={6} wrap="wrap" gap={4}>
        <Box>
          <Heading size="lg">DnD Character Manager</Heading>
          <Text color="gray.500">Welcome, {user?.displayName}!</Text>
        </Box>
        <Button colorScheme="teal" onClick={handleLogout} variant="outline">
          Logout
        </Button>
      </Flex>
      {view === "list" && (
        <CharacterList onEdit={handleEdit} onCreate={handleCreate} />
      )}
      {view === "form" && (
        <CharacterForm
          character={editingCharacter}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
    </Box>
  );
}

export default App;
