import pool from "../db/pool.js";

// assign resident
export const assignResidentModel = async (flatId, userId, assignmentRole = "owner") => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const flatResult = await client.query(
      "SELECT id, flat_number FROM flats WHERE id = $1 AND is_active = true",
      [flatId],
    );

    if (flatResult.rowCount === 0) {
      const error = new Error("Flat not found");
      error.statusCode = 404;
      throw error;
    }

    const userResult = await client.query(
      `SELECT id, name, email, phone, role, status, is_active
       FROM users
       WHERE id = $1`,
      [userId],
    );

    if (userResult.rowCount === 0) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    const user = userResult.rows[0];

    if (user.role !== "resident") {
      const error = new Error("Only resident users can be assigned to a flat");
      error.statusCode = 400;
      throw error;
    }

    if (user.is_active === false) {
      const error = new Error("Cannot assign inactive user");
      error.statusCode = 400;
      throw error;
    }

    // Only one current resident per flat.
    await client.query(
      `UPDATE flat_assignments
       SET is_current = false, end_date = NOW()
       WHERE flat_id = $1 AND is_current = true`,
      [flatId],
    );

    // Only one current flat per resident.
    await client.query(
      `UPDATE flat_assignments
       SET is_current = false, end_date = NOW()
       WHERE user_id = $1 AND is_current = true`,
      [userId],
    );

    const assignmentResult = await client.query(
      `INSERT INTO flat_assignments (flat_id, user_id, role, is_current, start_date)
       VALUES ($1, $2, $3, true, NOW())
       RETURNING id, flat_id, user_id, role, is_current, start_date, end_date`,
      [flatId, userId, assignmentRole],
    );

    if (user.status !== "approved") {
      await client.query(
        "UPDATE users SET status = 'approved' WHERE id = $1 AND status <> 'approved'",
        [userId],
      );
    }

    await client.query("COMMIT");

    return {
      message: "Resident assigned successfully",
      assignment: assignmentResult.rows[0],
      resident: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        status: "approved",
      },
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

// unassign resident
export const unassignResidentModel = async (flatId) => {
  await pool.query(
    `UPDATE flat_assignments
     SET is_current = false, end_date = NOW()
     WHERE flat_id = $1 AND is_current = true`,
    [flatId],
  );

  return { message: "Resident removed from flat" };
};

// get residents of a flat
export const getFlatResidentsModel = async (flatId) => {
  const result = await pool.query(
    `SELECT u.id, u.name, u.email, u.phone
     FROM flat_assignments fa
     JOIN users u ON fa.user_id = u.id
     WHERE fa.flat_id = $1 AND fa.is_current = true`,
    [flatId],
  );

  return result.rows;
};
