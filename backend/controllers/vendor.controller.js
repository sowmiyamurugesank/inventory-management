import { validate as isValidUUID } from "uuid";

import { vendorService } from "../services/vendor.service.js";

const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};

function sendDatabaseResult(res, result, successStatus = 200) {
  if (result?.success) {
    return res.status(successStatus).json(result);
  }

  const error = result?.error || "Operation failed";

  let statusCode = HTTP_STATUS.BAD_REQUEST;

  if (
    error === "Vendor not found" ||
    error === "Vendor not found or already deleted"
  ) {
    statusCode = HTTP_STATUS.NOT_FOUND;
  } else if (
    error === "Vendor code already exists" ||
    error.includes("Version conflict")
  ) {
    statusCode = HTTP_STATUS.CONFLICT;
  }

  return res.status(statusCode).json(result);
}

function validateId(req, res) {
  const { id } = req.params;

  if (!isValidUUID(id)) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: "Invalid supplier ID",
    });

    return false;
  }

  return true;
}

function getAuthenticatedUserId(req) {
  // Assumes your authentication middleware sets req.user.id.
  // Do not read the user ID from req.body.
  return req.user?.id ?? null;
}

export const vendorController = {
  // ==========================================
  // GET ALL SUPPLIERS
  // ==========================================
  async getAll(req, res, next) {
    try {
      const { page = "1", pageSize = "10", ...queryFilters } = req.query;

      const parsedPage = Number(page);
      const parsedPageSize = Number(pageSize);

      if (
        !Number.isInteger(parsedPage) ||
        parsedPage < 1 ||
        !Number.isInteger(parsedPageSize) ||
        parsedPageSize < 1 ||
        parsedPageSize > 500
      ) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: "Invalid pagination parameters",
        });
      }

      // Allow only filters supported by list_vendors().
      const allowedFilters = [
        "code",
        "code_int",
        "name",
        "vendor_type",
        "contact_person",
        "email",
        "phone",
        "city",
        "state",
        "country_code",
        "gstin",
        "pan",
        "status",
        "is_active",
        "is_verified",
        "sort_order",
      ];

      const filters = {};

      for (const key of allowedFilters) {
        if (queryFilters[key] !== undefined) {
          filters[key] = queryFilters[key];
        }
      }

      // Support the global search box.
      // list_vendors() does not currently have a
      // dedicated "search" filter, so map it to
      // the supplier name filter.
      if (
        typeof queryFilters.search === "string" &&
        queryFilters.search.trim()
      ) {
        filters.name = queryFilters.search.trim();
      }

      for (const key of ["is_active", "is_verified"]) {
        if (filters[key] !== undefined) {
          if (!["true", "false"].includes(filters[key])) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
              success: false,
              error: `${key} must be true or false`,
            });
          }
        }
      }

      if (
        filters.sort_order !== undefined &&
        !["asc", "desc"].includes(String(filters.sort_order).toLowerCase())
      ) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: "sort_order must be asc or desc",
        });
      }

      if (filters.code_int !== undefined) {
        const codeInt = Number(filters.code_int);

        if (!Number.isInteger(codeInt)) {
          return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            error: "code_int must be an integer",
          });
        }

        filters.code_int = String(codeInt);
      }

      const result = await vendorService.getAll(
        filters,
        parsedPage,
        parsedPageSize,
      );

      return sendDatabaseResult(res, result);
    } catch (error) {
      next(error);
    }
  },

  // ==========================================
  // GET SUPPLIER BY ID
  // ==========================================
  async getById(req, res, next) {
    try {
      if (!validateId(req, res)) {
        return;
      }

      const result = await vendorService.getById(req.params.id);

      return sendDatabaseResult(res, result);
    } catch (error) {
      next(error);
    }
  },

  // ==========================================
  // CREATE SUPPLIER
  // ==========================================
  async create(req, res, next) {
    try {
      if (
        !req.body ||
        typeof req.body !== "object" ||
        Array.isArray(req.body)
      ) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: "Request body must be a JSON object",
        });
      }

      const result = await vendorService.create(
        req.body,
        getAuthenticatedUserId(req),
      );

      return sendDatabaseResult(res, result, HTTP_STATUS.CREATED);
    } catch (error) {
      next(error);
    }
  },

  // ==========================================
  // UPDATE SUPPLIER
  // ==========================================
  async update(req, res, next) {
    try {
      if (!validateId(req, res)) {
        return;
      }

      if (
        !req.body ||
        typeof req.body !== "object" ||
        Array.isArray(req.body)
      ) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: "Request body must be a JSON object",
        });
      }

      const result = await vendorService.update(
        req.params.id,
        req.body,
        getAuthenticatedUserId(req),
      );

      return sendDatabaseResult(res, result);
    } catch (error) {
      next(error);
    }
  },

  // ==========================================
  // DELETE SUPPLIER
  // ==========================================
  async delete(req, res, next) {
    try {
      if (!validateId(req, res)) {
        return;
      }

      const result = await vendorService.delete(
        req.params.id,
        getAuthenticatedUserId(req),
      );

      return sendDatabaseResult(res, result);
    } catch (error) {
      next(error);
    }
  },
};
