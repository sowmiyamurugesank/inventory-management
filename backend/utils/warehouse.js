import pool from "../config/db.js";

const WAREHOUSE_OPERATIONS = {
  LIST: {
    sql: `
      SELECT public.list_warehouses(
        $1::jsonb,
        $2::integer,
        $3::integer
      ) AS result
    `,
    params: (data) => [
      JSON.stringify(data.filters ?? {}),
      data.page ?? 1,
      data.pageSize ?? 50,
    ],
  },

  UPDATE: {
    sql: `
      SELECT public.update_warehouse(
        $1::uuid,
        $2::jsonb
      ) AS result
    `,
    params: (data) => [data.id, JSON.stringify(data.data)],
  },

  DELETE: {
    sql: `
      SELECT public.delete_warehouse(
        $1::uuid,
        $2::uuid
      ) AS result
    `,
    params: (data) => [data.id, data.deletedBy ?? null],
  },
};

// --------------------------------------------------
// Execute an allowed PostgreSQL database function
// --------------------------------------------------

async function executeFunction(client, functionName, data) {
  const allowedFunctions = new Set([
    "create_warehouse",
    "create_warehouse_zone",
  ]);

  if (!allowedFunctions.has(functionName)) {
    throw new Error(`Unsupported warehouse database function: ${functionName}`);
  }

  const { rows } = await client.query(
    `SELECT public.${functionName}($1::jsonb) AS result`,
    [JSON.stringify(data)],
  );

  const result = rows[0]?.result;

  if (!result?.success || !result.data) {
    throw new Error(
      result?.error ?? `${functionName} failed without an error message.`,
    );
  }

  return result.data;
}

// --------------------------------------------------
// Normalize incoming warehouse data
// Supports both camelCase and snake_case.
// --------------------------------------------------

function normalizeWarehouseData(data) {
  const customAttributes =
    data.custom_attributes ?? data.customAttributes ?? {};

  const operatingHours = data.operating_hours ??
    data.operatingHours ?? {
      opening_time: data.openingTime ?? null,
      closing_time: data.closingTime ?? null,
      working_days: data.workingDays ?? [],
    };

  const warehouseTypeId = data.warehouse_type_id ?? data.warehouseTypeId;

  const totalCapacity = data.total_capacity ?? data.totalCapacity;

  const capacityUnit = data.capacity_unit ?? data.capacityUnit;

  const warehouseLength =
    data.warehouse_length ??
    data.warehouseLength ??
    data.length ??
    customAttributes.length ??
    null;

  const warehouseWidth =
    data.warehouse_width ??
    data.warehouseWidth ??
    data.width ??
    customAttributes.width ??
    null;

  const warehouseHeight =
    data.warehouse_height ??
    data.warehouseHeight ??
    data.height ??
    customAttributes.height ??
    null;

  const rawDimensionUnit =
    data.dimension_unit ??
    data.dimensionUnit ??
    customAttributes.dimension_unit ??
    "M";

  const dimensionUnit = ["Feet", "FT"].includes(rawDimensionUnit) ? "FT" : "M";

  const isActive =
    data.is_active ??
    data.active ??
    (data.status ? data.status !== "inactive" : true);

  return {
    code: data.code,
    code_int: data.code_int ?? data.codeInt ?? null,

    name: data.name,

    description: data.description ?? customAttributes.description ?? null,

    warehouse_type_id: warehouseTypeId,

    email: data.email ?? null,

    phone: data.phone ?? data.contactNumber ?? null,

    total_capacity: totalCapacity,

    capacity_unit: capacityUnit,

    occupied_capacity: data.occupied_capacity ?? 0,

    capacity_status: data.capacity_status ?? "EMPTY",

    operating_hours: operatingHours,

    warehouse_length: warehouseLength,
    warehouse_width: warehouseWidth,
    warehouse_height: warehouseHeight,

    dimension_unit: dimensionUnit,

    custom_attributes: {
      ...customAttributes,

      manager_name: customAttributes.manager_name ?? data.managerName ?? null,

      location_code:
        customAttributes.location_code ?? data.locationCode ?? null,

      address_line_1:
        customAttributes.address_line_1 ?? data.addressLine1 ?? null,

      address_line_2:
        customAttributes.address_line_2 ?? data.addressLine2 ?? null,

      city: customAttributes.city ?? data.city ?? null,

      state: customAttributes.state ?? data.state ?? null,

      country: customAttributes.country ?? data.country ?? null,

      postal_code: customAttributes.postal_code ?? data.postalCode ?? null,
    },

    status: data.status ?? (isActive ? "active" : "inactive"),

    is_active: isActive,

    is_verified: data.is_verified ?? false,

    created_by: data.created_by ?? data.createdBy ?? null,

    updated_by: data.updated_by ?? data.updatedBy ?? null,

    zones: data.zones ?? [],
  };
}

// --------------------------------------------------
// Validate warehouse data
// --------------------------------------------------

function validateWarehouseData(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Warehouse form data must be an object.");
  }

  const requiredFields = [
    "code",
    "name",
    "warehouse_type_id",
    "total_capacity",
    "capacity_unit",
  ];

  for (const field of requiredFields) {
    const value = data[field];

    if (value === undefined || value === null || String(value).trim() === "") {
      throw new Error(`Required warehouse field is missing: ${field}`);
    }
  }

  if (
    !Number.isFinite(Number(data.total_capacity)) ||
    Number(data.total_capacity) < 0
  ) {
    throw new Error("Total capacity must be a valid non-negative number.");
  }

  if (
    typeof data.operating_hours !== "object" ||
    data.operating_hours === null ||
    Array.isArray(data.operating_hours)
  ) {
    throw new Error("Operating hours must be a valid object.");
  }

  if (
    typeof data.custom_attributes !== "object" ||
    data.custom_attributes === null ||
    Array.isArray(data.custom_attributes)
  ) {
    throw new Error("Custom attributes must be a valid object.");
  }
}

// --------------------------------------------------
// Create warehouse and optional zones in one transaction
// --------------------------------------------------

async function createCompleteWarehouse(data) {
  const warehouseData = normalizeWarehouseData(data);

  validateWarehouseData(warehouseData);

  const client = await pool.connect();

  let transactionStarted = false;

  try {
    await client.query("BEGIN");
    transactionStarted = true;

    // 1. Create the warehouse.

    const warehouse = await executeFunction(client, "create_warehouse", {
      code: warehouseData.code,

      code_int: warehouseData.code_int,

      name: warehouseData.name,

      description: warehouseData.description,

      warehouse_type_id: warehouseData.warehouse_type_id,

      email: warehouseData.email,

      phone: warehouseData.phone,

      total_capacity: Number(warehouseData.total_capacity),

      capacity_unit: warehouseData.capacity_unit,

      occupied_capacity: warehouseData.occupied_capacity,

      capacity_status: warehouseData.capacity_status,

      operating_hours: warehouseData.operating_hours,

      warehouse_length: warehouseData.warehouse_length,

      warehouse_width: warehouseData.warehouse_width,

      warehouse_height: warehouseData.warehouse_height,

      dimension_unit: warehouseData.dimension_unit,

      custom_attributes: warehouseData.custom_attributes,

      status: warehouseData.status,

      is_active: warehouseData.is_active,

      is_verified: warehouseData.is_verified,

      created_by: warehouseData.created_by,

      updated_by: warehouseData.updated_by,
    });

    // 2. Create optional zones associated with the warehouse.

    const zones = [];

    for (const [index, zone] of warehouseData.zones.entries()) {
      if (!zone.zoneTypeId && !zone.warehouse_zone_type_id) {
        throw new Error(`Zone type ID is required for zone ${index + 1}.`);
      }

      const createdZone = await executeFunction(
        client,
        "create_warehouse_zone",
        {
          warehouse_id: warehouse.id,

          warehouse_zone_type_id:
            zone.warehouse_zone_type_id ?? zone.zoneTypeId,

          code: zone.zoneCode ?? zone.code,

          code_int: zone.codeInt ?? zone.code_int ?? null,

          name: zone.zoneName ?? zone.name,

          floor_level: zone.floorLevel ?? zone.floor_level ?? 0,

          zone_sequence: index + 1,

          maximum_capacity: zone.maximumCapacity ?? zone.maximum_capacity,

          capacity_unit: zone.capacityUnit ?? zone.capacity_unit,

          is_active: zone.is_active ?? true,

          custom_attributes: zone.custom_attributes ?? {},
        },
      );

      zones.push(createdZone);
    }

    // 3. Commit the transaction after all operations succeed.

    await client.query("COMMIT");
    transactionStarted = false;

    return {
      success: true,
      data: {
        ...warehouse,
        zones,
      },
      error: null,
    };
  } catch (error) {
    // 4. Roll back all changes if anything fails.

    if (transactionStarted) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("Warehouse transaction rollback failed:", rollbackError);
      }
    }

    console.error("Warehouse creation failed:", error.message);

    throw error;
  } finally {
    // 5. Always return the connection to the pool.

    client.release();
  }
}

// --------------------------------------------------
// Main warehouse utility
// --------------------------------------------------

export async function warehouse(operation, data = {}) {
  if (operation === "CREATE_COMPLETE") {
    if (
      !data.data ||
      typeof data.data !== "object" ||
      Array.isArray(data.data)
    ) {
      throw new Error("Warehouse form data is required.");
    }

    return createCompleteWarehouse(data.data);
  }

  const config = WAREHOUSE_OPERATIONS[operation];

  if (!config) {
    throw new Error(`Unsupported warehouse operation: ${operation}`);
  }

  const params = config.params(data);

  const { rows } = await pool.query(config.sql, params);

  return rows[0].result;
}
