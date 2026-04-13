import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import "./App.css";

import Footer from "./components/Footer";
import Header from "./components/Header";
import ProductDetail from "./components/ProductDetail";
import Sidebar from "./components/Sidebar";
import Admin from "./pages/Admin";
import Home from "./pages/Home";
import Products from "./pages/Products";

function App() {
  const location = useLocation();

  function getCurrentPage() {
    const { pathname } = location;

    if (pathname === "/" || pathname === "/home") {
      return "home";
    }

    if (pathname.startsWith("/products")) {
      return "products";
    }

    if (pathname.startsWith("/admin")) {
      return "admin";
    }

    if (pathname.startsWith("/about")) {
      return "about";
    }

    return "home";
  }

  return (
    <div className="app-layout">
      <Header />
      <Sidebar currentPage={getCurrentPage()} />

      <div className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/products/category/:categoryId" element={<Products />} />
          <Route path="/products/search/keyword" element={<Products />} />
          <Route path="/about" element={<div>About Page</div>} />
          <Route path="/admin/:mode?" element={<Admin />} />
        </Routes>
      </div>

      <Footer />
    </div>
  );
}

export default App;
