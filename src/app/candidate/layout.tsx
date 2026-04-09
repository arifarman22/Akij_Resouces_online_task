"use client";

import { useRouter, usePathname } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useCandidateStore } from "@/store/useCandidateStore";
import { authApi } from "@/lib/api/client";

export default function CandidateLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, logout } = useCandidateStore();
  const router = useRouter();
  const pathname = usePathname();
  const isAuthPage = pathname === "/candidate/login" || pathname === "/candidate/register";

  const handleLogout = () => {
    authApi.logout();
    logout();
    router.push("/candidate/login");
  };

  return (
    <>
      <Header
        heading={isAuthPage ? undefined : "Candidate Dashboard"}
        profile={!isAuthPage && currentUser ? {
          name: currentUser.name,
          refId: currentUser.email.split("@")[0].toUpperCase() + "-" + currentUser.id?.slice(-6).toUpperCase(),
        } : undefined}
        onLogout={!isAuthPage && currentUser ? handleLogout : undefined}
      />
      <div className="flex-1 bg-slate-50 dark:bg-slate-950 flex flex-col">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </div>
      <Footer />
    </>
  );
}
