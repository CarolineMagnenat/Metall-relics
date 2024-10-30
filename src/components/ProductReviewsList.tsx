import React, { useEffect, useState } from "react";
import { useAuth } from "../context/useAuth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
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
  const { isLoggedIn, user } = useAuth();
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

  const handleDeleteReview = async (id: number) => {
    try {
      const response = await fetch(
        `http://localhost:1337/products/${productId}/reviews/${id}`,
        {
          method: "DELETE",
          credentials: "include", // Skicka med credentials (ex. cookies) för autentisering
        }
      );

      console.log("RESPONSE: ", response.ok);

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

  if (loading) {
    return <p>Hämtar recensioner...</p>;
  }

  if (reviews.length === 0) {
    return <p>Inga recensioner ännu</p>;
  }

  return (
    <div className="product-reviews-list">
      <h2 className="product-reviews-title">Recensioner:</h2>
      <div className="product-reviews-container">
        {reviews.map((review) => (
          <div key={review.id} className="product-review-item">
            {isLoggedIn && user?.access_level === 2 && (
              <button
                className="delete-pr-icon-button"
                onClick={() => handleDeleteReview(review.id)}
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            )}
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
    </div>
  );
};

export default ProductReviewsList;
