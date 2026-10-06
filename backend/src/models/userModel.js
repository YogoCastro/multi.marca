const pool = require("../config/database");

const getAllUsers = async () => {
  const [users] = await pool.query(
    `SELECT
            id,
            name,
            email,
            role,
            created_at
        FROM users
        ORDER BY created_at DESC`,
  );

  return users;
};

module.exports = {
  getAllUsers,
};
