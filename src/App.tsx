import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import UserPage from "./pages/UserPage";
import AdminPage from "./pages/AdminPage";
import StorePage from "./pages/StorePage";

const App: React.FC = () => {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/userpage" element={<UserPage />} />
          <Route path="/adminpage" element={<AdminPage />} />
          <Route path="/store" element={<StorePage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
