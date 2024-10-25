import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Button.css";

const HomeButton: React.FC = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <button onClick={handleGoHome} className="go-home-button">
      Tillbaka till Hemsidan
    </button>
  );
};

export default HomeButton;
