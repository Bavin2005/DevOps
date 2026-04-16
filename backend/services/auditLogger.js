const AuditLog = require("../models/AuditLog");

/**
 * Generic Audit Logger
 * ---------------------
 * Records who did what, on which entity, and when.
 */
async function logAudit({
  action,
  entityType,
  entityId,
  performedBy,
  details = ""
}) {
  try {
    await AuditLog.create({
      action,
      entityType,
      entityId,
      performedBy,
      details
    });
  } catch (error) {
    console.error("Audit log failed:", error.message);
  }
}

module.exports = { logAudit };
