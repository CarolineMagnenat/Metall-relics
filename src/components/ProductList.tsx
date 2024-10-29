import React, { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import ProductReviewsList from "./ProductReviewsList";
import ProductReviewForm from "./ProductReviewForm";
import Modal from "./Modal";
import "../styles/ProductList.css";

interface Product {
  id: number;
  name: string;
  price: number | string;
  description: string;
  stock: number;
  imageUrl: string;
}

type ModalContentType = "add-review" | "show-reviews";

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null
  );
  const [modalContentType, setModalContentType] =
    useState<ModalContentType | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:1337/products", {
          method: "GET",
        });

        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        } else {
          console.error("Fel vid hämtning av produkter");
        }
      } catch (error) {
        console.error("Serverfel vid hämtning av produkter:", error);
      }
    };

    fetchProducts();
  }, []);

  const handleOpenModal = (
    productId: number,
    contentType: ModalContentType
  ) => {
    // Uppdaterar tillståndet så att modal och rätt produkt-id visas
    setSelectedProductId(productId);
    setModalContentType(contentType);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    // Stänger modalen och återställer produkt-id
    setShowModal(false);
    setSelectedProductId(null);
    setModalContentType(null);
  };

  return (
    <div className="product-list">
      <h2 className="products-title">Produkter:</h2>
      <div className="products-container">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onReviewClick={() => handleOpenModal(product.id, "add-review")}
            onShowReviewsClick={() =>
              handleOpenModal(product.id, "show-reviews")
            }
          />
        ))}
      </div>

      {/* Rendera Modal om showModal är true och en produkt är vald */}
      {showModal && selectedProductId && (
        <Modal onClose={handleCloseModal}>
          {modalContentType === "add-review" && (
            <ProductReviewForm productId={selectedProductId} />
          )}
          {modalContentType === "show-reviews" && (
            <ProductReviewsList productId={selectedProductId} />
          )}
        </Modal>
      )}
    </div>
  );
};

export default ProductList;
