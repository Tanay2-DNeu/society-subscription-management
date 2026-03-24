"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ShieldCheck, UserRound } from "lucide-react";

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-5xl mx-auto px-4 py-14 sm:py-20">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-10 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-2">
            Welcome
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Society Subscription Management
          </h1>
          <p className="mt-3 text-sm sm:text-base text-gray-600 max-w-2xl">
            Choose your portal to continue. Keep it simple: admins manage
            operations, residents view subscriptions and payments.
          </p>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => router.push("/admin/login")}
              className="rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm hover:bg-gray-50 transition"
            >
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <p className="mt-3 text-lg font-semibold text-gray-900">
                Admin Login
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Dashboard, flats, reports, subscriptions and notifications.
              </p>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-blue-700">
                Continue <ArrowRight className="h-4 w-4" />
              </span>
            </button>

            <button
              onClick={() => router.push("/resident/login")}
              className="rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm hover:bg-gray-50 transition"
            >
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <UserRound className="h-5 w-5" />
              </div>
              <p className="mt-3 text-lg font-semibold text-gray-900">
                Resident Login
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Check dues, pay now, and manage your resident profile.
              </p>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-emerald-700">
                Continue <ArrowRight className="h-4 w-4" />
              </span>
            </button>
          </div>

          <div className="mt-6 text-sm text-gray-500">
            New resident?{" "}
            <Link href="/resident/register" className="font-medium text-blue-700 hover:underline">
              Create an account
            </Link>
            .
          </div>
        </div>
      </div>
    </div>
  );
}
