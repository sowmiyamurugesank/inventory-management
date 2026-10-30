import { zoneService } from "../services/zone.service.js";

export const zoneController = {
  async list(req, res, next) {
    try {
      const result = await zoneService.list();

      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const result = await zoneService.create(req.body);

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
          error: "Zone ID is required.",
        });
      }

      const result = await zoneService.update(id, req.body);

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
          error: "Zone ID is required.",
        });
      }

      const deletedBy = req.user?.id ?? null;

      const result = await zoneService.remove(id, deletedBy);

      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      next(error);
    }
  },
};
