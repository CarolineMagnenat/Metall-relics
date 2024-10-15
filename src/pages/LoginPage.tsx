import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import jwtDecode from "jwt-decode"; // Korrekt import av jwt-decode för TypeScript
import "../styles/LoginPage.css";

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
        console.log("token", data.token);
        setMessage("Inloggning lyckades!");

        // Dekryptera tokenen för att kontrollera användarrollen
        const decodedToken = jwtDecode<DecodedJwtPayload>(data.token);
        console.log("decodedToken: ", decodedToken);

        setTimeout(() => {
          if (decodedToken.access_level === 2) {
            // Administratör: omdirigera till adminsidan
            console.log("Omdirigerar till adminsidan");
            navigate("/adminpage");
          } else if (decodedToken.access_level === 1) {
            // Vanlig användare: omdirigera till användarsidan
            console.log("Omdirigerar till användarsidan");
            navigate("/userpage");
          } else {
            console.log("Okänd access level, omdirigerar till startsidan");
            navigate("/");
          }
        }, 500); // Vänta en halv sekund innan omdirigering
      } else {
        setMessage(data.message || "Inloggning misslyckades");
      }
    } catch (error) {
      console.error("Fel vid inloggning:", error);
      setMessage("Serverfel, försök igen senare.");
    }
  };

  return (
    <div className="login-page">
      <h1 className="login-title">Inloggning</h1>
      <form className="login-form" onSubmit={handleLogin}>
        <div className="form-group">
          <label htmlFor="username">Användarnamn:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Lösenord:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button className="login-button" type="submit">
          Logga in
        </button>
      </form>
      {message && <p className="login-message">{message}</p>}
    </div>
  );
};

export default LoginPage;
