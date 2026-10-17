const API_BASE_URL = "http://localhost:5000/api";

export async function getItems() {
  const response = await fetch(`${API_BASE_URL}/items`);

  const result = await response.json();

  if (!response.ok || result.success === false) {
    throw new Error(result.error || "Failed to fetch items");
  }

  return result.data;
}

export async function createItem(itemData) {
  const response = await fetch(`${API_BASE_URL}/items`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(itemData),
  });

  const result = await response.json();

  if (!response.ok || result.success === false) {
    throw new Error(result.error || "Failed to create item");
  }

  return result.data;
}

export async function updateItem(id, itemData) {
  const response = await fetch(`${API_BASE_URL}/items/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(itemData),
  });

  const result = await response.json();

  if (!response.ok || result.success === false) {
    throw new Error(result.error || "Failed to update item");
  }

  return result.data;
}

export async function deleteItem(id) {
  const response = await fetch(`${API_BASE_URL}/items/${id}`, {
    method: "DELETE",
  });

  const result = await response.json();

  if (!response.ok || result.success === false) {
    throw new Error(result.error || "Failed to delete item");
  }

  return result.data;
}
