import React, { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import ProductDetails from "./ProductDetails";
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

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

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

  const handleOpenModal = (product: Product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
  };

  return (
    <div className="product-list">
      <h2 className="products-title">Produkter:</h2>
      <div className="products-container">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onClick={() => handleOpenModal(product)}
          />
        ))}
      </div>

      {showModal && selectedProduct && (
        <Modal onClose={handleCloseModal}>
          <ProductDetails product={selectedProduct} />
        </Modal>
      )}
    </div>
  );
};

export default ProductList;
