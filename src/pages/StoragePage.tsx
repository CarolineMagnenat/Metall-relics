import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LogoutButton from "../components/LogoutButton";

const StoragePage: React.FC = () => {
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
  }, [navigate]);

  return (
    <div className="page-layout">
      {isLoggedIn && <LogoutButton />}
      <div className="page-content">
        <h1 className="page-title">HÄR ÄR AFFÄREN!</h1>
        <p>{message}</p>
      </div>
    </div>
  );
};

export default StoragePage;
