"use client";

import { useState } from "react";
import axiosIns from "@/lib/axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ResidentRegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const submit = async () => {
    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const phone = form.phone.trim();
    const password = form.password;

    if (!name || !email || !password) {
      setError("Name, email and password are required.");
      return;
    }
    if (name.length < 2 || name.length > 80) {
      setError("Name must be between 2 and 80 characters.");
      return;
    }
    if (!/^[a-zA-Z\s.'-]+$/.test(name)) {
      setError("Name contains invalid characters.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    if (phone && !/^[0-9]{10,15}$/.test(phone)) {
      setError("Phone must be 10-15 digits.");
      return;
    }
    if (password.length < 4 || password.length > 18) {
      setError("Password must be between 4 and 18 characters.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await axiosIns.post("/api/auth/register", {
        name,
        email,
        phone,
        password,
      });
      setDone(true);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Registration failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
        <div className="rounded-2xl bg-white p-8 shadow-sm max-w-md w-full text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Registration submitted
          </h1>
          <p className="text-gray-600 mb-6">
            Wait for admin approval before you can log in.
          </p>
          <button
            type="button"
            onClick={() => router.push("/resident/login")}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white text-sm font-medium hover:bg-blue-700"
          >
            Back to login
          </button>
        </div>
      </div>
    );
  }

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
          Resident sign up
        </h1>

        {error && (
          <p className="text-sm text-red-600 text-center bg-red-50 rounded-lg py-2 px-3">
            {error}
          </p>
        )}

        <input
          type="text"
          placeholder="Full name"
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="tel"
          placeholder="Phone"
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button
          type="button"
          onClick={submit}
          disabled={loading}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Submitting…" : "Register"}
        </button>

        <p className="text-sm text-center text-gray-600">
          Already have an account?{" "}
          <button
            type="button"
            className="text-blue-600 font-medium"
            onClick={() => router.push("/resident/login")}
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}
