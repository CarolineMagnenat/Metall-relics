import React, { useState, useEffect } from "react";
import "../styles/CartModal.css";

interface CartItem {
  id: number;
  name: string;
  price: number;
  stock: number;
  addedAt: number; // Timestamp när produkten lades till i varukorgen
}

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Funktion för att hämta varor från localStorage
  const fetchCartItems = () => {
    const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCartItems(existingCart);
  };

  // Använd useEffect för att hämta data när modalen öppnas
  useEffect(() => {
    if (isOpen) {
      fetchCartItems();
    }
  }, [isOpen]);

  // Funktion för att rensa varukorgen från localStorage och tillståndet
  const clearCart = () => {
    localStorage.removeItem("cart");
    setCartItems([]);
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
                <li key={item.id} className="cart-item">
                  {item.name} - {item.price} kr
                </li>
              ))}
            </ul>
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
