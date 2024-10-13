import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import jwtDecode from "jwt-decode"; // Korrekt import av jwt-decode för TypeScript

// Definiera ett interface för token-payloaden
interface DecodedJwtPayload {
  username: string;
  access_level: number;
  iat: number;
  exp: number;
}

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Spara tokenen i localStorage
        localStorage.setItem("token", data.token);
        setMessage("Inloggning lyckades!");

        // Dekryptera tokenen för att kontrollera användarrollen
        const decodedToken = jwtDecode<DecodedJwtPayload>(data.token);

        // Kontrollera access level och navigera till rätt sida
        if (decodedToken.access_level === 2) {
          // Administratör: omdirigera till adminsidan
          navigate("/adminpage");
        } else {
          // Vanlig användare: omdirigera till användarsidan
          navigate("/userpage");
        }
      } else {
        // Visa felmeddelande om inloggningen misslyckades
        setMessage(data.message || "Inloggning misslyckades");
      }
    } catch (error) {
      console.error("Fel vid inloggning:", error);
      setMessage("Serverfel, försök igen senare.");
    }
  };

  return (
    <div className="login-page">
      <h1>Inloggning</h1>
      <form onSubmit={handleLogin}>
        <div>
          <label htmlFor="username">Användarnamn:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Lösenord:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Logga in</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default LoginPage;
