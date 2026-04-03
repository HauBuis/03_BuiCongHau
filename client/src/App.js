import React, { useState } from "react";
import "./App.css";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Products from "./components/Products";
import ProductDetail from "./components/ProductDetail";
import Admin from "./pages/Admin";

function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [adminMode, setAdminMode] = useState("add");

  const handlePageChange = (page, option = null) => {
    setCurrentPage(page);
    if (page === "admin" && option) {
      setAdminMode(option);
    }
    if (page === "detail" && option) {
      setSelectedProductId(option);
    }
  };

  return (
    <div className="app-layout">
      <Header />
      <Sidebar currentPage={currentPage} onNavigate={handlePageChange} />

      <div className="main-content">
        {currentPage === "home" && (
          <Home onNavigate={handlePageChange} />
        )}
        {currentPage === "products" && (
          <Products onNavigate={handlePageChange} />
        )}
        {currentPage === "detail" && selectedProductId && (
          <ProductDetail
            productId={selectedProductId}
            onNavigate={handlePageChange}
          />
        )}
        {currentPage === "admin" && (
          <Admin onNavigate={handlePageChange} mode={adminMode} />
        )}
      </div>

      <Footer />
    </div>
  );
}

export default App;