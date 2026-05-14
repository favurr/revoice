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

export async function sendVerificationEmail({
  email,
  verificationUrl,
  token,
}: SendVerificationEmailProps) {
  return (
    <>
      <h2>Verify Your Email Address</h2>
      <p>
        Welcome to AlphaWealth! Please verify your email address to complete
        your registration.
      </p>
      <p>
        <a
          href="${verificationUrl}"
          className="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;"
        >
          Verify Email
        </a>
      </p>
      <p>Or copy this link: ${verificationUrl}</p>
      <p className="color: #6b7280; font-size: 12px;">
        This link expires in 24 hours.
      </p>
      <p className="color: #6b7280; font-size: 12px;">
        If you didn't create this account, please ignore this email.
      </p>
    </>
  );
}

export async function sendResetPasswordEmail({
  email,
  resetUrl,
}: SendResetPasswordEmailProps) {
  return (
    <>
      <h2>Reset Your Password</h2>
      <p>
        We received a request to reset your password. Click the link below to
        proceed.
      </p>
      <p>
        <a
          href="${resetUrl}"
          className="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;"
        >
          Reset Password
        </a>
      </p>
      <p>Or copy this link: ${resetUrl}</p>
      <p className="color: #ef4444; font-weight: bold;">
        ⚠️ This link expires in 30 minutes for security reasons.
      </p>
      <p className="color: #6b7280; font-size: 12px;">
        If you didn't request a password reset, ignore this email. Your account
        remains secure.
      </p>
      <p className="color: #6b7280; font-size: 12px;">
        Never share this link with anyone.
      </p>
    </>
  );
}

export async function sendAccountLockedEmail({
  email,
  supportUrl,
}: SendAccountLockedEmailProps) {
  return (
    <>
      <h2>⚠️ Account Security Alert</h2>
      <p>
        We detected multiple failed login attempts on your account. For
        security, login attempts have been temporarily rate-limited.
      </p>
      <p>If this was you, you can try again in a few minutes.</p>
      <p>If this wasn't you, please reset your password immediately:</p>
      <p>
        <a
          href="${supportUrl}"
          className="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;"
        >
          Reset Password
        </a>
      </p>
      <p className="color: #6b7280; font-size: 12px;">
        Need help? Contact our support team.
      </p>
    </>
  );
}

export async function sendSecurityAuditEmail({
  email,
  action,
  ipAddress,
  userAgent,
}: SendSecurityAuditEmailProps) {
  const timestamp = new Date().toLocaleString();

  return (
    <>
      <h2>🔒 Security Activity</h2>
      <p>A sensitive action was performed on your account:</p>
      <ul>
        <li>
          <strong>Action:</strong> ${action}
        </li>
        <li>
          <strong>Time:</strong> ${timestamp}
        </li>
        ${ipAddress ? `<li><strong>IP Address:</strong> ${ipAddress}</li>` : ""}
        ${userAgent ? `<li><strong>Device:</strong> ${userAgent}</li>` : ""}
      </ul>
      <p>If this wasn't you, please reset your password immediately.</p>
      <p className="color: #6b7280; font-size: 12px;">
        This is an automated security notification. Do not reply to this email.
      </p>
    </>
  );
}