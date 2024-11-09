import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import "../styles/AddProductPage.css";

const AddProductPage: React.FC = () => {
  const { isLoggedIn, user } = useAuth();
  const [name, setName] = useState<string>("");
  const [price, setPrice] = useState<number>(0);
  const [description, setDescription] = useState<string>("");
  const [stock, setStock] = useState<number>(0);
  const navigate = useNavigate();

  // Kontrollera om användaren är admin och omdirigera om inte
  useEffect(() => {
    if (!isLoggedIn || (user && user.access_level < 2)) {
      // Omdirigera användare som inte är inloggade eller inte har adminbehörighet
      alert("Du har inte behörighet att besöka denna sida, sorry not sorry.");
      navigate("/");
    }
  }, [isLoggedIn, user, navigate]);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    const productData = {
      name,
      price,
      description,
      stock,
      imageUrl: "/assets/tshirt.jpeg",
    };

    try {
      const response = await fetch("http://localhost:1337/add-product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        alert("Produkten har lagts till!");
        navigate("/adminpage");
      } else {
        const data = await response.json();
        alert(data.message || "Något gick fel");
      }
    } catch (error) {
      console.error("Fel vid tilläggning av produkt:", error);
      alert("Serverfel, försök igen senare.");
    }
  };

  return (
    <div className="add-product-page">
      <h1 className="page-title">Lägg till ny produkt</h1>
      <form className="add-product-form" onSubmit={handleAddProduct}>
        <div className="form-group">
          <label htmlFor="product-name">Produktnamn:</label>
          <input
            type="text"
            id="product-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="product-price">Pris:</label>
          <input
            type="number"
            id="product-price"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="product-description">Beskrivning:</label>
          <textarea
            id="product-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="product-stock">Lagersaldo:</label>
          <input
            type="number"
            id="product-stock"
            value={stock}
            onChange={(e) => setStock(Number(e.target.value))}
            required
          />
        </div>
        <button className="add-product-button" type="submit">
          Skapa produkt
        </button>
      </form>
    </div>
  );
};

export default AddProductPage;
