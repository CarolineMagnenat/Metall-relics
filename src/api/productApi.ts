export const updateProductStock = async (productId: number, quantity: number, token: string): Promise<void> => {
  try {
    const response = await fetch("http://localhost:1337/update-stock", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Skicka token i Authorization-headern
      },
      body: JSON.stringify({ productId, quantity }),
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }
  } catch (error) {
    console.error("Failed to update product stock:", error);
    throw error; // Kasta vidare felet så att frontend kan hantera det
  }
};

export const fetchProductStock = async (productId: number): Promise<{ stock: number }> => {
  try {
    const response = await fetch(`http://localhost:1337/product-stock/${productId}`);

    if (!response.ok) {
      throw new Error("Failed to fetch product stock");
    }

    const data = await response.json();
    return data; // Returnera lagersaldo
  } catch (error) {
    console.error("Failed to fetch product stock:", error);
    throw error; // Kasta vidare felet så att frontend kan hantera det
  }
};
