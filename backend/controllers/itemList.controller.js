import { itemListService } from "../services/itemList.service.js";

const HTTP_STATUS = {
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};

function sendDatabaseResult(res, result) {
  if (result.success) {
    return res.status(200).json(result);
  }

  const error = result.error || "Operation failed";

  let statusCode = HTTP_STATUS.BAD_REQUEST;

  if (error === "Item not found" || error === "Item category not found") {
    statusCode = HTTP_STATUS.NOT_FOUND;
  } else if (
    error === "Item code already exists" ||
    error.includes("Version mismatch") ||
    error.includes("modified concurrently")
  ) {
    statusCode = HTTP_STATUS.CONFLICT;
  }

  return res.status(statusCode).json(result);
}

export const itemListController = {
  async list(req, res, next) {
    try {
      const { page = 1, pageSize = 50, ...filters } = req.query;

      const result = await itemListService.list(
        filters,
        Number(page),
        Number(pageSize),
      );

      return sendDatabaseResult(res, result);
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const result = await itemListService.getById(req.params.id);

      return sendDatabaseResult(res, result);
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      // Assumes authentication middleware populates req.user.
      const userId = req.user?.id ?? null;

      const result = await itemListService.create(req.body, userId);

      if (!result.success) {
        return sendDatabaseResult(res, result);
      }

      return res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const userId = req.user?.id ?? null;

      const result = await itemListService.update(
        req.params.id,
        req.body,
        userId,
      );

      return sendDatabaseResult(res, result);
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      const userId = req.user?.id ?? null;

      const result = await itemListService.delete(req.params.id, userId);

      return sendDatabaseResult(res, result);
    } catch (error) {
      next(error);
    }
  },
};
