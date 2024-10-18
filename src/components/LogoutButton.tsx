import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/LogoutButton.css";

const LogoutButton: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    console.log("Användare har loggat ut, token borttagen från sessionStorage");

    navigate("/");
  };

  return (
    <button onClick={handleLogout} className="logout-button">
      Logga ut
    </button>
  );
};

export default LogoutButton;
