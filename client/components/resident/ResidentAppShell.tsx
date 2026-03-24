"use client";

import axiosIns from "@/lib/axios";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CreditCard,
  LayoutDashboard,
  LogOut,
  ReceiptIndianRupee,
  UserRound,
} from "lucide-react";

const NAV = [
  {
    href: "/resident/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/resident/subscriptions",
    label: "Subscriptions",
    icon: CreditCard,
  },
  {
    href: "/resident/pay-now",
    label: "Pay Now",
    icon: ReceiptIndianRupee,
  },
  {
    href: "/resident/profile",
    label: "Profile",
    icon: UserRound,
  },
];

export default function ResidentAppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await axiosIns.get("/api/resident/profile");
        if (!cancelled) setReady(true);
      } catch {
        router.replace("/resident/login");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const logout = async () => {
    try {
      await axiosIns.post("/api/auth/logout");
    } catch {
      /* ignore */
    }
    router.push("/resident/login");
  };

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-600">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="sticky top-0 z-40 border-b border-gray-200/80 bg-gray-100/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 pb-5">
          <div className="rounded-3xl bg-slate-900 text-white shadow-sm">
            <div className="flex flex-col gap-4 p-4 sm:p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-[0.22em]">
                    Resident
                  </p>
                  <p className="font-semibold text-lg mt-1">Portal</p>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/70 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800 hover:text-white"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
              </div>

              <nav className="overflow-x-auto pb-1">
                <div className="flex min-w-max gap-2">
          {NAV.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/resident/dashboard" &&
                pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
                </div>
              </nav>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 sm:p-6">{children}</main>
    </div>
  );
}
