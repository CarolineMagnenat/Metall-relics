import React from "react";
import { Product } from "../types/ProductTypes";
import "../styles/ProductInfo.css";

interface ProductInfoProps {
  product: Product;
  isUpdating: boolean;
  onAddToCart: () => void;
}

const ProductInfo: React.FC<ProductInfoProps> = ({
  product,
  isUpdating,
  onAddToCart,
}) => {
  return (
    <div className="product-info-container">
      <div className="product-info-image-container">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="product-info-image"
        />
      </div>
      <div className="product-info-details">
        <h2 className="product-info-name">{product.name}</h2>
        <p className="product-info-price">{product.price} kr</p>
        <p className="product-info-description">
          <strong>Beskrivning:</strong> <br /> {product.description}
        </p>
        <p
          className="product-info-stock"
          style={{ color: product.stock === 0 ? "red" : "black" }}
        >
          Lagersaldo: {product.stock} st
        </p>
        <button
          className="product-info-add-to-cart-button"
          onClick={onAddToCart}
          disabled={product.stock === 0 || isUpdating}
        >
          {product.stock > 0 ? "Lägg till i varukorgen" : "Slut i lager"}
        </button>
      </div>
    </div>
  );
};

export default ProductInfo;
