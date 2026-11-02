import { itemCategory } from "../utils/itemCategory.js";

export const itemCategoryService = {
  async list(filters = {}, page = 1, pageSize = 50) {
    return itemCategory("LIST", {
      filters,
      page,
      pageSize,
    });
  },

  async getById(id) {
    return itemCategory("GET", { id });
  },

  async create(data) {
    return itemCategory("CREATE", { data });
  },

  async update(id, data) {
    return itemCategory("UPDATE", {
      id,
      data,
    });
  },

  async delete(id, deletedBy = null) {
    return itemCategory("DELETE", {
      id,
      deletedBy,
    });
  },
};
