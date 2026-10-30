import { zoneType } from "../utils/zoneType.js";

export const zoneTypeService = {
  async list(filters = {}, page = 1, pageSize = 50) {
    return zoneType("LIST", {
      filters,
      page,
      pageSize,
    });
  },

  async create(data) {
    return zoneType("CREATE", data);
  },

  async update(id, data) {
    return zoneType("UPDATE", {
      id,
      payload: data,
    });
  },

  async delete(id) {
    return zoneType("DELETE", {
      id,
    });
  },
};
