import React from "react";
import ProductCard from "./ProductCard";

function ProductList({ products, onUpdate, onDelete }) {
  return (
    <section className="product-list">
      {products.map((product) => (
        <ProductCard
          key={product.id || product._id}
          product={product}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </section>
  );
}

export default ProductList;