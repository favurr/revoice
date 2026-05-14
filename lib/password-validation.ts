/**
 * Password Security Utilities
 * SECURITY: Validates passwords according to security best practices
 */

export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4; // 0 = very weak, 4 = very strong
  feedback: string[];
  isValid: boolean;
}

/**
 * Validate password strength
 * SECURITY: Enforces strong password requirements
 */
export function validatePasswordStrength(password: string): PasswordStrength {
  const feedback: string[] = [];
  let score = 0;

  // Minimum length check
  if (password.length >= 12) {
    score += 1;
  } else if (password.length >= 8) {
    feedback.push("Password should be at least 12 characters long");
  } else {
    feedback.push("Password must be at least 12 characters long");
    return { score: 0, feedback, isValid: false };
  }

  // Uppercase letters
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push("Add uppercase letters (A-Z) for stronger security");
  }

  // Lowercase letters
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push("Add lowercase letters (a-z) for stronger security");
  }

  // Numbers
  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push("Add numbers (0-9) for stronger security");
  }

  // Special characters
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    score += 1;
  } else {
    feedback.push("Add special characters (!@#$%^&*) for maximum security");
  }

  // Check for common patterns (security improvement)
  if (/(.)\1{2,}/.test(password)) {
    feedback.push("Avoid repeating characters");
    score = Math.max(0, score - 1);
  }

  // Check for common passwords
  const commonPasswords = [
    "password",
    "123456",
    "qwerty",
    "abc123",
    "password123",
    "admin",
    "letmein",
  ];
  if (commonPasswords.some((common) => password.toLowerCase().includes(common))) {
    feedback.push("This password is too common. Choose something more unique");
    score = 0;
  }

  return {
    score: Math.min(4, score) as 0 | 1 | 2 | 3 | 4,
    feedback,
    isValid: score >= 3 && !commonPasswords.some((common) => password.includes(common)),
  };
}

/**
 * Get password strength label
 */
export function getPasswordStrengthLabel(score: 0 | 1 | 2 | 3 | 4): string {
  const labels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
  return labels[score];
}

/**
 * Get password strength color for UI
 */
export function getPasswordStrengthColor(score: 0 | 1 | 2 | 3 | 4): string {
  const colors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-blue-500", "bg-green-500"];
  return colors[score];
}
