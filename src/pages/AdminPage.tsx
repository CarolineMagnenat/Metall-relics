import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LogoutButton from "../components/LogoutButton";

const AdminPage: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminPage = async () => {
      try {
        const response = await fetch("http://localhost:3000/adminpage", {
          method: "GET",
          credentials: "include", // Skicka cookies automatiskt
        });

        if (response.ok) {
          const data = await response.json();
          setMessage(data.message);
          setIsLoggedIn(true); // Inloggning lyckades
        } else {
          setMessage("Åtkomst nekad. Omdirigerar till inloggningssidan...");
          setTimeout(() => {
            navigate("/");
          }, 1500);
        }
      } catch (error) {
        console.error("Fel vid hämtning av adminsidan:", error);
        setMessage("Serverfel. Försök igen senare.");
      }
    };

    fetchAdminPage();
  }, [navigate]);

  return (
    <div className="page-layout">
      {isLoggedIn && <LogoutButton />}
      <div className="page-content">
        <h1 className="page-title">Adminsida</h1>
        <p>{message}</p>
      </div>
    </div>
  );
};

export default AdminPage;
