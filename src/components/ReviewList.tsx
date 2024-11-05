import React, { useEffect, useState } from "react";
import { useAuth } from "../context/useAuth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import "../styles/ReviewList.css";

interface Review {
  id: number;
  username: string;
  review: string;
  created_at: string;
  rating: number;
}

const ReviewList: React.FC = () => {
  const { isLoggedIn, user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    //console.log("Är användaren inloggad:", isLoggedIn);
    //console.log("Användarinformation:", user);

    const fetchReviews = async () => {
      try {
        const response = await fetch("http://localhost:1337/reviews", {
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
  }, [isLoggedIn, user]);

  // Ta bort recension
  const handleDeleteReview = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:1337/reviews/${id}`, {
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

  // Funktion för att rendera stjärnor baserat på betyg
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(
          <div key={i} className="star filled">
            ★
          </div>
        );
      } else {
        stars.push(
          <div key={i} className="star">
            ☆
          </div>
        );
      }
    }
    return stars;
  };

  return (
    <div className="reviews-container">
      <h2 className="reviews-title">Recensioner:</h2>
      <div className="reviews-list">
        {reviews.length === 0 ? (
          <div className="no-reviews-message">
            Det finns inga recensioner ännu.
          </div>
        ) : (
          reviews.map((r) => (
            <div key={r.id} className="review-item">
              {isLoggedIn && user?.access_level === 2 && (
                <button
                  className="delete-icon-button"
                  onClick={() => handleDeleteReview(r.id)}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              )}
              <p className="review-author">
                {r.username === "Anonymous" ? "Anonym" : r.username}
              </p>
              <p className="review-text">{r.review}</p>

              <div className="review-rating">{renderStars(r.rating)}</div>
              <div className="review-date">
                {new Date(r.created_at).toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewList;
