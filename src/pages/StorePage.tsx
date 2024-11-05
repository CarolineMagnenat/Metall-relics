import React, { useEffect } from "react";
import LogoutButton from "../components/LogoutButton";
import LoginButton from "../components/LoginButton";
import ProductList from "../components/ProductList";
import ReviewList from "../components/ReviewList";
import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";
import "../styles/PageLayout.css";

const StorePage: React.FC = () => {
  const { isLoggedIn, user, getToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = getToken();
    if (isLoggedIn) {
      console.log("STOREPAGE - Användaren är inloggad. Här är tokenen:", token);
    } else {
      console.log("STOREPAGE - Användaren är inte inloggad.");
    }
  }, [getToken, isLoggedIn]);

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
