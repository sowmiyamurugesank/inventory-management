import { warehouseType } from "../utils/warehouseType.js";

export const warehouseTypeService = {
  async list(filters = {}, page = 1, pageSize = 50) {
    return warehouseType("LIST", {
      filters,
      page,
      pageSize,
    });
  },

  async create(data) {
    return warehouseType("CREATE", data);
  },

  async update(id, data) {
    return warehouseType("UPDATE", {
      id,
      payload: data,
    });
  },

  async remove(id, deletedBy = null) {
    return warehouseType("DELETE", {
      id,
      deletedBy,
    });
  },
};
