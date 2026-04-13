import React, { useState } from "react";

function SearchBar({ onSearch }) {
  const [searchType, setSearchType] = useState("keyword");
  const [keyword, setKeyword] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  function handleSearch() {
    if (searchType === "keyword") {
      onSearch({ type: "keyword", value: keyword });
      return;
    }

    onSearch({
      type: "price",
      minPrice: minPrice === "" ? 0 : Number(minPrice),
      maxPrice: maxPrice === "" ? Infinity : Number(maxPrice),
    });
  }

  function handleReset() {
    setKeyword("");
    setMinPrice("");
    setMaxPrice("");
    onSearch({ type: "reset" });
  }

  return (
    <div className="search-bar">
      <div className="search-type-selector">
        <label>
          <input
            type="radio"
            value="keyword"
            checked={searchType === "keyword"}
            onChange={(event) => setSearchType(event.target.value)}
          />
          Tìm theo tên sản phẩm
        </label>
        <label>
          <input
            type="radio"
            value="price"
            checked={searchType === "price"}
            onChange={(event) => setSearchType(event.target.value)}
          />
          Tìm theo giá
        </label>
      </div>

      {searchType === "keyword" ? (
        <div className="search-input-group">
          <input
            type="text"
            placeholder="Nhập tên sản phẩm hoặc tags"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            className="search-input"
          />
        </div>
      ) : (
        <div className="search-input-group">
          <input
            type="number"
            placeholder="Giá từ"
            value={minPrice}
            onChange={(event) => setMinPrice(event.target.value)}
            className="search-input"
            min="0"
          />
          <input
            type="number"
            placeholder="Giá đến"
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value)}
            className="search-input"
            min="0"
          />
        </div>
      )}

      <div className="search-buttons">
        <button onClick={handleSearch} className="search-btn">
          Tìm kiếm
        </button>
        <button onClick={handleReset} className="reset-btn">
          Reset
        </button>
      </div>
    </div>
  );
}

export default SearchBar;
