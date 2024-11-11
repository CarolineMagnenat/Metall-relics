import React from "react";
import ProductReviewsList from "./ProductReviewsList";
import ProductReviewForm from "./ProductReviewForm";

interface ProductReviewsSectionProps {
  productId: number;
  showReviewForm: boolean;
  isLoggedIn: boolean;
  onToggleReviewForm: () => void;
  reviewFormRef: React.RefObject<HTMLDivElement>;
}

const ProductReviewsSection: React.FC<ProductReviewsSectionProps> = ({
  productId,
  showReviewForm,
  isLoggedIn,
  onToggleReviewForm,
  reviewFormRef,
}) => {
  return (
    <div className="product-details-reviews-section">
      <ProductReviewsList productId={productId} />
      {isLoggedIn && !showReviewForm && (
        <button
          className="product-details-review-button"
          onClick={onToggleReviewForm}
        >
          Lämna en recension
        </button>
      )}
      {showReviewForm && (
        <div ref={reviewFormRef} id="reviewForm">
          <ProductReviewForm productId={productId} />
        </div>
      )}
    </div>
  );
};

export default ProductReviewsSection;
