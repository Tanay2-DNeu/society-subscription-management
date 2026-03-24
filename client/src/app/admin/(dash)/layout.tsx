"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import axiosIns from "@/lib/axios";
import {
  Bell,
  Building2,
  Calendar,
  CreditCard,
  LayoutDashboard,
  ReceiptIndianRupee,
  UserRound,
} from "lucide-react";

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/flats", label: "Flats", icon: Building2 },
  { href: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard },
  { href: "/admin/monthly-records", label: "Monthly Records", icon: Calendar },
  { href: "/admin/payment-entry", label: "Payment Entry", icon: ReceiptIndianRupee },
  { href: "/admin/reports", label: "Reports", icon: ReceiptIndianRupee },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
  { href: "/admin/profile", label: "Profile", icon: UserRound },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await axiosIns.get("/api/admin/dashboard"); // using existing route
        setIsAuth(true);
      } catch {
        router.replace("/admin/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (loading) return <p className="p-6">Checking auth...</p>;

  if (!isAuth) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="sticky top-0 z-40 border-b border-gray-200/80 bg-gray-100/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 pb-5">
          <div className="rounded-3xl bg-slate-900 text-white shadow-sm">
            <div className="flex flex-col gap-4 p-4 sm:p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-[0.22em]">
                    Admin
                  </p>
                  <p className="font-semibold text-lg mt-1">Portal</p>
                </div>
              </div>

              <nav className="overflow-x-auto pb-1">
                <div className="flex min-w-max gap-2">
                  {NAV.map((item) => {
                    const Icon = item.icon;
                    const active =
                      pathname === item.href ||
                      (item.href !== "/admin/dashboard" &&
                        pathname.startsWith(item.href));
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
