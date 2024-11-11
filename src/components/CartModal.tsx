import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/useAuth";
import "../styles/CartModal.css";

interface CartItem {
  id: number;
  name: string;
  price: number;
  stock: number;
  addedAt: number;
  quantity: number;
}

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Definiera fetchCartItems med useCallback så att den inte förändras vid varje render
  const fetchCartItems = useCallback(() => {
    if (user) {
      const cartKey = `cart_${user.username}`;
      const existingCart: CartItem[] = JSON.parse(
        localStorage.getItem(cartKey) || "[]"
      );

      const parsedCart = existingCart.map((item) => ({
        ...item,
        price:
          typeof item.price === "string" ? parseFloat(item.price) : item.price,
      }));

      setCartItems(parsedCart);
    }
  }, [user]);

  useEffect(() => {
    if (isOpen) {
      fetchCartItems();
    }
  }, [isOpen, fetchCartItems]);

  const calculateTotalPrice = (): string => {
    const total = cartItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    return total.toFixed(2); // Formatera till två decimaler, t.ex. 123.45
  };

  const clearCart = async () => {
    if (user) {
      const cartKey = `cart_${user.username}`;
      const existingCart: CartItem[] = JSON.parse(
        localStorage.getItem(cartKey) || "[]"
      );

      // Återställ lagret för alla varor i varukorgen
      for (const item of existingCart) {
        try {
          const response = await fetch("http://localhost:1337/restore-stock", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              productId: item.id,
              quantity: item.quantity,
            }),
          });

          if (!response.ok) {
            console.error("Failed to restore stock for item:", item.name);
          }
        } catch (error) {
          console.error("Error restoring stock:", error);
        }
      }

      // Rensa varukorgen från localStorage
      localStorage.removeItem(cartKey);
      setCartItems([]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="cart-modal-backdrop" onClick={onClose}>
      <div className="cart-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="cart-modal-close-button" onClick={onClose}>
          &times;
        </button>
        <h2>Din Varukorg</h2>
        {cartItems.length === 0 ? (
          <p>Din varukorg är tom.</p>
        ) : (
          <div>
            <ul className="cart-item-list">
              {cartItems.map((item) => (
                <li key={`${item.id}-${item.addedAt}`} className="cart-item">
                  {item.quantity} st - {item.name} - {item.price.toFixed(2)} kr
                  {item.quantity > 1 && (
                    <span>
                      {" "}
                      (Totalt: {(item.price * item.quantity).toFixed(2)} kr)
                    </span>
                  )}
                </li>
              ))}
            </ul>
            <p className="total-price">Total: {calculateTotalPrice()} kr</p>
            <button className="clear-cart-button" onClick={clearCart}>
              Töm varukorgen
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartModal;
