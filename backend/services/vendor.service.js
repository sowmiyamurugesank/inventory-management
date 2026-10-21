import { crud } from "../utils/vendor.js";

export const vendorService = {
  // Get all suppliers with filters and pagination
  async getAll(filters = {}, page = 1, pageSize = 10) {
    return crud("VENDOR_LIST", {
      filters,
      page,
      pageSize,
    });
  },

  // Get one supplier by ID
  async getById(id) {
    return crud("VENDOR_GET", {
      id,
    });
  },

  // Create a supplier
  async create(data, userId = null) {
    return crud("VENDOR_CREATE", {
      data,
      userId,
    });
  },

  // Update a supplier
  async update(id, data, userId = null) {
    return crud("VENDOR_UPDATE", {
      id,
      data,
      userId,
    });
  },

  // Delete a supplier
  async delete(id, userId = null) {
    return crud("VENDOR_DELETE", {
      id,
      userId,
    });
  },
};
