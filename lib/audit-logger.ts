/**
 * Audit Logging Utility
 * SECURITY: Tracks authentication events for security and compliance
 */

export enum AuditEventType {
  // Authentication events
  SIGN_UP = "SIGN_UP",
  SIGN_IN = "SIGN_IN",
  SIGN_OUT = "SIGN_OUT",
  PASSWORD_RESET_REQUESTED = "PASSWORD_RESET_REQUESTED",
  PASSWORD_RESET_COMPLETED = "PASSWORD_RESET_COMPLETED",
  EMAIL_VERIFIED = "EMAIL_VERIFIED",

  // Security events
  FAILED_LOGIN_ATTEMPT = "FAILED_LOGIN_ATTEMPT",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
  SUSPICIOUS_ACTIVITY = "SUSPICIOUS_ACTIVITY",
  SESSION_REVOKED = "SESSION_REVOKED",

  // Account events
  ACCOUNT_LOCKED = "ACCOUNT_LOCKED",
  ACCOUNT_UNLOCKED = "ACCOUNT_UNLOCKED",
  PASSWORD_CHANGED = "PASSWORD_CHANGED",
  EMAIL_CHANGED = "EMAIL_CHANGED",
}

export interface AuditLogEntry {
  timestamp: Date;
  eventType: AuditEventType;
  userId?: string;
  email?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, unknown>;
  success: boolean;
  error?: string;
}

/**
 * In-memory audit log store (development)
 * SECURITY: In production, use a database or external service like DataDog, CloudWatch, etc.
 */
let auditLogs: AuditLogEntry[] = [];

/**
 * Log an authentication event
 * SECURITY: Use this to track all auth-related events for debugging and security analysis
 */
export function logAuditEvent(
  eventType: AuditEventType,
  userId?: string,
  email?: string,
  ipAddress?: string,
  userAgent?: string,
  details?: Record<string, unknown>,
  success: boolean = true,
  error?: string
) {
  const logEntry: AuditLogEntry = {
    timestamp: new Date(),
    eventType,
    userId,
    email,
    ipAddress,
    userAgent,
    details,
    success,
    error,
  };

  auditLogs.push(logEntry);

  // SECURITY: Log to console in development
  const logLevel = success ? "info" : "warn";
  console[logLevel as "info" | "warn"](
    `[AUDIT] ${eventType}`,
    email || userId,
    {
      ipAddress: ipAddress?.substring(0, 15), // Avoid logging full internal IPs
      success,
      ...(error && { error }),
    }
  );

  // SECURITY: In production, send to external logging service
  if (process.env.NODE_ENV === "production") {
    // Example: Send to DataDog, Sentry, CloudWatch, etc.
    // await sendToExternalLogger(logEntry);
  }

  // SECURITY: Keep only last 10,000 events in memory
  if (auditLogs.length > 10000) {
    auditLogs = auditLogs.slice(-10000);
  }

  return logEntry;
}

/**
 * Get audit logs (development only)
 * SECURITY: In production, query your audit log database/service
 */
export function getAuditLogs(
  userId?: string,
  eventType?: AuditEventType,
  limit = 100
): AuditLogEntry[] {
  let filtered = auditLogs;

  if (userId) {
    filtered = filtered.filter((log) => log.userId === userId);
  }

  if (eventType) {
    filtered = filtered.filter((log) => log.eventType === eventType);
  }

  return filtered.slice(-limit);
}

/**
 * Get failed login attempts for a user (brute force detection)
 * SECURITY: Use to implement account lockout logic
 */
export function getFailedLoginAttempts(
  email: string,
  windowMinutes = 15
): AuditLogEntry[] {
  const windowTime = new Date(Date.now() - windowMinutes * 60 * 1000);

  return auditLogs.filter(
    (log) =>
      log.email === email &&
      log.eventType === AuditEventType.FAILED_LOGIN_ATTEMPT &&
      log.timestamp > windowTime
  );
}

/**
 * Check if account should be locked due to brute force
 * SECURITY: Lock after 5 failed attempts in 15 minutes
 */
export function shouldLockAccount(email: string): boolean {
  const failedAttempts = getFailedLoginAttempts(email, 15);
  return failedAttempts.length >= 5;
}

/**
 * Clear audit logs (development/testing only)
 * SECURITY: Never use in production!
 */
export function clearAuditLogs() {
  if (process.env.NODE_ENV !== "development") {
    throw new Error("Audit logs can only be cleared in development mode");
  }
  auditLogs = [];
}
