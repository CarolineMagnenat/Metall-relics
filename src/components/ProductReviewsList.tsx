import React, { useEffect, useState } from "react";
import "../styles/ProductReviewsList.css";

interface Review {
  id: number;
  username: string;
  review: string;
  rating: number;
  created_at: string;
}

interface ProductReviewsListProps {
  productId: number;
}

const ProductReviewsList: React.FC<ProductReviewsListProps> = ({
  productId,
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(
          `http://localhost:1337/products/${productId}/reviews`,
          {
            method: "GET",
          }
        );

        if (response.ok) {
          const data = await response.json();
          setReviews(data);
        } else {
          console.error("Fel vid hämtning av recensioner");
        }
      } catch (error) {
        console.error("Serverfel vid hämtning av recensioner:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [productId]);

  if (loading) {
    return <p>Hämtar recensioner...</p>;
  }

  if (reviews.length === 0) {
    return <p>Inga recensioner ännu</p>;
  }

  return (
    <div className="product-reviews-list">
      <h2 className="product-reviews-title">Recensioner:</h2>
      {loading ? (
        <p className="loading-message">Hämtar recensioner...</p>
      ) : reviews.length === 0 ? (
        <p className="no-reviews-message">Inga recensioner ännu.</p>
      ) : (
        <div className="product-reviews-container">
          {reviews.map((review) => (
            <div key={review.id} className="product-review-item">
              <h4 className="product-review-username">{review.username}</h4>
              <div className="product-review-rating">
                {"★".repeat(review.rating)} {"☆".repeat(5 - review.rating)}
              </div>
              <p className="product-review-text">{review.review}</p>
              <p className="product-review-date">
                {new Date(review.created_at).toLocaleDateString("sv-SE")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductReviewsList;
