import React from "react";

interface CartEmptiedPopupProps {
  visible: boolean;
}

const CartEmptiedPopup: React.FC<CartEmptiedPopupProps> = ({ visible }) => {
  if (!visible) return null;

  return (
    <div className="cart-emptied-popup">
      <p>Varukorgen har tömts eftersom reservationstiden har gått ut.</p>
    </div>
  );
};

export default CartEmptiedPopup;
