import React, { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "../context/useAuth";
import { updateProductStock, fetchProductStock } from "../api/productApi";
import ProductInfo from "./ProductInfo";
import ProductReviewsSection from "./ProductReviewsSection";
import CartEmptiedPopup from "./CartEmptiedPopup";
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
  const [showCartEmptiedMessage, setShowCartEmptiedMessage] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  const clearCart = useCallback(() => {
    if (user) {
      console.log("Tömmer varukorgen...");
      const cartKey = `cart_${user.username}`;
      const existingCart: CartItem[] = JSON.parse(
        localStorage.getItem(cartKey) || "[]"
      );

      existingCart.forEach(async (item) => {
        try {
          await fetch("http://localhost:1337/restore-stock", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              productId: item.id,
              quantity: item.quantity,
            }),
          });
        } catch (error) {
          console.error("Error restoring stock:", error);
        }
      });

      localStorage.removeItem(cartKey);
      console.log("Varukorgen har tömts automatiskt efter timeout.");

      setShowCartEmptiedMessage(true);
      console.log("Visar popup om att varukorgen tömdes.");
      setTimeout(() => {
        setShowCartEmptiedMessage(false);
      }, 10000); // Popup-meddelandet visas i 10 sekunder
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      const cartKey = `cart_${user.username}`;
      const existingCart: CartItem[] = JSON.parse(
        localStorage.getItem(cartKey) || "[]"
      );

      if (existingCart.length > 0) {
        console.log(
          "Skapar timeout för att tömma varukorgen om 20 sekunder..."
        );
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          console.log("Timeout har gått ut, varukorgen töms...");
          clearCart();
        }, 20000);
      }
    }
  }, [user, clearCart]);

  const handleToggleReviewForm = () => {
    setShowReviewForm((prev) => !prev);
    setTimeout(() => {
      if (reviewFormRef.current) {
        reviewFormRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  const handleAddToCart = async () => {
    if (isUpdating) return;
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

      setProduct((prevProduct) => ({
        ...prevProduct,
        stock: prevProduct.stock - 1,
      }));

      if (existingItem) {
        existingItem.quantity += 1;
        existingItem.addedAt = new Date().getTime();
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

        localStorage.setItem(cartKey, JSON.stringify(existingCart));
        console.log(`${product.name} har lagts till i varukorgen.`);

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          console.log("Timeout har gått ut, varukorgen töms...");
          clearCart();
        }, 20000);
      } catch (error) {
        console.error("Error updating stock:", error);
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
        <ProductInfo
          product={product}
          isUpdating={isUpdating}
          onAddToCart={handleAddToCart}
        />
      </div>
      <ProductReviewsSection
        productId={product.id}
        showReviewForm={showReviewForm}
        isLoggedIn={isLoggedIn}
        onToggleReviewForm={handleToggleReviewForm}
        reviewFormRef={reviewFormRef}
      />
      <CartEmptiedPopup visible={showCartEmptiedMessage} />
    </div>
  );
};

export default ProductDetails;
