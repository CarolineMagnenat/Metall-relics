import React from "react";
import "../styles/CartModal.css";

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="cart-modal-backdrop" onClick={onClose}>
      <div className="cart-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="cart-modal-close-button" onClick={onClose}>
          &times;
        </button>
        <h2>Din Varukorg</h2>
        <p>Här kommer dina varor att visas.</p>
      </div>
    </div>
  );
};

export default CartModal;
