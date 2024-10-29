import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import LoginPage from "./pages/LoginPage";
import UserPage from "./pages/UserPage";
import AdminPage from "./pages/AdminPage";
import StorePage from "./pages/StorePage";
import ReviewPage from "./pages/ReviewPage";
import AddProductPage from "./pages/AddProductPage";

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<StorePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/userpage" element={<UserPage />} />
            <Route path="/adminpage" element={<AdminPage />} />
            <Route path="/review" element={<ReviewPage />} />
            <Route path="/add-product" element={<AddProductPage />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
