export const PRODUCT_CATEGORIES = [
  { value: "banh-ngot", label: "Bánh ngọt" },
  { value: "keo-ngot", label: "Kẹo ngọt" },
];

export function getCategoryLabel(value) {
  const matched = PRODUCT_CATEGORIES.find((item) => item.value === value);
  return matched ? matched.label : value;
}
