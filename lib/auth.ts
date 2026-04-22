import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import prisma from "@/lib/prisma";
import { sendVerificationEmail, sendResetPasswordEmail } from "@/lib/email";
import { validateAuthEnvironment, validateFrontendSecrets, logAuthConfiguration } from "@/lib/env-validation";

// SECURITY: Validate environment at startup
if (typeof window === "undefined") {
  // Server-side only
  validateAuthEnvironment();
  validateFrontendSecrets();
  logAuthConfiguration();
}

if (!process.env.BETTER_AUTH_SECRET || process.env.BETTER_AUTH_SECRET.length < 32) {
  throw new Error(
    "BETTER_AUTH_SECRET must be set and at least 32 characters long. Generate with: openssl rand -base64 32"
  );
}

export const auth = betterAuth({
  appName: "AlphaWealth",
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, {
    provider: "sqlite",
  }),
  
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 12,
    maxPasswordLength: 256,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }, _request) => {
      await sendResetPasswordEmail(user.email, url);
    },
    resetPasswordTokenExpiresIn: 60 * 30,
    revokeSessionsOnPasswordReset: true,
  },

  emailVerification: {
    sendVerificationEmail: async ({ user, url }, _request) => {
      await sendVerificationEmail(user.email, url);
    },
    sendOnSignUp: true,
    sendOnSignIn: false,
  },

  session: {
    expiresIn: 7 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
      strategy: "jwe",
    },
  },

  rateLimit: {
    enabled: true,
    window: 10,
    max: 100,
    storage: "database",
    customRules: {
      "/api/auth/sign-in/email": {
        window: 60,
        max: 5,
      },
      "/api/auth/sign-up/email": {
        window: 60 * 5,
        max: 3,
      },
      "/api/auth/forget-password": {
        window: 60 * 15,
        max: 3,
      },
    },
  },

  advanced: {
    useSecureCookies: true,
    disableCSRFCheck: false,
    crossSubDomainCookies: {
      enabled: false,
    },
    ipAddress: {
      ipAddressHeaders: ["x-forwarded-for", "cf-connecting-ip"],
    },
    cookiePrefix: "__Secure-",
    defaultCookieAttributes: {
      sameSite: "strict",
      httpOnly: true,
      secure: true,
      path: "/",
    },
  },

  trustedOrigins: [
    process.env.BETTER_AUTH_URL || "http://localhost:3000",
    ...(process.env.TRUSTED_ORIGINS?.split(",") || []),
  ],

  plugins: [nextCookies()],

  hooks: {
    // SECURITY: Log authentication events for audit trail
    after: async (ctx) => {
      try {
        const session = ctx.context?.session;
        const isAuthPath = ctx.path.includes("/sign-in") || 
                          ctx.path.includes("/sign-up") || 
                          ctx.path.includes("/sign-out");
        
        if (isAuthPath && session?.user) {
          console.log(`[AUTH] ${ctx.path} - User: ${session.user.email} at ${new Date().toISOString()}`);
        }
      } catch (e) {
        console.error("[AUTH] Audit logging failed:", e);
      }
    },
  },

  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          console.log(`[AUTH] New user created: ${user.email}`);
        },
      },
    },
    session: {
      create: {
        after: async (session) => {
          console.log(`[AUTH] Session created for user: ${session.userId}`);
        },
      },
    },
  },
});

export type Errorcode = keyof typeof auth.$ERROR_CODES | "UNKNOWN_ERROR";
