import { warehouseService } from "../services/warehouse.service.js";

export const warehouseController = {
  async list(req, res, next) {
    try {
      const filters = {
        search: req.query.search ?? "",
      };

      const result = await warehouseService.list(filters);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

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
  async update(req, res, next) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          data: null,
          error: "Warehouse ID is required.",
        });
      }

      if (
        !req.body ||
        typeof req.body !== "object" ||
        Array.isArray(req.body)
      ) {
        return res.status(400).json({
          success: false,
          data: null,
          error: "Request body must be a JSON object.",
        });
      }

      const result = await warehouseService.update(id, req.body);

      if (!result.success) {
        const statusCode =
          result.error === "Warehouse not found"
            ? 404
            : result.error === "Version conflict"
              ? 409
              : 400;

        return res.status(statusCode).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async remove(req, res, next) {
    try {
      const id = req.params.id;

      if (!id) {
        return res.status(400).json({
          success: false,
          data: null,
          error: "Warehouse ID is required.",
        });
      }

      const result = await warehouseService.delete(id);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};
