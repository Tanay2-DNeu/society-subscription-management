import pool from "../db/pool.js";

export const getActivePlansModel = async () => {
  const result = await pool.query(
    `SELECT id, flat_type, monthly_cost, is_active, created_at
     FROM subscription_plans
     WHERE is_active = true
     ORDER BY flat_type ASC`,
  );
  return result.rows;
};

export const getPlanHistoryModel = async (flatTypeOrNull) => {
  if (flatTypeOrNull) {
    const result = await pool.query(
      `SELECT id, flat_type, monthly_cost, is_active, created_at
       FROM subscription_plans
       WHERE flat_type = $1
       ORDER BY created_at DESC, id DESC`,
      [flatTypeOrNull],
    );
    return result.rows;
  }

  const result = await pool.query(
    `SELECT id, flat_type, monthly_cost, is_active, created_at
     FROM subscription_plans
     ORDER BY created_at DESC, id DESC`,
  );
  return result.rows;
};

export const getPlanByIdModel = async (id) => {
  const result = await pool.query(
    `SELECT id, flat_type, monthly_cost, is_active, created_at
     FROM subscription_plans
     WHERE id = $1`,
    [id],
  );
  return result.rows[0] || null;
};

export const createPlanModel = async ({ flat_type, monthly_cost }) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Ensure only one active plan per flat_type
    await client.query(
      `UPDATE subscription_plans
       SET is_active = false
       WHERE flat_type = $1 AND is_active = true`,
      [flat_type],
    );

    const result = await client.query(
      `INSERT INTO subscription_plans (flat_type, monthly_cost, is_active)
       VALUES ($1, $2, true)
       RETURNING id, flat_type, monthly_cost, is_active, created_at`,
      [flat_type, monthly_cost],
    );

    await client.query("COMMIT");
    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const updatePlanPriceByVersioningModel = async (flat_type, monthly_cost) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Deactivate previous active plan
    await client.query(
      `UPDATE subscription_plans
       SET is_active = false
       WHERE flat_type = $1 AND is_active = true`,
      [flat_type],
    );

    // Insert new plan version as active
    const result = await client.query(
      `INSERT INTO subscription_plans (flat_type, monthly_cost, is_active)
       VALUES ($1, $2, true)
       RETURNING id, flat_type, monthly_cost, is_active, created_at`,
      [flat_type, monthly_cost],
    );

    await client.query("COMMIT");
    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

