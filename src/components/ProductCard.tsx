import React, { useState } from "react";
import { useAuth } from "../context/useAuth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import "../styles/ProductCard.css";
import ProductEditModal from "./ProductEditModal";
import { Product } from "../types/ProductTypes";

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const { isLoggedIn, user } = useAuth(); // Använd autentiseringskontext för att kontrollera behörighet
  const [isEditModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [currentProduct, setCurrentProduct] = useState<Product>(product);

  // Funktion för att hantera när produkten sparas efter redigering
  const handleEditProduct = (updatedProduct: Product) => {
    setCurrentProduct(updatedProduct);
    console.log("Updated product: ", updatedProduct);
  };

  return (
    <>
      <div className="product-item" onClick={onClick}>
        {isLoggedIn && user?.access_level === 2 && (
          <button
            className="edit-product-button"
            onClick={(e) => {
              e.stopPropagation(); // Förhindra att produktkortet klickas (för att öppna detaljsidan)
              setEditModalOpen(true); // Öppna redigeringsmodalen
            }}
          >
            <FontAwesomeIcon icon={faEdit} />
          </button>
        )}
        <img
          src={currentProduct.imageUrl}
          alt={currentProduct.name}
          className="product-image"
        />
        <h3 className="product-name">{currentProduct.name}</h3>
        <p className="product-price">
          {typeof currentProduct.price === "number"
            ? currentProduct.price.toFixed(2)
            : Number(currentProduct.price).toFixed(2)}{" "}
          kr
        </p>
      </div>

      {/* Produktredigeringsmodal */}
      <ProductEditModal
        product={currentProduct}
        isOpen={isEditModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={handleEditProduct}
      />
    </>
  );
};

export default ProductCard;
