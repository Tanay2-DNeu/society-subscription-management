"use client";

import axiosIns from "@/lib/axios";
import { Bell, Send } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type TargetType = "all" | "user" | "pending_dues";

interface ResidentOption {
  id: number;
  name: string;
  email: string;
  status: string;
}

interface NotificationRow {
  id: number;
  title: string;
  message: string;
  created_at: string;
}

export default function NotificationsPage() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetType, setTargetType] = useState<TargetType>("all");
  const [userId, setUserId] = useState<number | "">("");
  const [residents, setResidents] = useState<ResidentOption[]>([]);
  const [history, setHistory] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    setError(null);
    try {
      const res = await axiosIns.get<NotificationRow[]>(
        "/api/admin/notifications",
      );
      setHistory(res.data || []);
    } catch {
      setError("Could not load notification history.");
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  useEffect(() => {
    if (targetType !== "user") return;
    let cancelled = false;
    (async () => {
      setLoadingUsers(true);
      try {
        const res = await axiosIns.get<ResidentOption[]>("/api/admin/users");
        if (!cancelled) setResidents(res.data || []);
      } catch {
        if (!cancelled) setResidents([]);
      } finally {
        if (!cancelled) setLoadingUsers(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [targetType]);

  const handleSend = async () => {
    const t = title.trim();
    const m = message.trim();
    if (!t || !m) {
      setError("Please enter title and message.");
      return;
    }
    if (targetType === "user" && (userId === "" || !userId)) {
      setError("Please select a resident.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const body: Record<string, unknown> = {
        title: t,
        message: m,
        targetType,
      };
      if (targetType === "user") body.userId = Number(userId);

      const res = await axiosIns.post<{
        success: boolean;
        sentTo: number;
      }>("/api/admin/notifications/send", body);

      setSuccess(`Notification sent to ${res.data.sentTo} user(s).`);
      setTitle("");
      setMessage("");
      setUserId("");
      await fetchHistory();
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to send notification.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div>
        <div className="flex items-center gap-2 text-indigo-600 mb-1">
          <Bell className="h-6 w-6" />
          <span className="text-sm font-semibold uppercase tracking-wide">
            Reminders
          </span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <p className="text-sm text-gray-600 mt-1 max-w-2xl">
          Send targeted or mass notifications on the go.
        </p>
      </div>

      <section className="rounded-2xl bg-white shadow-sm p-5 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Send notification
        </h2>

        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Maintenance reminder"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Message body..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target
            </label>
            <select
              className="w-full max-w-md rounded-lg border border-gray-300 px-3 py-2 text-gray-900 shadow-sm"
              value={targetType}
              onChange={(e) => setTargetType(e.target.value as TargetType)}
            >
              <option value="all">All residents</option>
              <option value="user">Specific resident</option>
              <option value="pending_dues">Residents with pending dues</option>
            </select>
          </div>

          {targetType === "user" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Resident
              </label>
              {loadingUsers ? (
                <p className="text-sm text-gray-500">Loading users...</p>
              ) : (
                <select
                  className="w-full max-w-md rounded-lg border border-gray-300 px-3 py-2 text-gray-900 shadow-sm"
                  value={userId}
                  onChange={(e) =>
                    setUserId(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                >
                  <option value="">Select Resident</option>
                  {residents.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email}) — {u.status}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {success && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
              {success}
            </div>
          )}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {error}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSend}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              {loading ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-2xl bg-white shadow-sm p-5 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Notification history
        </h2>

        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 font-semibold text-gray-700">Title</th>
                <th className="px-4 py-3 font-semibold text-gray-700">
                  Message
                </th>
                <th className="px-4 py-3 font-semibold text-gray-700">Date</th>
              </tr>
            </thead>
            <tbody>
              {loadingHistory ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    Loading...
                  </td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No notifications yet.
                  </td>
                </tr>
              ) : (
                history.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-gray-100 hover:bg-gray-50/80 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900 max-w-35 truncate">
                      {row.title}
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-md truncate">
                      {row.message}
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {row.created_at
                        ? new Date(row.created_at).toLocaleString()
                        : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
