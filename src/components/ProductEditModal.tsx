import React, { useState } from "react";
import "../styles/ProductEditModal.css";
import { Product } from "../types/ProductTypes";
import { useAuth } from "../context/useAuth";
import { ConfirmationModal } from "./ConfirmationModal";

interface ProductEditModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedProduct: Product) => void;
}

const ProductEditModal: React.FC<ProductEditModalProps> = ({
  product,
  isOpen,
  onClose,
  onSave,
}) => {
  const { user, isLoggedIn, getToken } = useAuth();
  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description);
  const [price, setPrice] = useState(product.price);
  const [stock, setStock] = useState(product.stock);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    const updatedProduct: Product = {
      ...product,
      name,
      description,
      price,
      stock,
    };

    const token = getToken();
    if (!token) {
      console.error("Token saknas - kan inte uppdatera produkten");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:1337/products/${product.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedProduct),
        }
      );

      if (response.ok) {
        onSave(updatedProduct);
        onClose();
      } else {
        console.error("Misslyckades med att uppdatera produkten");
      }
    } catch (error) {
      console.error("Fel vid uppdatering av produkten:", error);
    }
  };

  const handleDelete = async () => {
    if (!isLoggedIn || !user) {
      console.error("Användaren är inte inloggad - blockad åtkomst");
      return;
    }

    const token = getToken();

    if (!token) {
      console.error("Ingen token tillgänglig, blockad åtkomst");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:1337/products/${product.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        onClose();
        window.location.reload();
      } else {
        console.error("Misslyckades med att ta bort produkten");
      }
    } catch (error) {
      console.error("Fel vid borttagning av produkten:", error);
    }
  };

  return (
    <>
      <div className="product-edit-modal-backdrop" onClick={onClose}>
        <div
          className="product-edit-modal-content"
          onClick={(e) => e.stopPropagation()}
        >
          <button className="product-edit-close-button" onClick={onClose}>
            &times;
          </button>
          <h2>Redigera Produkt</h2>
          <div className="product-edit-form-group">
            <label>Namn</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="product-edit-form-group">
            <label>Beskrivning</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="product-edit-form-group">
            <label>Pris (kr)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
            />
          </div>
          <div className="product-edit-form-group">
            <label>Lagersaldo</label>
            <input
              type="number"
              value={stock}
              onChange={(e) => setStock(Number(e.target.value))}
            />
          </div>

          <div className="product-edit-modal-actions">
            <button
              className="product-delete-button"
              onClick={() => setShowConfirmation(true)}
            >
              Ta bort produkt
            </button>
            <button className="product-edit-save-button" onClick={handleSave}>
              Spara
            </button>
            <button className="product-edit-cancel-button" onClick={onClose}>
              Avbryt
            </button>
          </div>
        </div>
      </div>
      {showConfirmation && (
        <ConfirmationModal
          isOpen={showConfirmation}
          onConfirm={handleDelete}
          onClose={() => setShowConfirmation(false)}
          message="Är du säker på att du vill ta bort produkten?"
        />
      )}
    </>
  );
};

export default ProductEditModal;
