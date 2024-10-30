import React, { useRef, useState } from "react";
import { useAuth } from "../context/useAuth";
import ProductReviewsList from "./ProductReviewsList";
import ProductReviewForm from "./ProductReviewForm";
import "../styles/ProductDetails.css";

interface Product {
  id: number;
  name: string;
  price: number | string;
  description: string;
  stock: number;
  imageUrl: string;
}

interface ProductDetailsProps {
  product: Product;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ product }) => {
  const { isLoggedIn } = useAuth();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const reviewFormRef = useRef<HTMLDivElement>(null);

  const handleToggleReviewForm = () => {
    setShowReviewForm((prev) => !prev);
    setTimeout(() => {
      if (reviewFormRef.current) {
        // Skrolla till recensionformuläret inom popupen
        reviewFormRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  return (
    <div className="product-details-container">
      <div className="product-details-header">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="product-details-image"
        />
        <div className="product-details-info">
          <h2 className="product-details-name">{product.name}</h2>
          <p className="product-details-price">{product.price} kr</p>
          <p className="product-details-description">
            <strong>Beskrivning:</strong> <br /> {product.description}
          </p>
          <p className="product-details-stock">
            Lagersaldo: {product.stock} st
          </p>
        </div>
      </div>
      <div className="product-details-reviews-section">
        <ProductReviewsList productId={product.id} />

        {isLoggedIn && !showReviewForm && (
          <button
            className="product-details-review-button"
            onClick={handleToggleReviewForm}
          >
            Lämna en recension
          </button>
        )}

        {showReviewForm && (
          <div ref={reviewFormRef} id="reviewForm">
            <ProductReviewForm productId={product.id} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
