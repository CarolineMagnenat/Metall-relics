import React, { useEffect } from "react";
import LogoutButton from "../components/LogoutButton";
import LoginButton from "../components/LoginButton";
import { useAuth } from "../context/AuthContext";
import "../styles/PageLayout.css";

const StorePage: React.FC = () => {
  const { isLoggedIn, setIsLoggedIn } = useAuth();

  useEffect(() => {
    const checkLoginStatus = () => {
      // Hämta alla cookies som ett objekt
      const cookies = document.cookie
        .split(";")
        .map((cookie) => cookie.trim())
        .reduce((acc, cookie) => {
          const [key, value] = cookie.split("=");
          acc[key] = value;
          return acc;
        }, {} as Record<string, string>);

      if (cookies.token) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    };

    // Kör kontrollen när komponenten laddas
    checkLoginStatus();
  }, []);

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
