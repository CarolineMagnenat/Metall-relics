import React, { useState } from "react";

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>(""); // Nytt fält för lösenordsbekräftelse
  const [message, setMessage] = useState<string>("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Kontrollera att lösenorden matchar innan du skickar dem till servern
    if (password !== confirmPassword) {
      setMessage("Lösenorden matchar inte!");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        setMessage("Registreringen lyckades!");
        setUsername("");
        setPassword("");
        setConfirmPassword("");
      } else {
        const data = await response.json();
        setMessage(data.message || "Något gick fel");
      }
    } catch (error) {
      console.error("Fel vid registrering:", error);
      setMessage("Serverfel, försök igen senare.");
    }
  };

  return (
    <div className="register-page">
      <h1 className="register-title">Registrera dig</h1>
      <form className="register-form" onSubmit={handleRegister}>
        <div className="form-group">
          <label htmlFor="reg-username">Användarnamn:</label>
          <input
            type="text"
            id="reg-username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="reg-password">Lösenord:</label>
          <input
            type="password"
            id="reg-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Bekräfta lösenord:</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button className="register-button" type="submit">
          Registrera dig
        </button>
      </form>
      {message && <p className="register-message">{message}</p>}
    </div>
  );
};

export default RegisterPage;
