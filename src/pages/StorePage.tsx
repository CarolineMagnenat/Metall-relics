import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LogoutButton from "../components/LogoutButton";

const StorePage: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsLoggedIn(false);
    } else {
      setIsLoggedIn(true);
    }
  }, [navigate]);

  return (
    <div className="page-layout">
      {isLoggedIn && <LogoutButton />}
      <div className="page-content">
        <h1 className="page-title">HÄR ÄR AFFÄREN!</h1>
      </div>
    </div>
  );
};

export default StorePage;
