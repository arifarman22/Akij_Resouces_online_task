"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { useCandidateStore } from "@/store/useCandidateStore";
import { useAuth } from "@/hooks";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

export default function CandidateLogin() {
  const router = useRouter();
  const { login: storeLogin } = useCandidateStore();
  const { login, register, loading, error, clearError } = useAuth("candidate");
  const [isRegister, setIsRegister] = useState(false);

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const toggleMode = () => {
    clearError();
    loginForm.reset();
    registerForm.reset();
    setIsRegister((prev) => !prev);
  };

  async function onLogin(values: z.infer<typeof loginSchema>) {
    const res = await login(values.email, values.password);
    if (res.success && res.user && res.accessToken) {
      storeLogin(res.user, res.accessToken);
      router.push("/candidate/dashboard");
    }
  }

  async function onRegister(values: z.infer<typeof registerSchema>) {
    const res = await register(values.email, values.password, values.name);
    if (res.success && res.user && res.accessToken) {
      storeLogin(res.user, res.accessToken);
      router.push("/candidate/dashboard");
    }
  }

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-10rem)] px-4">
      <Card className="w-full max-w-[571px] shadow-xl border-slate-100 dark:border-slate-800 py-8 px-6 sm:px-10">
        <CardHeader className="text-center p-0 mb-6">
          <CardTitle className="text-3xl tracking-tight" style={{ fontWeight: 600 }}>
            {isRegister ? "Candidate Sign Up" : "Candidate Sign In"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {error && (
            <div className="mb-4 p-3 rounded-md bg-red-50 text-red-700 text-sm" style={{ fontWeight: 600 }}>{error}</div>
          )}

          {isRegister ? (
            <Form {...registerForm}>
              <form onSubmit={registerForm.handleSubmit(onRegister)} className="flex flex-col gap-6">
                <FormField control={registerForm.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{ fontWeight: 600 }}>Full Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your full name"
                        className="w-full h-12 rounded-lg border px-3 placeholder:text-slate-300 placeholder:font-normal"
                        style={{ fontWeight: 600 }}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={registerForm.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{ fontWeight: 600 }}>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Your Primary Email Address"
                        className="w-full h-12 rounded-lg border px-3 placeholder:text-slate-300 placeholder:font-normal"
                        style={{ fontWeight: 600 }}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={registerForm.control} name="password" render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{ fontWeight: 600 }}>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Create a password (min 6 chars)"
                        className="w-full h-12 rounded-lg border px-3 placeholder:text-slate-300 placeholder:font-normal"
                        style={{ fontWeight: 600 }}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-xl text-white hover:opacity-90 transition-opacity"
                  style={{ background: "#6633FF", fontWeight: 600 }}
                >
                  {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account...</> : "Create Account"}
                </Button>
              </form>
            </Form>
          ) : (
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLogin)} className="flex flex-col gap-6">
                <FormField control={loginForm.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{ fontWeight: 600 }}>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Your Primary Email Address"
                        className="w-full h-12 rounded-lg border px-3 placeholder:text-slate-300 placeholder:font-normal"
                        style={{ fontWeight: 600 }}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={loginForm.control} name="password" render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{ fontWeight: 600 }}>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        className="w-full h-12 rounded-lg border px-3 placeholder:text-slate-300 placeholder:font-normal"
                        style={{ fontWeight: 600 }}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-xl text-white hover:opacity-90 transition-opacity"
                  style={{ background: "#6633FF", fontWeight: 600 }}
                >
                  {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...</> : "Sign In"}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
        <CardFooter className="flex flex-col p-0 mt-6">
          <button
            type="button"
            onClick={toggleMode}
            className="text-sm text-[#6633FF] hover:underline"
            style={{ fontWeight: 600 }}
          >
            {isRegister ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
          </button>
        </CardFooter>
      </Card>
    </div>
  );
}
