
import { incomingStockService } from "../services/incomingStock.service.js";

export const incomingStockController = {
  async list(req, res, next) {
    try {
      const page = Number(req.query.page) || 1;
      const pageSize = Number(req.query.pageSize) || 50;

      const { page: _, pageSize: __, ...filters } = req.query;

      const result = await incomingStockService.list(
        filters,
        page,
        pageSize
      );

      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      next(error);
    }
  },

};
