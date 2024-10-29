import React, { useEffect } from "react";
import LogoutButton from "../components/LogoutButton";
import LoginButton from "../components/LoginButton";
import ProductList from "../components/ProductList";
import ReviewList from "../components/ReviewList";
import { useAuth } from "../context/useAuth";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import "../styles/PageLayout.css";

const StorePage: React.FC = () => {
  const { isLoggedIn, setIsLoggedIn, user } = useAuth();
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

  const handleAdminPageClick = () => {
    navigate("/adminpage");
  };

  return (
    <div className="page-layout">
      {isLoggedIn ? <LogoutButton /> : <LoginButton />}
      {isLoggedIn && user?.access_level === 2 && (
        <button onClick={handleAdminPageClick} className="admin-button">
          Adminpanel
        </button>
      )}
      <div className="page-content">
        <h1 className="page-title">HÄR ÄR AFFÄREN!</h1>
        <ProductList />
        <ReviewList />
        <button className="review-button" onClick={() => navigate("/review")}>
          Lämna en recension
        </button>
      </div>
    </div>
  );
};

export default StorePage;
