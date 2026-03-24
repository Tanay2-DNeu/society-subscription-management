"use client";

import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
      <div className="bg-white p-8 rounded-2xl shadow-sm w-full max-w-md border border-gray-200 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-5"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div className="mx-auto mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Admin Login</h1>
        <p className="text-sm text-gray-600 mb-6">
          Continue with your authorized Google account.
        </p>

        <button
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium"
          onClick={() => {
            window.location.href = "http://localhost:8000/api/auth/google";
          }}
        >
          Login with Google
        </button>
      </div>
    </div>
  );
}
