"use client";

import { useState } from "react";
import axiosIns from "@/lib/axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ResidentLoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      await axiosIns.post("/api/auth/login", form);
      router.push("/resident/dashboard");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Login failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="rounded-2xl bg-white p-8 shadow-sm w-full max-w-md flex flex-col gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <h1 className="text-xl font-semibold text-gray-900 text-center">
          Resident login
        </h1>

        {error && (
          <p className="text-sm text-red-600 text-center bg-red-50 rounded-lg py-2 px-3">
            {error}
          </p>
        )}

        <input
          type="email"
          placeholder="Email"
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          autoComplete="email"
        />

        <input
          type="password"
          placeholder="Password"
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          autoComplete="current-password"
        />

        <button
          type="button"
          onClick={handleLogin}
          disabled={loading}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Logging in…" : "Login"}
        </button>

        <p className="text-sm text-center text-gray-600">
          Don&apos;t have an account?{" "}
          <button
            type="button"
            className="text-blue-600 font-medium"
            onClick={() => router.push("/resident/register")}
          >
            Register
          </button>
        </p>
      </div>
    </div>
  );
}
