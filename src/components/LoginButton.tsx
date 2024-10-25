import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Button.css";

const LoginButton: React.FC = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate("/login"); // Navigera till inloggningssidan
  };

  return (
    <button onClick={handleLoginClick} className="auth-button">
      Logga in
    </button>
  );
};

export default LoginButton;
