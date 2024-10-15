import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/LogoutButton.css";

const LogoutButton: React.FC = () => {
  // Använd React-router-dom för navigering
  const navigate = useNavigate();

  // Funktion för att hantera utloggning
  const handleLogout = () => {
    // 1. Ta bort token från sessionStorage
    localStorage.removeItem("token");
    console.log("Användare har loggat ut, token borttagen från sessionStorage");

    // 2. Omdirigera till startsidan (t.ex. login-sidan)
    navigate("/");
  };

  // Rendera knappen med en enkel onClick-handler som anropar handleLogout
  return (
    <button onClick={handleLogout} className="logout-button">
      Logga ut
    </button>
  );
};

export default LogoutButton;
