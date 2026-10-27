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

async function executeFunction(client, functionName, data) {
  const allowedFunctions = new Set([
    "create_warehouse_type",
    "create_warehouse_zone_type",
    "create_warehouse",
    "create_warehouse_zone",
  ]);

  if (!allowedFunctions.has(functionName)) {
    throw new Error("Unsupported warehouse database function.");
  }

  const { rows } = await client.query(
    `SELECT public.${functionName}($1::jsonb) AS result`,
    [JSON.stringify(data)],
  );

  const result = rows[0]?.result;

  if (!result?.success || !result.data) {
    throw new Error(result?.error || `${functionName} failed.`);
  }

  return result.data;
}

const FACILITY_CATEGORY_MAP = {
  "General Warehouse": "DISTRIBUTION_CENTER",
  "Distribution Center": "DISTRIBUTION_CENTER",
  "Fulfillment Center": "FULFILLMENT_CENTER",
  "Regional Hub": "REGIONAL_HUB",
  "Retail Outlet": "RETAIL_OUTLET",
  "Bonded Warehouse": "BONDED_WAREHOUSE",
  "Cross Dock": "CROSS_DOCK",
  Other: "OTHER",
};

async function createCompleteWarehouse(data) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Create the warehouse type.
    const warehouseType = await executeFunction(
      client,
      "create_warehouse_type",
      {
        code: data.typeCode,
        code_int: data.typeNumericCode,
        name: data.typeName,
        description: data.typeDescription,

        facility_category:
          FACILITY_CATEGORY_MAP[data.facilityCategory] ?? data.facilityCategory,

        is_active: data.typeActive,

        custom_attributes: {
          available_for_selection: data.typeAvailable,
        },
      },
    );

    // 2. Create the warehouse zone type.
    const zoneType = await executeFunction(
      client,
      "create_warehouse_zone_type",
      {
        code: data.zoneTypeCode,
        code_int: data.zoneTypeNumericCode,
        name: data.zoneTypeName,
        description: data.zoneTypeDescription,
        zone_purpose: String(data.zonePurpose || "STORAGE").toUpperCase(),
        storage_type: String(data.storageType || "AMBIENT").toUpperCase(),
        temperature_controlled: Boolean(data.temperatureControl),
        temperature_min: data.temperatureControl
          ? data.minimumTemperature
          : null,
        temperature_max: data.temperatureControl
          ? data.maximumTemperature
          : null,
        temperature_unit: String(
          data.temperatureUnit || "CELSIUS",
        ).toUpperCase(),
        humidity_controlled: Boolean(data.humidityControl),
        humidity_min: data.humidityControl ? data.minimumHumidity : null,
        humidity_max: data.humidityControl ? data.maximumHumidity : null,
        requires_special_handling: Boolean(data.specialHandling),
        is_active: data.zoneTypeActive,
        custom_attributes: {
          available_for_selection: data.zoneTypeAvailable,
        },
      },
    );

    // 3. Create the warehouse using the generated type UUID.
    const warehouse = await executeFunction(client, "create_warehouse", {
      code: data.code,
      code_int: data.codeInt ?? null,
      name: data.name,
      description: data.description,
      warehouse_type_id: warehouseType.id,
      email: data.email,
      phone: data.contactNumber,
      total_capacity: data.totalCapacity,
      capacity_unit: data.capacityUnit,
      occupied_capacity: 0,
      capacity_status: "EMPTY",
      operating_hours: {
        opening_time: data.openingTime,
        closing_time: data.closingTime,
        working_days: data.workingDays,
      },
      warehouse_length: data.warehouseLength ?? null,
      warehouse_width: data.warehouseWidth ?? null,
      warehouse_height: data.warehouseHeight ?? null,
      dimension_unit: "M",
      status: "active",
      is_active: data.active,
      is_verified: false,
      custom_attributes: {
        manager_name: data.managerName,
        location_code: data.locationCode,
        address_line_1: data.addressLine1,
        address_line_2: data.addressLine2,
        city: data.city,
        state: data.state,
        country: data.country,
        postal_code: data.postalCode,
      },
    });

    // 4. Create each warehouse zone.
    const zones = [];

    for (const [index, zone] of (data.zones ?? []).entries()) {
      const createdZone = await executeFunction(
        client,
        "create_warehouse_zone",
        {
          warehouse_id: warehouse.id,
          warehouse_zone_type_id: zoneType.id,
          code: zone.zoneCode,
          code_int: zone.codeInt ?? null,
          name: zone.zoneName,
          floor_level: zone.floorLevel,
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
        warehouse_type: warehouseType,
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
