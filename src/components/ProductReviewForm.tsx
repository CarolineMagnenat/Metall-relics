import React, { useState } from "react";
import { Rating } from "react-simple-star-rating";
import { useAuth } from "../context/useAuth";

interface ProductReviewFormProps {
  productId: number;
}

const ProductReviewForm: React.FC<ProductReviewFormProps> = ({ productId }) => {
  const { isLoggedIn, user } = useAuth();
  const [reviewText, setReviewText] = useState<string>("");
  const [rating, setRating] = useState<number>(1);
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
          username: user?.username || "Anonym",
          review: reviewText,
          rating: rating,
        }),
      });

      if (response.ok) {
        setMessage("Recensionen skickades in! Tack för din feedback.");
        setReviewText("");
        setRating(1);
      } else {
        const data = await response.json();
        setMessage(data.message || "Något gick fel, försök igen.");
      }
    } catch (error) {
      console.error("Fel vid inlämning av recension:", error);
      setMessage("Serverfel, försök igen senare.");
    }
  };

  return (
    <div className="product-review-form">
      <h3>Skriv en recension</h3>
      <form onSubmit={handleReviewSubmit}>
        <div className="rating-section">
          <label className="rating-label">Välj betyg:</label>
          <Rating onClick={setRating} />
        </div>
        <div className="form-group">
          <label htmlFor="review">Din recension:</label>
          <textarea
            id="review"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            required
            rows={4}
          />
        </div>
        <button type="submit">Skicka recension</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default ProductReviewForm;
