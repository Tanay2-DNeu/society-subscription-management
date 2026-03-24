import pool from "../db/pool.js";

/** Minimal list for admin payment entry (id, flat_number, block). */
export const getFlatsMinimalForAdminModel = async () => {
  const result = await pool.query(
    `SELECT id, flat_number, block
     FROM flats
     WHERE is_active = true
     ORDER BY block ASC, flat_number ASC`,
  );
  return result.rows;
};

export const getFlatsModel = async () => {
  const result = await pool.query(`
    SELECT 
      f.id,
      f.flat_number,
      f.block,
      f.floor,
      f.flattype,
      f.is_active,

      u.name AS resident_name,
      u.email,
      u.phone

    FROM flats f

    LEFT JOIN flat_assignments fa 
      ON f.id = fa.flat_id AND fa.is_current = true

    LEFT JOIN users u 
      ON fa.user_id = u.id

    WHERE f.is_active = true

    ORDER BY f.id;
  `);

  return result.rows;
};

export const createFlatModel = async (flatData) => {
  const { flat_number, block, floor, flattype } = flatData;
  console.log("flat  data goin in db: ", flatData);
  const result = await pool.query(
    `INSERT INTO flats (flat_number, block, floor, flattype) 
        VALUES ($1, $2, $3, $4)
        RETURNING *`, // returns inserted row from database after inserting
    [flat_number, block, floor, flattype],
  );
  return result.rows[0];
};

export const updateFlatModel = async (id, flatData) => {
  console.log("Flat Data", flatData);
  const { flat_number, block, floor, flattype } = flatData;

  const result = await pool.query(
    `UPDATE flats
        SET flat_number=$1, block= $2, floor=$3, flattype=$4
        WHERE id=$5
        RETURNING *`,
    [flat_number, block, floor, flattype, id],
  );
  return result.rows[0];
};

export const deleteFlatModel = async (id) => {
  await pool.query(
    `
        UPDATE flats 
        SET is_active=false
        WHERE id=$1`,
    [id],
  );

  return { message: "Flat deleted successfully" };
};
