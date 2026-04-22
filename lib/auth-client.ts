import { createAuthClient } from "better-auth/react";

// SECURITY: Use relative URLs to prevent frontend exposure of base URL
// The auth client will automatically use the current origin + /api/auth
export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL ? process.env.BETTER_AUTH_URL : undefined,
});

export const { signIn, signUp, signOut, useSession } = authClient;
