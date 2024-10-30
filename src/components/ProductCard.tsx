import React from "react";
import "../styles/ProductCard.css";

interface Product {
  id: number;
  name: string;
  price: number | string;
  imageUrl: string;
}

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  return (
    <div className="product-item" onClick={onClick}>
      <img
        src={product.imageUrl}
        alt={product.name}
        className="product-image"
      />
      <h3 className="product-name">{product.name}</h3>
      <p className="product-price">
        {typeof product.price === "number"
          ? product.price.toFixed(2)
          : Number(product.price).toFixed(2)}{" "}
        kr
      </p>
    </div>
  );
};

export default ProductCard;
