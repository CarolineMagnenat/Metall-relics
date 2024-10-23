import React, { useState, useEffect } from "react";
import { Rating } from "react-simple-star-rating";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import Cookies from "js-cookie";
import "../styles/ReviewPage.css";

const ReviewPage: React.FC = () => {
  const { isLoggedIn, user } = useAuth();
  const [username, setUsername] = useState<string>("Anonym");
  const [rating, setRating] = useState<number>(1);
  const [reviewText, setReviewText] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsername = async () => {
      const token = Cookies.get("token");

      if (token) {
        try {
          const response = await fetch("http://localhost:3000/userinfo", {
            method: "GET",
            credentials: "include",
          });

          if (response.ok) {
            const userData = await response.json();
            setUsername(userData.username);
          } else {
            console.error("Misslyckades att hämta användarnamn");
          }
        } catch (error) {
          console.error("Fel vid hämtning av användarinformation:", error);
        }
      } else {
        setUsername("Anonym"); // Sätt till "Anonym" om användaren inte är inloggad
      }
    };

    fetchUsername();
  }, [isLoggedIn]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3000/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          review: reviewText,
          rating: String(rating),
        }),
        credentials: "include",
      });

      if (response.ok) {
        setMessage("Recensionen skickades in! Tack för din feedback.");
        setReviewText("");

        setTimeout(() => {
          navigate("/");
        }, 1000);
      } else {
        setMessage("Något gick fel, försök igen.");
      }
    } catch (error) {
      console.error("Fel vid inlämning av recension:", error);
      setMessage("Serverfel, försök igen senare.");
    }
  };

  const handleRating = (rate: number) => {
    setRating(rate);
  };
  // TODO skydda mot xss
  return (
    <div className="review-page">
      <h1 className="review-title">Lämna en recension</h1>
      {user?.username && (
        <p className="review-username">Inloggad som: {user?.username}</p>
      )}
      <form className="review-form" onSubmit={handleReviewSubmit}>
        <div className="rating-section">
          <label>Välj betyg:</label>
          <Rating onClick={handleRating} />
        </div>
        <div className="form-group">
          <label htmlFor="review">Din recension:</label>
          <textarea
            id="review"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            required
            rows={5}
          />
        </div>
        <button className="review-button" type="submit">
          Skicka recension
        </button>
      </form>
      {message && <p className="review-message">{message}</p>}
    </div>
  );
};

export default ReviewPage;
