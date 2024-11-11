import React, { createContext, useState, useEffect, ReactNode } from "react";
import Cookies from "js-cookie";

interface User {
  username: string;
  access_level: number;
}

interface AuthContextType {
  isLoggedIn: boolean;
  setIsLoggedIn: (loggedIn: boolean) => void;
  user: User | null;
  setUser: (user: User | null) => void;
  getToken: () => string | undefined;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  const getToken = () => {
    const token = Cookies.get("token");
    // console.log("AuthProvider - Hämtar token från Cookies: ", token); // Logga ut token varje gång getToken kallas
    return token;
  };

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = getToken();
      if (token) {
        //console.log("AuthProvider: Token hittades i Cookies:", token);
        try {
          const response = await fetch("http://localhost:1337/verify-token", {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            credentials: "include",
          });

          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
            setIsLoggedIn(true);
          } else {
            console.warn("AuthProvider: Token kunde inte verifieras");
            setIsLoggedIn(false);
            setUser(null);
          }
        } catch (error) {
          console.error("AuthProvider: Kunde inte verifiera token:", error);
          setIsLoggedIn(false);
          setUser(null);
        }
      } else {
        console.log("AuthProvider: Ingen token hittades i Cookies.");
      }
    };

    setTimeout(() => {
      checkAuthStatus();
    }, 300);

    // Lägg till en event listener för att reagera på förändringar i cookien
    const handleStorageChange = () => {
      checkAuthStatus(); // Verifiera token igen om något ändras
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    const logoutUser = () => {
      Cookies.remove("token");

      fetch("http://localhost:1337/logout", {
        method: "POST",
        credentials: "include", // Inkluderar cookies
      })
        .then(() => {
          setIsLoggedIn(false);
          setUser(null);
          window.location.href = "/login";
        })
        .catch((error) => {
          console.error("Logout failed:", error);
        });
    };

    let logoutTimer = setTimeout(logoutUser, 300000); // 5 min = 300000

    const resetTimer = () => {
      clearTimeout(logoutTimer);
      logoutTimer = setTimeout(logoutUser, 300000);
    };

    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("click", resetTimer);
    window.addEventListener("scroll", resetTimer);

    return () => {
      clearTimeout(logoutTimer);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("click", resetTimer);
      window.removeEventListener("scroll", resetTimer);
    };
  }, [isLoggedIn]);

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, setIsLoggedIn, user, setUser, getToken }}
    >
      {children}
    </AuthContext.Provider>
  );
};
