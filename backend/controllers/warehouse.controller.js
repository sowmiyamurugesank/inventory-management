import { warehouseService } from "../services/warehouse.service.js";

export const warehouseController = {
  async create(req, res, next) {
    try {
      const result = await warehouseService.create(req.body);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },
};
