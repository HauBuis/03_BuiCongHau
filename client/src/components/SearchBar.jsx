import React, { useEffect, useState } from "react";

function SearchBar({
  initialKeyword = "",
  initialMinPrice = "",
  initialMaxPrice = "",
  onSearch,
}) {
  const [searchType, setSearchType] = useState("keyword");
  const [keyword, setKeyword] = useState(initialKeyword);
  const [minPrice, setMinPrice] = useState(initialMinPrice);
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setKeyword(initialKeyword);
  }, [initialKeyword]);

  useEffect(() => {
    setMinPrice(initialMinPrice);
    setMaxPrice(initialMaxPrice);
  }, [initialMinPrice, initialMaxPrice]);

  function handleSearch() {
    setMessage("");

    if (searchType === "keyword") {
      onSearch({
        type: "keyword",
        value: keyword.trim(),
      });
      return;
    }

    const normalizedMinPrice = minPrice.trim();
    const normalizedMaxPrice = maxPrice.trim();
    const parsedMinPrice =
      normalizedMinPrice !== "" ? Number(normalizedMinPrice) : null;
    const parsedMaxPrice =
      normalizedMaxPrice !== "" ? Number(normalizedMaxPrice) : null;

    if (
      (parsedMinPrice !== null && parsedMinPrice < 1000) ||
      (parsedMaxPrice !== null && parsedMaxPrice < 1000)
    ) {
      setMessage("Giá nhập vào phải từ 1.000 VND trở lên.");
      return;
    }

    if (
      normalizedMinPrice !== "" &&
      normalizedMaxPrice !== "" &&
      parsedMinPrice > parsedMaxPrice
    ) {
      setMessage("Giá từ không được lớn hơn giá đến.");
      return;
    }

    onSearch({
      type: "price",
      minPrice: normalizedMinPrice,
      maxPrice: normalizedMaxPrice,
    });
  }

  function handleReset() {
    setKeyword("");
    setMinPrice("");
    setMaxPrice("");
    setMessage("");
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
            onChange={(event) => {
              setSearchType(event.target.value);
              setMessage("");
            }}
          />
          Tìm theo từ khóa
        </label>
        <label>
          <input
            type="radio"
            value="price"
            checked={searchType === "price"}
            onChange={(event) => {
              setSearchType(event.target.value);
              setMessage("");
            }}
          />
          Tìm theo khoảng giá
        </label>
      </div>

      {searchType === "keyword" ? (
        <div className="search-input-group">
          <input
            type="text"
            placeholder="Nhập tên sản phẩm hoặc từ khóa"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            className="search-input"
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleSearch();
              }
            }}
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
            min="1000"
            step="1000"
          />
          <input
            type="number"
            placeholder="Giá đến"
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value)}
            className="search-input"
            min="1000"
            step="1000"
          />
        </div>
      )}

      {message ? (
        <p
          style={{
            color: "#c0392b",
            marginBottom: "12px",
            fontWeight: 600,
          }}
        >
          {message}
        </p>
      ) : null}

      <div className="search-buttons">
        <button onClick={handleSearch} className="search-btn" type="button">
          Tìm kiếm
        </button>
        <button onClick={handleReset} className="reset-btn" type="button">
          Reset
        </button>
      </div>
    </div>
  );
}

export default SearchBar;
