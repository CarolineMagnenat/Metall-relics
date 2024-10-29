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
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = Cookies.get("token");
      if (token) {
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
            setIsLoggedIn(false);
            setUser(null);
          }
        } catch (error) {
          console.error("Kunde inte verifiera token:", error);
          setIsLoggedIn(false);
          setUser(null);
        }
      }
    };

    checkAuthStatus();
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
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
