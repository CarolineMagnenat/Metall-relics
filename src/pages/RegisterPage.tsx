import React, { useState } from "react";
import zxcvbn from "zxcvbn";

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>(""); // Nytt fält för lösenordsbekräftelse
  const [message, setMessage] = useState<string>("");
  const [passwordStrength, setPasswordStrength] = useState<number>(0);
  const [passwordFeedback, setPasswordFeedback] = useState<string>("");

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);

    // Analysera lösenordets styrka med zxcvbn
    const result = zxcvbn(newPassword);
    setPasswordStrength(result.score); // Scoren är mellan 0 (mycket svagt) och 4 (väldigt starkt)

    // Sätt feedback-meddelandet baserat på resultatet från zxcvbn
    if (result.feedback.suggestions.length > 0) {
      setPasswordFeedback(result.feedback.suggestions.join(" "));
    } else {
      setPasswordFeedback("");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Kontrollera att lösenorden matchar innan du skickar dem till servern
    if (password !== confirmPassword) {
      setMessage("Lösenorden matchar inte!");
      return;
    }

    // Lösenordet får inte vara samma som användarnamnet
    if (username && password.toLowerCase() === username.toLowerCase()) {
      setMessage("Lösenordet får inte vara samma som användarnamnet.");
      return;
    }

    // Kolla att lösenordet är tillräckligt starkt (t.ex. minst 3 av 4)
    if (passwordStrength < 3) {
      setMessage("Lösenordet är för svagt. Försök med ett starkare lösenord.");
      return;
    }

    try {
      const response = await fetch("http://localhost:1337/register", {
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
        setPasswordStrength(0);
        setPasswordFeedback("");
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
            onChange={handlePasswordChange}
            required
          />
          {password.length > 0 && (
            <div className="password-strength">
              {passwordStrength === 0 && <p>Styrka: Mycket svagt</p>}
              {passwordStrength === 1 && <p>Styrka: Svagt</p>}
              {passwordStrength === 2 && <p>Styrka: Medel</p>}
              {passwordStrength === 3 && <p>Styrka: Starkt</p>}
              {passwordStrength === 4 && <p>Styrka: Väldigt starkt</p>}
              {passwordFeedback && (
                <div className="password-feedback">
                  <p>Tips: {passwordFeedback}</p>
                </div>
              )}
            </div>
          )}
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
