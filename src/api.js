const API_BASE_URL = "http://localhost:5000/api";

async function request(path, options = {}, fallbackError) {
  const response = await fetch(`${API_BASE_URL}${path}`, options);
  const result = await response.json();

  if (!response.ok || result.success === false) {
    throw new Error(result.error || fallbackError);
  }

  return result.data;
}

// Items
export function getItems() {
  return request("/items", {}, "Failed to fetch items");
}

export function createItem(itemData) {
  return request(
    "/items",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(itemData),
    },
    "Failed to create item",
  );
}

export function updateItem(id, itemData) {
  return request(
    `/items/${id}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(itemData),
    },
    "Failed to update item",
  );
}

export function deleteItem(id) {
  return request(`/items/${id}`, { method: "DELETE" }, "Failed to delete item");
}

// Suppliers / Vendors
export async function getVendors() {
  const data = await request("/vendors", {}, "Failed to fetch suppliers");

  // Supports either `data: []` or the raw `list_vendors()` response.
  return Array.isArray(data) ? data : data?.data || [];
}

export function createVendor(vendorData) {
  return request(
    "/vendors",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(vendorData),
    },
    "Failed to create supplier",
  );
}

export function updateVendor(id, vendorData) {
  return request(
    `/vendors/${id}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(vendorData),
    },
    "Failed to update supplier",
  );
}

export function deleteVendor(id) {
  return request(
    `/vendors/${id}`,
    { method: "DELETE" },
    "Failed to delete supplier",
  );
}
