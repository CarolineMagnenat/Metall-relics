import React, { useEffect } from "react";
import LogoutButton from "../components/LogoutButton";
import LoginButton from "../components/LoginButton";
import ReviewList from "../components/ReviewList";
import { useAuth } from "../context/useAuth";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import "../styles/PageLayout.css";

const StorePage: React.FC = () => {
  const { isLoggedIn, setIsLoggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkLoginStatus = () => {
      setTimeout(() => {
        const token = Cookies.get("token");

        if (token) {
          console.log("Token hittades, användare är inloggad.");
          setIsLoggedIn(true);
        } else {
          console.log("Ingen token hittades, användare är inte inloggad.");
          setIsLoggedIn(false);
        }
      }, 500);
    };

    checkLoginStatus();
  }, [setIsLoggedIn]);

  return (
    <div className="page-layout">
      {isLoggedIn ? <LogoutButton /> : <LoginButton />}
      <div className="page-content">
        <h1 className="page-title">HÄR ÄR AFFÄREN!</h1>
        <button
          className="review-button"
          onClick={() => navigate("/review")} // Navigerar till ReviewPage
        >
          Lämna en recension
        </button>
        <ReviewList />
      </div>
    </div>
  );
};

export default StorePage;
