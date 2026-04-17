import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";

import prisma from "./prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
  },
  session: {
    expiresIn: 30 * 24 * 60 * 60, // 30 days
  },
  plugins: [nextCookies()],
  trustedOrigins: [String(process.env.NEXT_PUBLIC_BASE_URL)],
});

export type Errorcode = keyof typeof auth.$ERROR_CODES | "UNKNOWN_ERROR";
