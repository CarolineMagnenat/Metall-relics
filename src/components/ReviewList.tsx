import React, { useEffect, useState } from "react";
import { useAuth } from "../context/useAuth";
import "../styles/ReviewList.css";

interface Review {
  id: number;
  username: string;
  review: string;
  created_at: string;
}

const ReviewList: React.FC = () => {
  const { isLoggedIn, user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);

  // Hämta recensioner från backend
  useEffect(() => {
    console.log("Är användaren inloggad:", isLoggedIn);
    console.log("Användarinformation:", user);

    const fetchReviews = async () => {
      try {
        const response = await fetch("http://localhost:3000/reviews", {
          method: "GET",
        });

        if (response.ok) {
          const data = await response.json();
          setReviews(data);
        } else {
          console.error("Fel vid hämtning av recensioner");
        }
      } catch (error) {
        console.error("Serverfel vid hämtning av recensioner:", error);
      }
    };

    fetchReviews();
  }, []);

  // Ta bort recension
  const handleDeleteReview = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:3000/reviews/${id}`, {
        method: "DELETE",
        credentials: "include", // Skicka med credentials (ex. cookies) för autentisering
      });

      if (response.ok) {
        // Uppdatera listan med recensioner genom att filtrera bort den borttagna
        setReviews((prevReviews) =>
          prevReviews.filter((review) => review.id !== id)
        );
      } else {
        console.error("Misslyckades med att ta bort recension");
      }
    } catch (error) {
      console.error("Fel vid borttagning av recension:", error);
    }
  };

  return (
    <div className="reviews-container">
      <h2 className="reviews-title">Recensioner:</h2>
      <div className="reviews-list">
        {reviews.length === 0 ? (
          <p>Det finns inga recensioner ännu.</p>
        ) : (
          reviews.map((r) => (
            <div key={r.id} className="review-item">
              <p className="review-author">
                {r.username === "Anonymous" ? "Anonym" : r.username}
              </p>
              <p className="review-text">{r.review}</p>
              <p className="review-date">
                {new Date(r.created_at).toLocaleString()}
              </p>
              {/* Visa "Radera"-knappen om användaren är inloggad som administratör */}
              {isLoggedIn && user?.access_level === 2 && (
                <button
                  className="delete-button"
                  onClick={() => handleDeleteReview(r.id)}
                >
                  Radera
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewList;
