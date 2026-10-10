
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5050/api";

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.message || "Request failed. Please try again.");
  }

  return result;
}

export const getGarments = () => request("/garments");

export const createGarment = (garment) =>
  request("/garments", {
    method: "POST",
    body: JSON.stringify(garment),
  });

export const updateGarment = (id, garment) =>
  request(`/garments/${id}`, {
    method: "PUT",
    body: JSON.stringify(garment),
  });

export const deleteGarment = (id) =>
  request(`/garments/${id}`, {
    method: "DELETE",
  });

export const recommendOutfits = (context) =>
  request("/outfits/recommend", {
    method: "POST",
    body: JSON.stringify(context),
  });
