import { zone } from "../utils/zone.js";

export const zoneService = {
  async list(filters = {}, page = 1, pageSize = 50) {
    return zone("LIST", {
      filters,
      page,
      pageSize,
    });
  },

  async create(data) {
    return zone("CREATE", data);
  },

  async update(id, data) {
    return zone("UPDATE", {
      id,
      payload: data,
    });
  },

  async delete(id, deletedBy = null) {
    return zone("DELETE", {
      id,
      deletedBy,
    });
  },
};
