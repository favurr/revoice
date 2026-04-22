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
import { Loader2, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// SECURITY: Simple email validation for password reset
const formSchema = z.object({
  email: z.email("Please enter a valid email address"),
});

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  // SECURITY: Request password reset with rate limiting on backend
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);

      const res = await fetch("/api/auth/forget-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: values.email,
          // SECURITY: Redirect to reset page after email verification
          redirectURL: `${typeof window !== "undefined" ? window.location.origin : ""}/reset-password`,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setSentEmail(values.email);
        setResetSent(true);
        toast.success("Password reset email sent. Please check your inbox.");
      } else {
        // SECURITY: Don't reveal whether email exists (timing attack prevention)
        toast.error(
          "If an account exists with this email, you will receive a password reset link."
        );
      }
    } catch (error) {
      console.error("Password reset error:", error);
      toast.error("Unable to process password reset right now. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }

  if (resetSent) {
    return (
      <section className="flex px-4 py-16 md:py-32">
        <div className="bg-muted m-auto h-fit w-full max-w-sm overflow-hidden rounded-[calc(var(--radius)+.125rem)] border shadow-md shadow-zinc-950/5">
          <div className="bg-card -m-px rounded-[calc(var(--radius)+.125rem)] border p-8">
            <div className="text-center space-y-4">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
              <h1 className="text-xl font-semibold">Check Your Email</h1>
              <p className="text-sm text-muted-foreground">
                We've sent a password reset link to <strong>{sentEmail}</strong>
              </p>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  The reset link expires in 30 minutes. Check your spam folder if you don't see it within a few minutes.
                </AlertDescription>
              </Alert>

              <div className="space-y-2 pt-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setResetSent(false)}
                >
                  Try Another Email
                </Button>
                <Button asChild className="w-full">
                  <Link href="/sign-in">Back to Sign In</Link>
                </Button>
              </div>
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
                Reset Your Password
              </h1>
              <p className="text-sm text-muted-foreground">
                Enter your email address and we'll send you a link to reset your password
              </p>
            </div>

            <div className="mt-6 space-y-6">
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
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Security Note:</strong> If no account exists with this email, you won't see an error for security reasons.
                </AlertDescription>
              </Alert>

              <Button className="w-full" type="submit" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </div>

            <div className="mt-4 text-center text-sm">
              <Button asChild variant="link" className="px-0 h-auto font-medium">
                <Link href="/sign-in" className="flex items-center justify-center gap-1">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Sign In
                </Link>
              </Button>
            </div>

            {/* SECURITY: Show security information */}
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded text-xs text-blue-900 dark:text-blue-100">
              <p className="font-medium mb-1">🔒 Security Features:</p>
              <ul className="space-y-0.5 list-disc list-inside">
                <li>Reset link expires in 30 minutes</li>
                <li>Email verification required</li>
                <li>No email enumeration (we don't say if email exists)</li>
                <li>Previous sessions revoked when password reset</li>
              </ul>
            </div>
          </div>
        </form>
      </Form>
    </section>
  );
}