import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/LoginPage.css";

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
        credentials: "include",
      });

      if (response.ok) {
        setMessage("Inloggning lyckades!");

        const userInfoResponse = await fetch("http://localhost:3000/userinfo", {
          method: "GET",
          credentials: "include",
        });

        if (userInfoResponse.ok) {
          navigate("/");
        } else {
          const data = await response.json();
          setMessage(data.message);
        }
      }
    } catch (error) {
      console.error("Något gick fel vid inloggning:", error);
      setMessage("Något gick fel vid inloggning, försök igen senare");
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
