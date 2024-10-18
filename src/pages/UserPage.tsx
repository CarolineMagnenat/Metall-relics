import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LogoutButton from "../components/LogoutButton";
import "../styles/PageLayout.css";

const UserPage: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserPage = async () => {
      try {
        const response = await fetch("http://localhost:3000/userpage", {
          method: "GET",
          credentials: "include", // Detta skickar cookies automatiskt
        });

        if (response.ok) {
          const data = await response.json();
          setMessage(data.message);
          setIsLoggedIn(true); // Inloggning lyckades, visa sidan
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
