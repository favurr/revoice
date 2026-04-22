  "use server";

import { auth, Errorcode } from "@/lib/auth";
import { headers } from "next/headers";
import { APIError } from "better-auth/api";

export async function signInAction(email: string, password: string) {
  try {
    await auth.api.signInEmail({
      headers: await headers(),
      body: {
        email,
        password,
      },
    });

    return { success: true, message: "Sign in successful" };
  } catch (err) {
    if (err instanceof APIError) {
      const errCode = err.body ? (err.body.code as Errorcode) : "UNKNOWN_ERROR";

      switch (errCode) {
        default:
          return {
            success: false,
            message: err.message || "Sign in failed",
          };
      }
    }
  }
}

export async function signUpAction(email: string, password: string, name: string) {
  try {
    await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
      },
    });

    return { success: true, message: "Sign up successful" };
  } catch (err) {
    if (err instanceof APIError) {
      const errCode = err.body ? (err.body.code as Errorcode) : "UNKNOWN_ERROR";

      switch (errCode) {
        default:
          return {
            success: false,
            message: err.message || "Sign up failed",
          };
      }
    }
  }
}

export const signOutUser = async () => {
  try {
    await auth.api.signOut({
      headers: await headers(),
    });

    return { success: true, message: "Sign-out successfully" };
  } catch (err) {
    if (err instanceof APIError) {
      const errCode = err.body ? (err.body.code as Errorcode) : "UNKNOWN_ERROR";

      switch (errCode) {
        default:
          return {
            success: false,
            message: err.message || "Failed to sign in",
          };
      }
    }
  }
};

export const getSession = async () => {
  try {
    return await auth.api.getSession({
      headers: await headers(),
    });
  } catch (err) {
    if (err instanceof APIError) {
      const errCode = err.body ? (err.body.code as Errorcode) : "UNKNOWN_ERROR";

      switch (errCode) {
        default:
          return {
            success: false,
            message: err.message || "Failed to sign in",
          };
      }
    }
  }
};
