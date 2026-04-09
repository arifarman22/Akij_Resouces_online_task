"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { useEmployerStore } from "@/store/useEmployerStore";
import { useAuth } from "@/hooks";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

export default function EmployerLogin() {
  const router = useRouter();
  const { login: storeLogin } = useEmployerStore();
  const { login, loading, error } = useAuth("employer");

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    const res = await login(values.email, values.password);
    if (res.success && res.user && res.accessToken) {
      storeLogin(res.user, res.accessToken);
      router.push("/employer/dashboard");
    }
  }

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-10rem)] px-4">
      <Card className="w-full max-w-[571px] shadow-xl border-slate-100 dark:border-slate-800 py-8 px-6 sm:px-10">
        <CardHeader className="text-center p-0 mb-6">
          <CardTitle className="text-3xl tracking-tight" style={{ fontWeight: 600 }}>Employer Sign In</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {error && (
            <div className="mb-4 p-3 rounded-md bg-red-50 text-red-700 text-sm" style={{ fontWeight: 600 }}>{error}</div>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
              <FormField control={form.control} name="email" render={({ field }) => (
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
              <FormField control={form.control} name="password" render={({ field }) => (
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
        </CardContent>
        <CardFooter className="flex flex-col p-0 mt-6">
          <div className="text-center text-sm text-slate-500" style={{ fontWeight: 600 }}>
            Built-in: admin@akijresource.com / Admin@123456
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
