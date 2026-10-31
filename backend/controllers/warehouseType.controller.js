import { warehouseTypeService } from "../services/warehouseType.service.js";

export const warehouseTypeController = {
  async list(req, res, next) {
    try {
      const filters = {};
      if (req.query.name) {
        filters.name = req.query.name;
      }

      if (req.query.code) {
        filters.code = req.query.code;
      }

      if (req.query.facility_category) {
        filters.facility_category = req.query.facility_category;
      }

      if (req.query.is_active !== undefined) {
        filters.is_active = req.query.is_active;
      }

      const page = Number.parseInt(req.query.page ?? "1", 10);
      const pageSize = Number.parseInt(req.query.pageSize ?? "50", 10);

      if (
        !Number.isInteger(page) ||
        page < 1 ||
        !Number.isInteger(pageSize) ||
        pageSize < 1
      ) {
        return res.status(400).json({
          success: false,
          data: null,
          error: "Page and pageSize must be positive integers.",
        });
      }

      const result = await warehouseTypeService.list(
        filters,
        page,
        Math.min(pageSize, 500),
      );

      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const result = await warehouseTypeService.create(req.body);

      return res.status(result.success ? 201 : 400).json(result);
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
          error: "Warehouse type ID is required.",
        });
      }

      const result = await warehouseTypeService.update(id, req.body);

      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      next(error);
    }
  },

  async remove(req, res, next) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          data: null,
          error: "Warehouse type ID is required.",
        });
      }

      const deletedBy = req.user?.id ?? null;

      const result = await warehouseTypeService.remove(id, deletedBy);

      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      next(error);
    }
  },
};
