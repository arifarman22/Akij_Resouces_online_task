"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useCandidateStore } from "@/store/useCandidateStore";
import { authApi } from "@/lib/api/client";

export default function CandidateRegister() {
  const router = useRouter();
  const { login: storeLogin } = useCandidateStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.register(email, password, name);
      if (res.success) {
        storeLogin(res.user, res.accessToken);
        router.push("/candidate/dashboard");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const passwordValid = password.length >= 6;
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-10rem)] px-4 py-8">
      <Card className="w-full max-w-[480px] shadow-xl border-slate-100 dark:border-slate-800 py-8 px-6 sm:px-10">
        <CardHeader className="text-center p-0 mb-2">
          <CardTitle className="text-2xl tracking-tight font-semibold">Create Account</CardTitle>
          <p className="text-sm text-slate-500 mt-1">Register as a candidate to take assessments</p>
        </CardHeader>

        <CardContent className="p-0 mt-6">
          {error && (
            <div className="mb-5 flex items-start gap-2.5 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 rounded-lg"
                autoComplete="name"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 rounded-lg"
                autoComplete="email"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 rounded-lg"
                autoComplete="new-password"
              />
              {password.length > 0 && (
                <div className={`flex items-center gap-1.5 text-xs mt-1 ${passwordValid ? "text-emerald-600" : "text-slate-400"}`}>
                  <CheckCircle2 className="h-3 w-3" />
                  <span>At least 6 characters</span>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-11 rounded-lg"
                autoComplete="new-password"
              />
              {confirmPassword.length > 0 && (
                <div className={`flex items-center gap-1.5 text-xs mt-1 ${passwordsMatch ? "text-emerald-600" : "text-red-500"}`}>
                  <CheckCircle2 className="h-3 w-3" />
                  <span>{passwordsMatch ? "Passwords match" : "Passwords do not match"}</span>
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl text-white hover:opacity-90 transition-opacity mt-1"
              style={{ background: "#6633FF" }}
            >
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account...</> : "Create Account"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col p-0 mt-6">
          <p className="text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/candidate/login" className="text-[#6633FF] font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
