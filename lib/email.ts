/**
 * Email Service Module
 * Handles all authentication-related emails with security best practices
 */

export async function sendVerificationEmail(email: string, verificationUrl: string) {
  try {
    // SECURITY: Implement background email sending to prevent timing attacks
    // In production, use: SendGrid, Resend, AWS SES, etc.
    
    const emailContent = `
      <h2>Verify Your Email Address</h2>
      <p>Welcome to AlphaWealth! Please verify your email address to complete your registration.</p>
      <p>
        <a href="${verificationUrl}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">
          Verify Email
        </a>
      </p>
      <p>Or copy this link: ${verificationUrl}</p>
      <p style="color: #6b7280; font-size: 12px;">This link expires in 24 hours.</p>
      <p style="color: #6b7280; font-size: 12px;">If you didn't create this account, please ignore this email.</p>
    `;

    // TODO: Replace with your email service
    console.log(`[EMAIL] Verification email sent to ${email}`);
    console.log(`[EMAIL] URL: ${verificationUrl}`);

    // Production implementation example (using Resend):
    // import { Resend } from 'resend';
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({
    //   from: "noreply@alphawealth.com",
    //   to: email,
    //   subject: "Verify your email address",
    //   html: emailContent,
    // });

    return true;
  } catch (error) {
    console.error("[EMAIL] Failed to send verification email:", error);
    // SECURITY: Don't expose error details to user
    throw new Error("Failed to send verification email");
  }
}

export async function sendResetPasswordEmail(email: string, resetUrl: string) {
  try {
    // SECURITY: Use background task to prevent timing attacks
    
    const emailContent = `
      <h2>Reset Your Password</h2>
      <p>We received a request to reset your password. Click the link below to proceed.</p>
      <p>
        <a href="${resetUrl}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">
          Reset Password
        </a>
      </p>
      <p>Or copy this link: ${resetUrl}</p>
      <p style="color: #ef4444; font-weight: bold;">⚠️ This link expires in 30 minutes for security reasons.</p>
      <p style="color: #6b7280; font-size: 12px;">If you didn't request a password reset, ignore this email. Your account remains secure.</p>
      <p style="color: #6b7280; font-size: 12px;">Never share this link with anyone.</p>
    `;

    // TODO: Replace with your email service
    console.log(`[EMAIL] Password reset email sent to ${email}`);
    console.log(`[EMAIL] URL: ${resetUrl}`);

    // Production implementation example (using Resend):
    // import { Resend } from 'resend';
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({
    //   from: "noreply@alphawealth.com",
    //   to: email,
    //   subject: "Reset your password - AlphaWealth",
    //   html: emailContent,
    // });

    return true;
  } catch (error) {
    console.error("[EMAIL] Failed to send password reset email:", error);
    // SECURITY: Don't expose error details to user
    throw new Error("Failed to send password reset email");
  }
}

/**
 * Send account locked notification (after too many failed login attempts)
 * SECURITY: Part of brute force protection
 */
export async function sendAccountLockedEmail(email: string, supportUrl: string) {
  try {
    const emailContent = `
      <h2>⚠️ Account Security Alert</h2>
      <p>We detected multiple failed login attempts on your account. For security, login attempts have been temporarily rate-limited.</p>
      <p>If this was you, you can try again in a few minutes.</p>
      <p>If this wasn't you, please reset your password immediately:</p>
      <p>
        <a href="${supportUrl}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">
          Reset Password
        </a>
      </p>
      <p style="color: #6b7280; font-size: 12px;">Need help? Contact our support team.</p>
    `;

    console.log(`[EMAIL] Account locked notification sent to ${email}`);

    return true;
  } catch (error) {
    console.error("[EMAIL] Failed to send account locked email:", error);
  }
}

/**
 * Send security audit log (optional - for sensitive actions)
 * SECURITY: Notify users of sensitive account changes
 */
export async function sendSecurityAuditEmail(
  email: string,
  action: string,
  ipAddress?: string,
  userAgent?: string
) {
  try {
    const timestamp = new Date().toLocaleString();
    
    const emailContent = `
      <h2>🔒 Security Activity</h2>
      <p>A sensitive action was performed on your account:</p>
      <ul>
        <li><strong>Action:</strong> ${action}</li>
        <li><strong>Time:</strong> ${timestamp}</li>
        ${ipAddress ? `<li><strong>IP Address:</strong> ${ipAddress}</li>` : ""}
        ${userAgent ? `<li><strong>Device:</strong> ${userAgent}</li>` : ""}
      </ul>
      <p>If this wasn't you, please reset your password immediately.</p>
      <p style="color: #6b7280; font-size: 12px;">This is an automated security notification. Do not reply to this email.</p>
    `;

    console.log(`[EMAIL] Security audit email sent to ${email} for action: ${action}`);

    return true;
  } catch (error) {
    console.error("[EMAIL] Failed to send security audit email:", error);
  }
}
