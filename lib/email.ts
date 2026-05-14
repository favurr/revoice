import {
  sendAccountLockedEmail,
  sendResetPasswordEmail,
  sendSecurityAuditEmail,
  sendVerificationEmail,
} from "@/components/email-template";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "");
const emailFrom = process.env.EMAIL_FROM!;

function validateResendConfig() {
  if (!process.env.RESEND_API_KEY) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "RESEND_API_KEY is required in production to send authentication emails.",
      );
    }
    console.warn(
      "⚠️ RESEND_API_KEY is not configured. Email sending is disabled in development.",
    );
    return false;
  }
  return true;
}

const isResendConfigured = validateResendConfig();

interface SendVerificationEmailProps {
  email: string;
  verificationUrl: string;
  token: string;
}

interface SendResetPasswordEmailProps {
  email: string;
  resetUrl: string;
}

interface SendAccountLockedEmailProps {
  email: string;
  supportUrl: string;
}

interface SendSecurityAuditEmailProps {
  email: string;
  action: string;
  ipAddress?: string;
  userAgent?: string;
}

export async function handleSendVerificationEmail({
  email,
  verificationUrl,
  token,
}: SendVerificationEmailProps) {
  if (!isResendConfigured) {
    console.warn("Email sending is disabled. Skipping sendVerificationEmail.");
    return;
  }
  try {
    const emailContent = await sendVerificationEmail({
      email,
      verificationUrl,
      token,
    });

    const { data, error } = await resend.emails.send({
      from: emailFrom,
      to: email,
      subject: "Verify Your Email Address",
      react: emailContent,
    });
    console.log(`[EMAIL] Verification email queued for ${email}`, data);
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("[EMAIL] Failed to send verification email:", error);
    throw error;
  }
}

export async function handleSendResetPasswordEmail({
  email,
  resetUrl,
}: SendResetPasswordEmailProps) {
  if (!isResendConfigured) {
    console.warn("Email sending is disabled. Skipping sendResetPasswordEmail.");
    return;
  }
  try {
    const emailContent = await sendResetPasswordEmail({
      email,
      resetUrl,
    });

    const { data, error } = await resend.emails.send({
      from: emailFrom,
      to: email,
      subject: "Reset Your Password",
      react: emailContent,
    });

    console.log(`[RESET PASSWORD] Reset password email queued for ${email}`);

    if (error) {
      console.error(
        `[RESET PASSWORD] Failed to send reset password email for ${email}:`,
        error,
      );
      throw error;
    }

    return data;
  } catch (error) {
    console.error(
      "[RESET PASSWORD] Failed to send reset password email:",
      error,
    );
    throw error;
  }
}

export async function handleSendAccountLockedEmail({
  email,
  supportUrl,
}: SendAccountLockedEmailProps) {
  if (!isResendConfigured) {
    console.warn("Email sending is disabled. Skipping sendAccountLockedEmail.");
    return;
  }
  try {
    const emailContent = await sendAccountLockedEmail({ email, supportUrl });

    const { data, error } = await resend.emails.send({
      from: emailFrom,
      to: email,
      subject: "Account security alert",
      react: emailContent,
    });

    console.log(`[EMAIL] Account locked notification queued for ${email}`);

    if (error) {
      console.error(
        `[EMAIL] Failed to send account locked email for ${email}:`,
        error,
      );
      throw error;
    }

    return data;
  } catch (error) {
    console.error("[EMAIL] Failed to send account locked email:", error);
    throw error;
  }
}

export async function handleSendSecurityAuditEmail({
  email,
  action,
  ipAddress,
  userAgent,
}: SendSecurityAuditEmailProps) {
  if (!isResendConfigured) {
    console.warn("Email sending is disabled. Skipping sendSecurityAuditEmail.");
    return;
  }
  // For security audit emails, we want to log the event and send a notification
  const timestamp = new Date().toISOString();
  console.log(
    `[SECURITY AUDIT] ${timestamp} - Action: ${action}, Email: ${email}, IP: ${ipAddress}, User Agent: ${userAgent}`,
  );

  try {
    const emailContent = await sendSecurityAuditEmail({
      email,
      action,
      ipAddress,
      userAgent,
    });

    const { data, error } = await resend.emails.send({
      from: emailFrom,
      to: email,
      subject: "Security Audit Notification",
      react: emailContent,
    });

    console.log(`[EMAIL] Security audit notification queued for ${email}`);

    if (error) {
      console.error(
        `[SECURITY AUDIT] Failed to send security audit email for ${email}:`,
        error,
      );
      throw error;
    }

    return data;
  } catch (error) {
    console.error(
      "[SECURITY AUDIT] Failed to send security audit email:",
      error,
    );
    throw error;
  }
}
