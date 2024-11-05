import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import LoginPage from "./pages/LoginPage";
import UserPage from "./pages/UserPage";
import AdminPage from "./pages/AdminPage";
import StorePage from "./pages/StorePage";
import ReviewPage from "./pages/ReviewPage";
import AddProductPage from "./pages/AddProductPage";
import PrivateRoute from "./components/PrivateRoute";

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<StorePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/userpage"
              element={
                <PrivateRoute element={<UserPage />} requiredAccessLevel={1} />
              }
            />
            <Route
              path="/adminpage"
              element={
                <PrivateRoute element={<AdminPage />} requiredAccessLevel={2} />
              }
            />
            <Route
              path="/review"
              element={
                <PrivateRoute
                  element={<ReviewPage />}
                  requiredAccessLevel={1}
                />
              }
            />
            <Route
              path="/add-product"
              element={
                <PrivateRoute
                  element={<AddProductPage />}
                  requiredAccessLevel={2}
                />
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
