import React from "react";
import ProductCard from "./ProductCard";

function ProductList({ products }) {
  return (
    <section className="product-list">
      {products.map((product) => (
        <ProductCard key={product.id || product._id} product={product} />
      ))}
    </section>
  );
}

export default ProductList;