import React, { useEffect, useState } from "react";
import "../styles/ProductList.css";

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  stock: number;
  imageUrl: string;
}

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);

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

  return (
    <div className="products-container">
      <h2 className="products-title">Produkter:</h2>
      <div className="products-list">
        {products.length === 0 ? (
          <p>Det finns inga produkter att visa.</p>
        ) : (
          products.map((product) => (
            <div key={product.id} className="product-item">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="product-image"
              />
              <h3 className="product-name">{product.name}</h3>
              <p className="product-price">{product.price} kr</p>
              <p className="product-description">{product.description}</p>
              <p className="product-stock">
                Lagersaldo: {product.stock > 0 ? product.stock : "Slut i lager"}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductList;
