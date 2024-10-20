import React from "react";
import "../styles/AuthButton.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const LogoutButton: React.FC = () => {
  const { setIsLoggedIn } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:3000/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        console.log("Användare har loggat ut, cookie borttagen");
        setIsLoggedIn(false);
        navigate("/");
      } else {
        console.error("Misslyckades med att logga ut");
      }
    } catch (error) {
      console.error("Fel vid utloggning:", error);
    }
  };

  return (
    <button onClick={handleLogout} className="auth-button">
      Logga ut
    </button>
  );
};

export default LogoutButton;
