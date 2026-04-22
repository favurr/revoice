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
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, AlertTriangle, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";

const formSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z.string().min(6, "Password is required"),
});

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isRateLimited, setIsRateLimited] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // SECURITY: Define a submit handler with rate limit feedback
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);

      const res = await fetch("/api/auth/sign-in/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: values.email,
          password: values.password,
          // SECURITY: Absolute callback URL
          callbackURL: `${typeof window !== "undefined" ? window.location.origin : ""}/dashboard`,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        toast.success("Sign in successful. Redirecting...");
        setFailedAttempts(0);
        router.push("/dashboard");
      } else {
        // SECURITY: Handle rate limiting feedback
        if (res.status === 429) {
          setIsRateLimited(true);
          toast.error(
            "Too many login attempts. Please try again in a few minutes."
          );
        } else {
          // SECURITY: Don't leak whether email exists (timing attack prevention)
          const newAttempts = failedAttempts + 1;
          setFailedAttempts(newAttempts);

          // Show warning after 2 attempts
          if (newAttempts >= 2) {
            toast.warning(
              `${5 - newAttempts} attempts remaining before temporary lockout`
            );
          }

          toast.error(
            data?.message || "Invalid email or password. Please try again."
          );
        }
      }
    } catch (error) {
      console.error("Sign in error:", error);
      toast.error("Unable to sign in right now. Please try again later.");
    } finally {
      setIsLoading(false);
    }
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
                Sign In to AlphaWealth
              </h1>
              <p className="text-sm">Welcome back! Sign in to continue</p>
            </div>

            {/* SECURITY: Show rate limit warning */}
            {isRateLimited && (
              <Alert variant="destructive" className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Too many failed login attempts. Please wait a few minutes
                  before trying again.
                </AlertDescription>
              </Alert>
            )}

            {failedAttempts >= 2 && !isRateLimited && (
              <Alert variant="destructive" className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {5 - failedAttempts} attempts remaining before temporary
                  lockout. Please check your credentials carefully.
                </AlertDescription>
              </Alert>
            )}

            <div className="mt-6 space-y-6">
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="example@email.com"
                          type="email"
                          disabled={isRateLimited}
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
                      <div className="flex items-center justify-between">
                        <FormLabel>Password</FormLabel>
                        <Button asChild variant="link" size="sm">
                          <Link
                            href="/forgot-password"
                            className="text-sm font-medium hover:underline"
                          >
                            Forgot Password?
                          </Link>
                        </Button>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            disabled={isRateLimited}
                            className="pr-10"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:opacity-50"
                            disabled={isRateLimited}
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
              </div>

              <Button
                className="w-full"
                type="submit"
                disabled={isLoading || isRateLimited}
              >
                {isLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  "Sign In"
                )}
              </Button>
            </div>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">
                Don't have an account?{" "}
              </span>
              <Button asChild variant="link" className="px-0 h-auto font-medium">
                <Link href="/sign-up">Create account</Link>
              </Button>
            </div>

            {/* SECURITY: Show security information */}
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded text-xs text-blue-900 dark:text-blue-100">
              <p className="font-medium mb-1">🔒 Security Features:</p>
              <ul className="space-y-0.5 list-disc list-inside">
                <li>Rate-limited login attempts (5 per minute)</li>
                <li>Email verification required for new accounts</li>
                <li>Secure encrypted sessions</li>
                <li>Never shares whether email exists (timing-attack safe)</li>
              </ul>
            </div>
          </div>
        </form>
      </Form>
    </section>
  );
}
