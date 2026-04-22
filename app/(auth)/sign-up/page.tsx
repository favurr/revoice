"use client";

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
import Link from "next/link";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Loader2, AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  validatePasswordStrength,
  getPasswordStrengthLabel,
  getPasswordStrengthColor,
} from "@/lib/password-validation";
import { Alert, AlertDescription } from "@/components/ui/alert";

// SECURITY: Enforce strong password requirements (min 12 chars)
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Please enter a valid email address"),
  password: z
    .string()
    .min(12, "Password must be at least 12 characters long")
    .max(256, "Password is too long"),
});

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
  });

  const password = form.watch("password");
  const passwordStrength = useMemo(
    () => validatePasswordStrength(password),
    [password]
  );

  // SECURITY: Define a submit handler with email verification flow
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);

      // SECURITY: Validate password strength on client before sending
      if (!passwordStrength.isValid) {
        toast.error("Password does not meet security requirements");
        return;
      }

      const res = await fetch("/api/auth/sign-up/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          password: values.password,
          // SECURITY: Absolute callback URL prevents CSRF
          callbackURL: `${typeof window !== "undefined" ? window.location.origin : ""}/verify-email`,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        // SECURITY: Email verification is now required
        toast.success(
          "Sign up successful! Please check your email to verify your account."
        );
        setVerificationSent(true);
        // Don't redirect until email is verified
        // User will be guided by email verification link
      } else {
        // SECURITY: Don't leak whether email exists (timing attack prevention)
        // Better Auth handles this internally with constant-time responses
        toast.error(
          data?.message ||
            "Sign up failed. If this is a valid email, you may need to verify it."
        );
      }
    } catch (error) {
      console.error("Sign up error:", error);
      toast.error("Unable to sign up right now. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }

  if (verificationSent) {
    return (
      <section className="flex px-4 py-16 md:py-32">
        <div className="bg-muted m-auto h-fit w-full max-w-sm overflow-hidden rounded-[calc(var(--radius)+.125rem)] border shadow-md shadow-zinc-950/5">
          <div className="bg-card -m-px rounded-[calc(var(--radius)+.125rem)] border p-8">
            <div className="text-center space-y-4">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
              <h1 className="text-xl font-semibold">Verify Your Email</h1>
              <p className="text-sm text-muted-foreground">
                We've sent a verification link to your email address. Please
                click the link to complete your registration.
              </p>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Check your spam folder if you don't see the email within a
                  few minutes.
                </AlertDescription>
              </Alert>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => setVerificationSent(false)}
              >
                Back to Sign Up
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

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
                Join AlphaWealth
              </h1>
              <p className="text-sm">Create an account to get started</p>
            </div>

            <div className="mt-6 space-y-6">
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="example@email.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="At least 12 characters"
                            {...field}
                            className="pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
              </div>

              <Button
                className="w-full"
                type="submit"
                disabled={isLoading || !passwordStrength.isValid}
              >
                {isLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  "Create Account"
                )}
              </Button>
            </div>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">
                Already have an account?{" "}
              </span>
              <Link href="/sign-in" className="text-primary font-medium">
                Sign In
              </Link>
            </div>

            {/* SECURITY: Show security information */}
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded text-xs text-blue-900 dark:text-blue-100">
              <p className="font-medium mb-1">🔒 Your account is protected by:</p>
              <ul className="space-y-0.5 list-disc list-inside">
                <li>Email verification required</li>
                <li>Password strength enforcement</li>
                <li>Rate-limited login attempts</li>
                <li>Secure encrypted sessions</li>
              </ul>
            </div>
          </div>
        </form>
      </Form>
    </section>
  );
}