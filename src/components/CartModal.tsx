import React, { useState, useEffect } from "react";
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
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Funktion för att hämta varor från localStorage
  const fetchCartItems = () => {
    const existingCart: CartItem[] = JSON.parse(
      localStorage.getItem("cart") || "[]"
    );

    // Kontrollera och säkerställ att `price` är ett nummer
    const parsedCart = existingCart.map((item) => ({
      ...item,
      price:
        typeof item.price === "string" ? parseFloat(item.price) : item.price,
    }));

    setCartItems(parsedCart);
  };

  // Använd useEffect för att hämta data när modalen öppnas
  useEffect(() => {
    if (isOpen) {
      fetchCartItems();
    }
  }, [isOpen]);

  // Funktion för att räkna ut totalsumman
  const calculateTotalPrice = (): string => {
    const total = cartItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    return total.toFixed(2); // Formatera till två decimaler, t.ex. 123.45
  };

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
