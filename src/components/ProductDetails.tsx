import { updateProductStock, fetchProductStock } from "../api/productApi";
import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/useAuth";
import ProductReviewsList from "./ProductReviewsList";
import ProductReviewForm from "./ProductReviewForm";
import { Product } from "../types/ProductTypes";
import "../styles/ProductDetails.css";

interface CartItem {
  id: number;
  name: string;
  price: number;
  stock: number;
  addedAt: number;
  quantity: number;
}

interface ProductDetailsProps {
  product: Product;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({
  product: initialProduct,
}) => {
  const { isLoggedIn, user, getToken } = useAuth();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const reviewFormRef = useRef<HTMLDivElement>(null);
  const [product, setProduct] = useState(initialProduct);
  const [isUpdating, setIsUpdating] = useState(false);

  // useEffect för att hämta uppdaterat lagersaldo
  useEffect(() => {
    const fetchUpdatedProduct = async () => {
      try {
        const { stock } = await fetchProductStock(product.id);
        setProduct((prevProduct) => ({
          ...prevProduct,
          stock,
        }));
      } catch (error) {
        console.error("Fel vid hämtning av uppdaterad lagerstatus:", error);
      }
    };

    fetchUpdatedProduct();
  }, [product.id]);

  const handleToggleReviewForm = () => {
    setShowReviewForm((prev) => !prev);
    setTimeout(() => {
      if (reviewFormRef.current) {
        reviewFormRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  const handleAddToCart = async () => {
    if (isUpdating) return; // Om vi redan uppdaterar, tillåt inte fler klick
    setIsUpdating(true);

    if (user) {
      const cartKey = `cart_${user.username}`;
      const existingCart: CartItem[] = JSON.parse(
        localStorage.getItem(cartKey) || "[]"
      );

      const existingItem = existingCart.find((item) => item.id === product.id);
      const token = getToken();

      if (!token) {
        console.error("Ingen token hittades, användaren är inte autentiserad.");
        setIsUpdating(false);
        return;
      }

      if (product.stock <= 0) {
        console.log("Produkten är slut i lager.");
        setIsUpdating(false);
        return;
      }

      // Optimistisk uppdatering
      setProduct((prevProduct) => ({
        ...prevProduct,
        stock: prevProduct.stock - 1,
      }));

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        const newCartItem: CartItem = {
          id: product.id,
          name: product.name,
          price: parseFloat(product.price.toString()),
          stock: product.stock,
          addedAt: new Date().getTime(),
          quantity: 1,
        };
        existingCart.push(newCartItem);
      }

      try {
        await updateProductStock(product.id, 1, token);

        // Uppdatera localStorage efter att backend-uppdateringen lyckats
        localStorage.setItem(cartKey, JSON.stringify(existingCart));
        console.log(`${product.name} har lagts till i varukorgen.`);
      } catch (error) {
        console.error("Error updating stock:", error);
        // Rollback om det blir ett serverfel
        setProduct((prevProduct) => ({
          ...prevProduct,
          stock: prevProduct.stock + 1,
        }));
        alert("Det gick inte att uppdatera lagret. Försök igen.");
      } finally {
        setIsUpdating(false);
      }
    }
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
          <p
            className="product-details-stock"
            style={{ color: product.stock === 0 ? "red" : "black" }}
          >
            Lagersaldo: {product.stock} st
          </p>
          <button
            className="add-to-cart-button"
            onClick={handleAddToCart}
            disabled={product.stock === 0 || isUpdating}
          >
            {product.stock > 0 ? "Lägg till i varukorgen" : "Slut i lager"}
          </button>
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
