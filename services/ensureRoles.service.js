const Role = require("../models/Role.model");
const logger = require("../utils/logger.util");

async function ensureRoles() {
  const roleNames = ["Admin", "User", "Owner", "Employee"];
  try {
    await Promise.all(
      roleNames.map((name) =>
        Role.updateOne({ name }, { $setOnInsert: { name } }, { upsert: true })
      )
    );
    logger.info("Roles ensured", { roles: roleNames });
  } catch (error) {
    logger.error("Failed to ensure roles", { error: error.message, stack: error.stack });
  }
}

module.exports = { ensureRoles };

