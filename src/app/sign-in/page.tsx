"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import posthog from "posthog-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/lib/auth/client";
import { FcGoogle } from "react-icons/fc";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await signIn.email({
        email,
        password,
      });

      if (result.error) {
        const errorMessage = result.error.message || "Failed to sign in";
        setError(errorMessage);
        posthog.capture("sign_in_failed", { error_message: errorMessage });
      } else {
        posthog.identify(result.data?.user?.id ?? email, {
          email,
          name: result.data?.user?.name,
        });
        posthog.capture("user_signed_in", { method: "email" });
        router.push("/");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      posthog.capture("sign_in_failed", { error_message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    posthog.capture("sign_in_started", { method: "google" });
    await signIn.social({ provider: "google", callbackURL: "/" });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 md:max-w-2xl md:px-0 lg:max-w-4xl">
        <main className="flex flex-1 flex-col justify-center">
          <div className="mx-auto w-full max-w-sm">
            <h1 className="text-3xl font-semibold leading-none tracking-tighter md:text-4xl">
              Sign In
            </h1>
            <p className="mt-3.5 text-base leading-snug tracking-tight text-[#61646B] md:text-lg dark:text-[#94979E]">
              Enter your email and password to sign in to your account.
            </p>

            <Button
              type="button"
              variant="outline"
              className="mt-8 w-full"
              onClick={handleGoogleSignIn}
            >
              <FcGoogle className="size-5" />
              Continue with Google
            </Button>

            <div className="mt-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-[#E4E5E7] dark:bg-[#303236]" />
              <span className="text-xs text-[#61646B] dark:text-[#94979E]">
                or
              </span>
              <div className="h-px flex-1 bg-[#E4E5E7] dark:bg-[#303236]" />
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              {error && (
                <div className="rounded-md border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500 dark:text-red-500">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    placeholder="you@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="default"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-[#61646B] dark:text-[#94979E]">
              Don't have an account?{" "}
              <Link
                href="/sign-up"
                className="font-medium text-primary hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
