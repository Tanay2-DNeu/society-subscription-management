"use client";

import axiosIns from "@/lib/axios";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AdminProfile {
  id: number;
  name: string;
  email: string;
  phone: string | null;
}

export default function AdminProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const res = await axiosIns.get<AdminProfile>("/api/admin/profile");
      setProfile(res.data);
      setName(res.data.name ?? "");
      setPhone(res.data.phone ?? "");
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 401) router.replace("/admin/login");
      else setError("Could not load profile");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    if (!profile) return;
    setSaving(true);
    setError("");
    setSuccess("");

    const body: { name?: string; phone?: string; password?: string } = {};
    const nextName = name.trim();
    const nextPhone = phone.trim();
    const prevName = (profile.name ?? "").trim();
    const prevPhone = (profile.phone ?? "").trim();

    if (nextName !== prevName) body.name = nextName;
    if (nextPhone !== prevPhone) body.phone = nextPhone;
    if (password.trim()) body.password = password.trim();

    if (Object.keys(body).length === 0) {
      setError("Change name/phone or enter a new password to update.");
      setSaving(false);
      return;
    }

    if (body.name !== undefined && body.name.length < 2) {
      setError("Name must be at least 2 characters.");
      setSaving(false);
      return;
    }

    if (body.phone !== undefined && !/^[0-9]{10,15}$/.test(body.phone)) {
      setError("Phone must be 10-15 digits.");
      setSaving(false);
      return;
    }

    if (body.password !== undefined && body.password.length < 6) {
      setError("Password must be at least 6 characters.");
      setSaving(false);
      return;
    }

    try {
      await axiosIns.patch("/api/admin/profile", body);
      setSuccess("Profile updated.");
      setPassword("");
      await load();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Update failed";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !profile) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Profile</h1>
        <p className="text-gray-600">{error || "Loading..."}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-md">
      <h1 className="text-2xl font-bold text-gray-900">Admin Profile</h1>

      <div className="rounded-2xl bg-white p-5 shadow-sm flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <p className="text-xs text-gray-500 uppercase">Email</p>
          <p className="font-medium text-gray-900">{profile.email}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input
            type="tel"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="10-15 digit phone"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            New password <span className="text-gray-400">(optional)</span>
          </label>
          <input
            type="password"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Leave blank to keep current"
            autoComplete="new-password"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}
        {success && (
          <p className="text-sm text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">
            {success}
          </p>
        )}

        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 w-fit"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </div>
    </div>
  );
}

