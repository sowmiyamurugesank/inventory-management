import { itemCategoryService } from "../services/itemCategory.service.js";

export const itemCategoryController = {
  async list(req, res, next) {
    try {
      const filters = {
        search: req.query.search ?? "",
      };

      const result = await itemCategoryService.list(
        filters,
        Number(req.query.page) || 1,
        Number(req.query.pageSize) || 50,
      );

      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const result = await itemCategoryService.getById(req.params.id);

      return res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const result = await itemCategoryService.create(req.body);

      return res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const result = await itemCategoryService.update(req.params.id, req.body);

      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      next(error);
    }
  },

  async remove(req, res, next) {
    try {
      const deletedBy = req.user?.id ?? null;

      const result = await itemCategoryService.delete(req.params.id, deletedBy);

      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      next(error);
    }
  },
};
