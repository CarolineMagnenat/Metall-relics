import React from "react";
import "../styles/ConfirmationModal.css";

interface ConfirmationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onClose: () => void;
  message: string; // För att anpassa meddelandet som visas i modalen
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onConfirm,
  onClose,
  message,
}) => {
  if (!isOpen) return null;

  return (
    <div className="confirmation-modal-backdrop" onClick={onClose}>
      <div
        className="confirmation-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <p>{message}</p>
        <div className="confirmation-modal-actions">
          <button className="confirm-button" onClick={onConfirm}>
            Ja
          </button>
          <button className="cancel-button" onClick={onClose}>
            Avbryt
          </button>
        </div>
      </div>
    </div>
  );
};

//export default ConfirmationModal;
