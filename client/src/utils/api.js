export const API_BASE_URL = "http://localhost:5000";
export const DEFAULT_PRODUCT_IMAGE = "/images/cake1.jpg";

export function getImageUrl(imagePath = DEFAULT_PRODUCT_IMAGE) {
  const normalizedPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  return `${API_BASE_URL}${normalizedPath}`;
}
