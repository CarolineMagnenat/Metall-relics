import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import LogoutButton from "../components/LogoutButton";
import "../styles/login-attempts.css";

interface LoginAttempt {
  id: number;
  username: string;
  attempt_time: string;
  success: boolean;
  ip_address: string;
  user_agent: string;
}

const AdminPage: React.FC = () => {
  const { isLoggedIn, user } = useAuth();
  const [message, setMessage] = useState<string>("");
  const [loginAttempts, setLoginAttempts] = useState<LoginAttempt[]>([]);
  const navigate = useNavigate();

  console.log("ADMIN - Är användaren inloggad:", isLoggedIn);
  console.log("ADMIN - Användarinformation:", user);

  useEffect(() => {
    const fetchAdminPage = async () => {
      try {
        const response = await fetch("http://localhost:1337/adminpage", {
          method: "GET",
          credentials: "include", // Skicka cookies automatiskt
        });

        if (response.ok) {
          const data = await response.json();
          setMessage(data.message);

          // Hämta inloggningsförsök
          const loginAttemptsResponse = await fetch(
            "http://localhost:1337/login-attempts",
            {
              method: "GET",
              credentials: "include", // Skicka cookies automatiskt
            }
          );

          if (loginAttemptsResponse.ok) {
            const attemptsData = await loginAttemptsResponse.json();
            setLoginAttempts(attemptsData);
          } else {
            console.error("Fel vid hämtning av inloggningsförsök");
          }
        } else {
          setMessage("Åtkomst nekad. Omdirigerar till inloggningssidan...");
          setTimeout(() => {
            console.log("oj oj coolt osv");
            //navigate("/");
          }, 1500);
        }
      } catch (error) {
        console.error("Fel vid hämtning av adminsidan:", error);
        setMessage("Serverfel. Försök igen senare.");
      }
    };

    fetchAdminPage();
  }, [isLoggedIn, user]);

  // Funktion för att förenkla user agent-strängen
  const simplifyUserAgent = (userAgent: string) => {
    if (!userAgent) return "Unknown";
    userAgent = userAgent.toLowerCase();

    if (userAgent.includes("chrome") && !userAgent.includes("edg")) {
      return "Chrome";
    } else if (userAgent.includes("safari") && !userAgent.includes("chrome")) {
      return "Safari";
    } else if (userAgent.includes("firefox")) {
      return "Firefox";
    } else if (userAgent.includes("edg")) {
      return "Edge";
    } else if (userAgent.includes("opera") || userAgent.includes("opr")) {
      return "Opera";
    } else {
      return "Unknown";
    }
  };

  const latestLoginAttempts = [...loginAttempts]
    .sort(
      (a, b) =>
        new Date(b.attempt_time).getTime() - new Date(a.attempt_time).getTime()
    )
    .slice(0, 100);

  const handleAddProductClick = () => {
    navigate("/add-product"); // Navigera till sidan där admin kan lägga till produkt
  };

  const handleHomeClick = () => {
    navigate("/");
  };

  return (
    <div className="page-layout">
      {isLoggedIn && <LogoutButton />}
      <button className="add-product-button" onClick={handleAddProductClick}>
        Lägg till ny produkt
      </button>
      <button onClick={handleHomeClick} className="home-button">
        Till Hem
      </button>
      <div className="page-content">
        <h1 className="page-title">Adminsida</h1>
        <p>{message}</p>

        <div className="login-attempts-container">
          {latestLoginAttempts.map((attempt, index) => (
            <div className="login-attempt-row" key={index}>
              <div className="login-attempt-cell">{attempt.id}</div>
              <div className="login-attempt-cell">{attempt.username}</div>
              <div className="login-attempt-cell">
                {new Date(attempt.attempt_time).toLocaleString()}
              </div>
              <div className="login-attempt-cell">
                {attempt.success ? (
                  <span className="success-text">Ja</span>
                ) : (
                  <span className="error-text">Nej</span>
                )}
              </div>
              <div className="login-attempt-cell">{attempt.ip_address}</div>
              <div className="login-attempt-cell">
                {simplifyUserAgent(attempt.user_agent)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
