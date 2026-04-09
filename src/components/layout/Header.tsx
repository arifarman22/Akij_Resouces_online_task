"use client";

import Image from "next/image";
import Link from "next/link";
import { LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  heading?: string;
  profile?: {
    name: string;
    refId: string;
  };
  onLogout?: () => void;
}

export default function Header({ heading, profile, onLogout }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-indigo-100 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Left: Logo + Heading */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex-shrink-0 flex items-center transition-transform hover:scale-105 duration-300">
              <Image
                src="/images/resource_logo.png"
                alt="Akij Resource Logo"
                width={160}
                height={50}
                className="object-contain"
                priority
              />
            </Link>
            {heading && (
              <>
                <div className="hidden sm:block h-8 w-px bg-slate-200 dark:bg-slate-700" />
                <h1 className="hidden sm:block text-lg md:text-xl font-semibold text-slate-700 dark:text-slate-200">
                  {heading}
                </h1>
              </>
            )}
          </div>

          {/* Center: Akij Resources (only when no heading/profile) */}
          {!heading && !profile && (
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">
              Akij Resources
            </h1>
          )}

          {/* Right: Profile or spacer */}
          {profile ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-3 cursor-pointer outline-none">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-slate-800 dark:text-white leading-tight">{profile.name}</p>
                  <p className="text-xs text-slate-500">Ref: {profile.refId}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-[#6633FF] text-white flex items-center justify-center font-bold text-sm uppercase">
                  {profile.name.charAt(0)}
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={8}>
                <DropdownMenuGroup>
                  <DropdownMenuLabel>{profile.name}</DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                {onLogout && (
                  <DropdownMenuItem variant="destructive" onClick={onLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : !heading ? (
            <div className="w-[160px] hidden sm:block" />
          ) : null}
        </div>
      </div>
    </header>
  );
}
