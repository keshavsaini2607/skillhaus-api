const jwt = require("jsonwebtoken");
const { pool } = require("../config/database");
const queries = require("../query/db_query");
require("dotenv").config();

const getUsers = async (username) => {
   try {
      const query = "SELECT * FROM live.users WHERE username = $1";
      const result = await pool.query(query, [username]);
      return result.rows;
   } catch (error) {
      throw new Error(`Database query error: ${error.message}`);
   }
};

const loginUser = async ({ username, password }) => {
   try {
      const users = await getUsers(username);

      if (!users.length) {
         const error = new Error("User not found");
         error.status = 404;
         throw error;
      }

      const user = users[0];

      // Simple password comparison (you might want to use bcrypt here)
      if (user.password !== password) {
         const error = new Error("Invalid credentials");
         error.status = 401;
         throw error;
      }

      // Generate JWT Token
      const token_payload = {
         sub: user.user_id,
         username: user.username,
         exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour expiration
      };

      const token = jwt.sign(token_payload, process.env.SECRET_KEY);
      return {
         access_token: token,
         token_type: "bearer",
         username: user.username,
      };
   } catch (error) {
      throw error;
   }
};

async function updatePassword({ username, newPassword }) {
   try {
      const query = "UPDATE live.users SET password = $1 WHERE username = $2";
      const result = await pool.query(query, [newPassword, username]);

      console.log({ username });

      if (result.rowCount === 0) {
         const error = new Error("User not found");
         error.status = 404;
         throw error;
      }

      return {
         success: true,
         message: "Password updated successfully",
         username: username,
      };
   } catch (error) {
      if (error.status) {
         throw error;
      }
      throw new Error(`Database query error: ${error.message}`);
   }
}

module.exports = {
   getUsers,
   loginUser,
   updatePassword,
};
