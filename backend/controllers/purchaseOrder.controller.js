
import { purchaseOrderService } from "../services/purchaseOrder.service.js";

export const purchaseOrderController = {
  async list(req, res, next) {
    try {
      const result = await purchaseOrderService.list(
        req.query,
        Number(req.query.page) || 1,
        Number(req.query.pageSize) || 50
      );

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const result = await purchaseOrderService.getById(
        req.params.id
      );

      if (!result) {
        return res.status(404).json({
          message: "Purchase order not found"
        });
      }

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const result = await purchaseOrderService.createDirect(
        req.body,
        req.user?.id ?? null
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const result = await purchaseOrderService.update(
        req.params.id,
        req.body,
        req.user?.id ?? null
      );

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      const result = await purchaseOrderService.delete(
        req.params.id,
        req.user?.id ?? null
      );

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
};
