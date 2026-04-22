"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import {
  validatePasswordStrength,
  getPasswordStrengthLabel,
  getPasswordStrengthColor,
} from "@/lib/password-validation";

// SECURITY: Enforce strong password requirements
const formSchema = z
  .object({
    password: z
      .string()
      .min(12, "Password must be at least 12 characters long")
      .max(256, "Password is too long"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const password = form.watch("password");
  const passwordStrength = useMemo(
    () => validatePasswordStrength(password),
    [password]
  );

  // SECURITY: Verify reset token is valid
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setIsVerifying(false);
        toast.error("Reset token is missing. Please use the link from your email.");
        return;
      }

      try {
        // SECURITY: Verify token on backend
        const res = await fetch("/api/auth/verify-reset-token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        if (res.ok) {
          setIsValidToken(true);
        } else {
          toast.error("Reset link is invalid or expired. Please request a new one.");
        }
      } catch (error) {
        console.error("Token verification error:", error);
        toast.error("An error occurred verifying your reset link.");
      } finally {
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  // SECURITY: Submit new password with rate limiting on backend
  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!token || !passwordStrength.isValid) {
      toast.error("Invalid password or token");
      return;
    }

    try {
      setIsLoading(true);

      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          token,
          password: values.password,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setResetComplete(true);
        toast.success("Password reset successfully!");
        
        // SECURITY: Redirect to sign-in after successful reset
        setTimeout(() => {
          router.push("/sign-in");
        }, 2000);
      } else {
        toast.error(data?.message || "Failed to reset password. Please try again.");
      }
    } catch (error) {
      console.error("Password reset error:", error);
      toast.error("An error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }

  // SECURITY: Loading state while verifying token
  if (isVerifying) {
    return (
      <section className="flex px-4 py-16 md:py-32">
        <div className="bg-muted m-auto h-fit w-full max-w-sm overflow-hidden rounded-[calc(var(--radius)+.125rem)] border shadow-md shadow-zinc-950/5">
          <div className="bg-card -m-px rounded-[calc(var(--radius)+.125rem)] border p-8">
            <div className="text-center space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto" />
              <h1 className="text-xl font-semibold">Verifying Reset Link</h1>
              <p className="text-sm text-muted-foreground">
                Please wait while we verify your reset link...
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // SECURITY: Invalid token state
  if (!isValidToken) {
    return (
      <section className="flex px-4 py-16 md:py-32">
        <div className="bg-muted m-auto h-fit w-full max-w-sm overflow-hidden rounded-[calc(var(--radius)+.125rem)] border shadow-md shadow-zinc-950/5">
          <div className="bg-card -m-px rounded-[calc(var(--radius)+.125rem)] border p-8">
            <div className="text-center space-y-4">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
              <h1 className="text-xl font-semibold">Invalid Reset Link</h1>
              <p className="text-sm text-muted-foreground">
                This password reset link is invalid or has expired.
              </p>

              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Reset links expire in 30 minutes for security. Please request a new one.
                </AlertDescription>
              </Alert>

              <Button
                asChild
                className="w-full"
              >
                <a href="/forgot-password">Request New Reset Link</a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // SECURITY: Success state
  if (resetComplete) {
    return (
      <section className="flex px-4 py-16 md:py-32">
        <div className="bg-muted m-auto h-fit w-full max-w-sm overflow-hidden rounded-[calc(var(--radius)+.125rem)] border shadow-md shadow-zinc-950/5">
          <div className="bg-card -m-px rounded-[calc(var(--radius)+.125rem)] border p-8">
            <div className="text-center space-y-4">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
              <h1 className="text-xl font-semibold">Password Reset Success!</h1>
              <p className="text-sm text-muted-foreground">
                Your password has been reset successfully.
              </p>

              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  You'll be redirected to sign in in a few seconds...
                </AlertDescription>
              </Alert>

              <Button asChild className="w-full">
                <a href="/sign-in">Go to Sign In</a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // SECURITY: Reset password form
  return (
    <section className="flex px-4 py-16 md:py-32">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="bg-muted m-auto h-fit w-full max-w-sm overflow-hidden rounded-[calc(var(--radius)+.125rem)] border shadow-md shadow-zinc-950/5 dark:[--color-muted:var(--color-zinc-900)]"
        >
          <div className="bg-card -m-px rounded-[calc(var(--radius)+.125rem)] border p-8 pb-6">
            <div className="text-center">
              <h1 className="mb-1 mt-4 text-xl font-semibold">
                Create New Password
              </h1>
              <p className="text-sm text-muted-foreground">
                Enter a strong password to secure your account
              </p>
            </div>

            <div className="mt-6 space-y-6">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="At least 12 characters"
                          disabled={isLoading}
                          className="pr-10"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:opacity-50"
                          disabled={isLoading}
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {password && (
                <div className="space-y-2">
                  {/* SECURITY: Show password strength feedback */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        Password Strength
                      </span>
                      <span
                        className={`font-medium ${
                          passwordStrength.score >= 3
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {getPasswordStrengthLabel(passwordStrength.score)}
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all ${getPasswordStrengthColor(
                          passwordStrength.score
                        )}`}
                        style={{
                          width: `${((passwordStrength.score + 1) / 5) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* SECURITY: Show password requirements feedback */}
                  {passwordStrength.feedback.length > 0 && (
                    <Alert variant="destructive" className="py-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        <ul className="list-disc list-inside space-y-0.5">
                          {passwordStrength.feedback.slice(0, 2).map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Re-enter your password"
                          disabled={isLoading}
                          className="pr-10"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:opacity-50"
                          disabled={isLoading}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                className="w-full"
                type="submit"
                disabled={isLoading || !passwordStrength.isValid}
              >
                {isLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  "Reset Password"
                )}
              </Button>
            </div>

            {/* SECURITY: Show security information */}
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded text-xs text-blue-900 dark:text-blue-100">
              <p className="font-medium mb-1">🔒 Password Reset Security:</p>
              <ul className="space-y-0.5 list-disc list-inside">
                <li>Strong password enforced (12+ characters)</li>
                <li>This link expires in 30 minutes</li>
                <li>All previous sessions will be logged out</li>
                <li>Only usable once</li>
              </ul>
            </div>
          </div>
        </form>
      </Form>
    </section>
  );
}
