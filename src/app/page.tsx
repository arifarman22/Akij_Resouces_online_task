"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const [splashFading, setSplashFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setSplashFading(true), 2000);
    const hideTimer = setTimeout(() => setShowSplash(false), 2600);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  // Splash screen
  if (showSplash) {
    return (
      <div
        className={`fixed inset-0 z-[200] bg-white dark:bg-slate-950 flex flex-col items-center justify-center transition-opacity duration-500 ${
          splashFading ? "opacity-0" : "opacity-100"
        }`}
      >
        {/* Logo */}
        <div className="animate-splashLogo">
          <Image
            src="/images/resource_logo.png"
            alt="Akij Resource Logo"
            width={280}
            height={88}
            className="object-contain"
            priority
          />
        </div>

        {/* Tagline */}
        <p className="mt-4 text-sm font-medium text-slate-400 tracking-widest uppercase animate-splashText">
          Online Assessment Platform
        </p>

        {/* Loading bar */}
        <div className="mt-8 w-48 h-1 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div className="h-full rounded-full bg-[#6633FF] animate-splashBar" />
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="flex-1 flex flex-col items-center justify-center p-8 py-20 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-900 dark:via-black dark:to-slate-800 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-[#6633FF]/[0.03] blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-purple-500/[0.04] blur-3xl pointer-events-none" />

        <main className="flex flex-col items-center gap-12 max-w-4xl w-full relative z-10 animate-fadeUp-home">
          {/* Logo */}
          <div className="mb-2">
            <Image
              src="/images/resource_logo.png"
              alt="Akij Resource Logo"
              width={200}
              height={63}
              className="object-contain"
              priority
            />
          </div>

          {/* Heading */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Welcome to{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6633FF] to-purple-500">
                EduAssess Platform
              </span>
            </h1>
            <p className="text-base text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
              The next-generation online assessment platform. Choose your portal below to get started.
            </p>
          </div>

          {/* Portal cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
            {/* Employer */}
            <Link href="/employer/login" className="group">
              <div className="h-full flex flex-col items-center p-8 bg-white dark:bg-slate-900 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-200 dark:border-slate-800 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#6633FF]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative h-16 w-16 bg-indigo-50 dark:bg-indigo-900/30 text-[#6633FF] rounded-2xl flex items-center justify-center mb-5 ring-1 ring-indigo-100 dark:ring-indigo-800 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h2 className="relative text-xl font-bold text-slate-800 dark:text-white mb-2">Employer Portal</h2>
                <p className="relative text-sm text-slate-500 text-center leading-relaxed">
                  Create assessments and track candidate performance.
                </p>
                <div className="relative mt-5 flex items-center gap-1.5 text-xs font-semibold text-[#6633FF] group-hover:gap-2.5 transition-all duration-300">
                  Get Started
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>

            {/* Candidate */}
            <Link href="/candidate/login" className="group">
              <div className="h-full flex flex-col items-center p-8 bg-white dark:bg-slate-900 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-200 dark:border-slate-800 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative h-16 w-16 bg-purple-50 dark:bg-purple-900/30 text-purple-600 rounded-2xl flex items-center justify-center mb-5 ring-1 ring-purple-100 dark:ring-purple-800 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14v6.055" />
                  </svg>
                </div>
                <h2 className="relative text-xl font-bold text-slate-800 dark:text-white mb-2">Candidate Portal</h2>
                <p className="relative text-sm text-slate-500 text-center leading-relaxed">
                  Access your exams and complete them in a timed environment.
                </p>
                <div className="relative mt-5 flex items-center gap-1.5 text-xs font-semibold text-purple-600 group-hover:gap-2.5 transition-all duration-300">
                  Get Started
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          </div>

        </main>
      </div>
      <Footer />
    </>
  );
}
