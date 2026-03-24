import pool from "../db/pool.js";

export const createUserModel = async ({ name, email, phone, passwordHash }) => {
  const result = await pool.query(
    `INSERT INTO users (name, email, phone, password_hash, role, status)
     VALUES ($1, $2, $3, $4, 'resident', 'pending')
     RETURNING id, name, email, phone, role, status`,
    [name, email, phone ?? null, passwordHash],
  );

  return result.rows[0];
};

export const findUserByEmailModel = async (email) => {
  const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [
    email,
  ]);

  return result.rows[0];
};

export const findUserByIdModel = async (id) => {
  const result = await pool.query(
    `SELECT id, name, email, phone, role, status, is_active, created_at
     FROM users WHERE id = $1`,
    [id],
  );
  return result.rows[0] || null;
};

export const updateResidentProfileModel = async (
  userId,
  { phone, passwordHash },
) => {
  const fields = [];
  const values = [];
  let i = 1;

  if (phone !== undefined) {
    fields.push(`phone = $${i++}`);
    values.push(phone);
  }
  if (passwordHash !== undefined) {
    fields.push(`password_hash = $${i++}`);
    values.push(passwordHash);
  }

  if (fields.length === 0) return null;

  values.push(userId);
  const result = await pool.query(
    `UPDATE users SET ${fields.join(", ")}
     WHERE id = $${i} AND role = 'resident'
     RETURNING id, name, email, phone, role, status`,
    values,
  );
  return result.rows[0] || null;
};

export const updateAdminProfileModel = async (
  userId,
  { name, phone, passwordHash },
) => {
  const fields = [];
  const values = [];
  let i = 1;

  if (name !== undefined) {
    fields.push(`name = $${i++}`);
    values.push(name);
  }
  if (phone !== undefined) {
    fields.push(`phone = $${i++}`);
    values.push(phone);
  }
  if (passwordHash !== undefined) {
    fields.push(`password_hash = $${i++}`);
    values.push(passwordHash);
  }

  if (fields.length === 0) return null;

  values.push(userId);
  const result = await pool.query(
    `UPDATE users SET ${fields.join(", ")}
     WHERE id = $${i} AND role = 'admin'
     RETURNING id, name, email, phone, role, status`,
    values,
  );
  return result.rows[0] || null;
};
