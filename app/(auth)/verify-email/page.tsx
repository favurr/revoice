"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, AlertCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const verifyEmail = async () => {
      const code = searchParams.get("code");
      const email = searchParams.get("email");

      if (!code) {
        setStatus("error");
        setMessage("Verification code is missing. Please check the email link.");
        return;
      }

      try {
        // SECURITY: Call Better Auth verification endpoint
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            code,
            email,
          }),
        });

        if (res.ok) {
          setStatus("success");
          setMessage("Your email has been verified successfully!");
          toast.success("Email verified! You can now sign in.");
          
          // SECURITY: Redirect to dashboard after successful verification
          setTimeout(() => {
            router.push("/dashboard");
          }, 2000);
        } else {
          const data = await res.json().catch(() => ({}));
          setStatus("error");
          setMessage(
            data?.message || "Verification failed. The link may have expired."
          );
        }
      } catch (error) {
        console.error("Email verification error:", error);
        setStatus("error");
        setMessage("An error occurred during verification. Please try again.");
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  return (
    <section className="flex px-4 py-16 md:py-32">
      <div className="bg-muted m-auto h-fit w-full max-w-sm overflow-hidden rounded-[calc(var(--radius)+.125rem)] border shadow-md shadow-zinc-950/5">
        <div className="bg-card -m-px rounded-[calc(var(--radius)+.125rem)] border p-8">
          <div className="text-center space-y-4">
            {status === "loading" && (
              <>
                <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto" />
                <h1 className="text-xl font-semibold">Verifying Email</h1>
              </>
            )}

            {status === "success" && (
              <>
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                <h1 className="text-xl font-semibold">Email Verified!</h1>
              </>
            )}

            {status === "error" && (
              <>
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
                <h1 className="text-xl font-semibold">Verification Failed</h1>
              </>
            )}

            <p className="text-sm text-muted-foreground">{message}</p>

            {status === "error" && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Verification links expire after 24 hours. If the link has expired, please sign up again.
                </AlertDescription>
              </Alert>
            )}

            {status === "success" && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  You'll be redirected to your dashboard in a few seconds...
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2 pt-4">
              {status === "error" && (
                <>
                  <Button asChild className="w-full">
                    <Link href="/sign-up">Create New Account</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/sign-in">Back to Sign In</Link>
                  </Button>
                </>
              )}

              {status === "success" && (
                <Button asChild className="w-full">
                  <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
              )}
            </div>

            {/* SECURITY: Show security information */}
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded text-xs text-blue-900 dark:text-blue-100">
              <p className="font-medium mb-1">🔒 Verification Security:</p>
              <ul className="space-y-0.5 list-disc list-inside">
                <li>Verification links expire in 24 hours</li>
                <li>Each code is unique and can only be used once</li>
                <li>Your account is protected once verified</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
