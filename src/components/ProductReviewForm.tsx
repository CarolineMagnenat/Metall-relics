import React, { useState } from "react";
import { Rating } from "react-simple-star-rating";
import { useAuth } from "../context/useAuth";
import "../styles/ProductReviewForm.css";

interface ProductReviewFormProps {
  productId: number;
}

const ProductReviewForm: React.FC<ProductReviewFormProps> = ({ productId }) => {
  const { isLoggedIn, user } = useAuth();
  const [reviewText, setReviewText] = useState<string>("");
  const [rating, setRating] = useState<number>(0);
  const [message, setMessage] = useState<string>("");

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoggedIn) {
      setMessage("Du måste vara inloggad för att skriva en recension.");
      return;
    }

    try {
      const response = await fetch("http://localhost:1337/add-product-review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          productId,
          username: user?.username,
          review: reviewText,
          rating: rating,
        }),
      });

      if (response.ok) {
        setMessage("Recensionen skickades in! Tack för din feedback.");
        setReviewText("");
        setRating(0);
      } else {
        const data = await response.json();
        setMessage(data.message || "Något gick fel, försök igen.");
      }
    } catch (error) {
      console.error("Fel vid inlämning av recension:", error);
      setMessage("Serverfel, försök igen senare.");
    }
  };

  const handleRatingChange = (rate: number) => {
    setRating(rate);
  };

  return (
    <div className="product-review-form">
      <h3 className="form-title">Skriv en recension</h3>
      <form onSubmit={handleReviewSubmit}>
        <div className="form-group">
          <label className="rating-label">Välj betyg:</label>
          <Rating
            onClick={handleRatingChange}
            initialValue={rating}
            emptyColor="#c0c0c0"
            fillColor="#ffd700"
            size={30}
          />
        </div>
        <div className="form-group">
          <label htmlFor="review" className="review-label">
            Din recension:
          </label>
          <textarea
            id="review"
            className="review-textarea"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            required
            rows={4}
            placeholder="Skriv din recension här..."
          />
        </div>
        <button className="submit-button" type="submit">
          Skicka recension
        </button>
      </form>
      {message && <p className="review-message">{message}</p>}
    </div>
  );
};

export default ProductReviewForm;
