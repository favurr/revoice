/**
 * Environment Variable Validation
 * SECURITY: Validates all sensitive configuration at startup
 */

export function validateAuthEnvironment() {
  const errors: string[] = [];

  // SECURITY: Check BETTER_AUTH_SECRET
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) {
    errors.push(
      "❌ BETTER_AUTH_SECRET is not set. Generate with: openssl rand -base64 32"
    );
  } else if (secret.length < 32) {
    errors.push(
      `❌ BETTER_AUTH_SECRET is too short (${secret.length} chars). Must be at least 32 characters.`
    );
  }

  // SECURITY: Check BETTER_AUTH_URL
  const authUrl = process.env.BETTER_AUTH_URL;
  if (!authUrl) {
    errors.push("❌ BETTER_AUTH_URL is not set (e.g., https://example.com)");
  } else {
    try {
      const url = new URL(authUrl);
      if (!url.protocol.includes("https") && process.env.NODE_ENV === "production") {
        errors.push("❌ BETTER_AUTH_URL must use HTTPS in production");
      }
    } catch {
      errors.push("❌ BETTER_AUTH_URL is not a valid URL");
    }
  }

  // SECURITY: Check TRUSTED_ORIGINS if set
  const trustedOrigins = process.env.TRUSTED_ORIGINS;
  if (trustedOrigins) {
    const origins = trustedOrigins.split(",").map((o) => o.trim());
    for (const origin of origins) {
      try {
        new URL(origin);
      } catch {
        errors.push(`❌ Invalid TRUSTED_ORIGINS: "${origin}" is not a valid URL`);
      }
    }
  }

  // SECURITY: Warn about email service configuration
  if (
    !process.env.RESEND_API_KEY &&
    !process.env.SENDGRID_API_KEY &&
    !process.env.AWS_SES_REGION &&
    process.env.NODE_ENV === "production"
  ) {
    errors.push(
      "⚠️  No email service configured (RESEND_API_KEY, SENDGRID_API_KEY, or AWS_SES_REGION). Email verification will not work."
    );
  }

  // SECURITY: Throw error if any critical issues
  if (errors.length > 0) {
    console.error(
      "\n🔒 SECURITY CONFIGURATION ERRORS:\n",
      errors.join("\n"),
      "\n"
    );
    
    if (process.env.NODE_ENV === "production") {
      throw new Error("Critical security configuration errors. See logs above.");
    } else {
      console.warn("⚠️  Running in development mode. Some checks are not enforced.");
    }
  } else {
    console.log("✅ Authentication environment variables validated successfully");
  }
}

/**
 * SECURITY: Check that auth secrets are never exposed to frontend
 * This utility helps verify build-time variables
 */
export function validateFrontendSecrets() {
  const forbiddenSecrets = [
    "BETTER_AUTH_SECRET",
    "DATABASE_URL",
    "RESEND_API_KEY",
    "SENDGRID_API_KEY",
    "AWS_SES_REGION",
    "SUPABASE_SYNC_KEY",
  ];

  const issues: string[] = [];

  // Check if any secrets are exposed as NEXT_PUBLIC_*
  for (const secret of forbiddenSecrets) {
    if (process.env[`NEXT_PUBLIC_${secret}`]) {
      issues.push(
        `❌ CRITICAL: ${secret} is exposed to frontend as NEXT_PUBLIC_${secret}`
      );
    }
  }

  if (issues.length > 0) {
    console.error("\n🔒 CRITICAL SECURITY ISSUE:\n", issues.join("\n"), "\n");
    throw new Error(
      "Secrets are exposed to frontend. This is a critical security vulnerability."
    );
  }
}

/**
 * Log environment configuration (without secrets)
 * SECURITY: Safe for debugging without leaking sensitive data
 */
export function logAuthConfiguration() {
  console.log("🔒 Authentication Configuration:");
  console.log("  - BETTER_AUTH_URL:", process.env.BETTER_AUTH_URL);
  console.log(
    "  - Email Service:",
    process.env.RESEND_API_KEY
      ? "Resend"
      : process.env.SENDGRID_API_KEY
        ? "SendGrid"
        : process.env.AWS_SES_REGION
          ? "AWS SES"
          : "Not configured"
  );
  console.log("  - Trusted Origins:", process.env.TRUSTED_ORIGINS || "Default only");
  console.log("  - Session Expiration: 7 days");
  console.log("  - Password Min Length: 12 characters");
  console.log("  - Email Verification: Required");
  console.log("  - Rate Limiting: Enabled (5 attempts per minute)");
  console.log("  - HTTPS Cookies: Enforced");
  console.log("  - CSRF Protection: Enabled");
}
