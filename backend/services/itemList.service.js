import { crud } from "../utils/crud.js";

export const itemListService = {
  async list(filters, page, pageSize) {
    return crud("LIST", {
      filters,
      page,
      pageSize,
    });
  },

  async getById(id) {
    return crud("GET", {
      id,
    });
  },

  async create(data, userId) {
    return crud("CREATE", {
      data,
      userId,
    });
  },

  async update(id, data, userId) {
    return crud("UPDATE", {
      id,
      data,
      userId,
    });
  },

  async delete(id, userId) {
    return crud("DELETE", {
      id,
      userId,
    });
  },
};
