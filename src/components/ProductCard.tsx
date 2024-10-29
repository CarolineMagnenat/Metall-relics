import React, { useState } from "react";
import "../styles/ProductCard.css";
import { useAuth } from "../context/useAuth";

interface Product {
  id: number;
  name: string;
  price: number | string;
  description: string;
  stock: number;
  imageUrl: string;
}

interface ProductCardProps {
  product: Product;
  onReviewClick: () => void;
  onShowReviewsClick: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onReviewClick,
  onShowReviewsClick,
}) => {
  const { isLoggedIn } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleDetails = () => {
    setIsExpanded((prevState) => !prevState);
  };

  return (
    <div className="product-item">
      <img
        src={product.imageUrl}
        alt={product.name}
        className="product-image"
        onClick={toggleDetails}
      />
      <h3 className="product-name">{product.name}</h3>
      <p className="product-price">
        {typeof product.price === "number"
          ? product.price.toFixed(2)
          : Number(product.price).toFixed(2)}{" "}
        kr
      </p>
      {isExpanded && (
        <div className="product-details">
          <p className="product-description">{product.description}</p>
          <p className="product-stock">Lagersaldo: {product.stock} st</p>
          <button className="show-reviews-button" onClick={onShowReviewsClick}>
            Visa recensioner
          </button>
          {isLoggedIn && (
            <button className="review-button" onClick={onReviewClick}>
              Lämna en recension
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductCard;
