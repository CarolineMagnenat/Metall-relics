import React, { useEffect } from "react";
import LogoutButton from "../components/LogoutButton";
import LoginButton from "../components/LoginButton";
import { useAuth } from "../context/useAuth";
import Cookies from "js-cookie";
import "../styles/PageLayout.css";

const StorePage: React.FC = () => {
  const { isLoggedIn, setIsLoggedIn } = useAuth();

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
      </div>
    </div>
  );
};

export default StorePage;
