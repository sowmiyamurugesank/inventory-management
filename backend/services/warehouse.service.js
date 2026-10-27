import { warehouse } from "../utils/warehouse.js";

export const warehouseService = {
  async list(filters = {}) {
    return warehouse("LIST", {
      filters,
    });
  },

  async create(data) {
    return warehouse("CREATE_COMPLETE", {
      data,
    });
  },

  async delete(id) {
    return warehouse("DELETE", {
      id,
    });
  },
};
