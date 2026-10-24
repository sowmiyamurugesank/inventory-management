import { warehouse } from "../utils/warehouse.js";

export const warehouseService = {
  async create(data) {
    return warehouse("CREATE", {
      data,
    });
  },
};
