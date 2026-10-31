import pool from "../config/db.js";

const WAREHOUSE_OPERATIONS = {
  LIST: {
    sql: `       SELECT public.list_warehouses(
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
    sql: `     SELECT public.update_warehouse(
      $1::uuid,
      $2::jsonb
    ) AS result
  `,
    params: (data) => [data.id, JSON.stringify(data.data)],
  },

  DELETE: {
    sql: `       SELECT public.delete_warehouse(
        $1::uuid,
        $2::uuid
      ) AS result
    `,
    params: (data) => [data.id, data.deletedBy ?? null],
  },
};

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

function validateWarehouseData(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Warehouse form data must be an object.");
  }

  const requiredFields = [
    "code",
    "name",
    "warehouseTypeId",
    "totalCapacity",
    "capacityUnit",
  ];

  for (const field of requiredFields) {
    const value = data[field];

    if (value === undefined || value === null || String(value).trim() === "") {
      throw new Error(`Required warehouse field is missing: ${field}`);
    }
  }

  if (
    !Number.isFinite(Number(data.totalCapacity)) ||
    Number(data.totalCapacity) < 0
  ) {
    throw new Error("Total capacity must be a valid non-negative number.");
  }
}

async function createCompleteWarehouse(data) {
  validateWarehouseData(data);

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const warehouseLength = data.length ?? data.warehouseLength ?? null;

    const warehouseWidth = data.width ?? data.warehouseWidth ?? null;

    const warehouseHeight = data.height ?? data.warehouseHeight ?? null;

    const dimensionUnit =
      data.dimensionUnit === "Feet" || data.dimensionUnit === "FT" ? "FT" : "M";

    const warehouse = await executeFunction(client, "create_warehouse", {
      code: data.code,
      code_int: data.codeInt ?? null,
      name: data.name,
      description: data.description ?? null,

      warehouse_type_id: data.warehouseTypeId,

      email: data.email ?? null,
      phone: data.contactNumber ?? data.phone ?? null,

      total_capacity: Number(data.totalCapacity),
      capacity_unit: data.capacityUnit,

      occupied_capacity: 0,
      capacity_status: "EMPTY",

      operating_hours: {
        opening_time: data.openingTime ?? null,
        closing_time: data.closingTime ?? null,
        working_days: data.workingDays ?? [],
      },

      warehouse_length: warehouseLength,
      warehouse_width: warehouseWidth,
      warehouse_height: warehouseHeight,
      dimension_unit: dimensionUnit,

      status: "active",
      is_active: data.active ?? true,
      is_verified: false,

      custom_attributes: {
        manager_name: data.managerName ?? null,
        location_code: data.locationCode ?? null,
        address_line_1: data.addressLine1 ?? null,
        address_line_2: data.addressLine2 ?? null,
        city: data.city ?? null,
        state: data.state ?? null,
        country: data.country ?? null,
        postal_code: data.postalCode ?? null,
      },
    });

    const zones = [];

    for (const [index, zone] of (data.zones ?? []).entries()) {
      if (!zone.zoneTypeId) {
        throw new Error(`Zone type ID is required for zone ${index + 1}.`);
      }

      const createdZone = await executeFunction(
        client,
        "create_warehouse_zone",
        {
          warehouse_id: warehouse.id,
          warehouse_zone_type_id: zone.zoneTypeId,

          code: zone.zoneCode,
          code_int: zone.codeInt ?? null,
          name: zone.zoneName,

          floor_level: zone.floorLevel ?? 0,
          zone_sequence: index + 1,

          maximum_capacity: zone.maximumCapacity,
          capacity_unit: zone.capacityUnit,

          is_active: true,
          custom_attributes: {},
        },
      );

      zones.push(createdZone);
    }

    await client.query("COMMIT");

    return {
      success: true,
      data: {
        ...warehouse,
        zones,
      },
      error: null,
    };
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error("Warehouse transaction rollback failed:", rollbackError);
    }

    console.error("Warehouse creation failed:", error.message);

    throw error;
  } finally {
    client.release();
  }
}

export async function warehouse(operation, data = {}) {
  if (operation === "CREATE_COMPLETE") {
    if (!data.data || typeof data.data !== "object") {
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
