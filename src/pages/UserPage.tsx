import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LogoutButton from "../components/LogoutButton";
import "../styles/PageLayout.css";

const UserPage: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Knas du saknar nått, skickar dej till inloggningssidan...");
      setTimeout(() => {
        navigate("/");
      }, 1500);
      return;
    } else {
      setIsLoggedIn(true);
    }

    const fetchUserPage = async () => {
      try {
        const response = await fetch("http://localhost:3000/userpage", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setMessage(data.message);
        } else {
          setMessage("Åtkomst nekad. Omdirigerar till inloggningssidan...");
          setTimeout(() => {
            navigate("/");
          }, 1500);
        }
      } catch (error) {
        console.error("Fel vid hämtning av användarsidan:", error);
        setMessage("Serverfel. Försök igen senare.");
      }
    };

    fetchUserPage();
  }, [navigate]);

  return (
    <div className="page-layout">
      {isLoggedIn && <LogoutButton />}
      <div className="page-content">
        <h1 className="page-title">Användarsida</h1>
        <p>{message}</p>
      </div>
    </div>
  );
};

export default UserPage;
