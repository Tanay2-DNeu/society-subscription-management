"use client";

import axiosIns from "@/lib/axios";
import { formatDateTime, formatMoney, MONTHS } from "@/lib/residentUi";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CreditCard, Home, Wallet } from "lucide-react";

interface FlatRow {
  id: number;
  flat_number: string;
  block: string;
  floor?: string;
  flattype?: string;
}

interface MonthlyRecordRow {
  id: number;
  month: number;
  year: number;
  amount_due: string | number;
  status: string;
}

interface PaymentRow {
  id: number;
  month: number;
  year: number;
  amount: string | number;
  status: string;
}

interface NotifRow {
  id: number;
  title: string;
  message: string;
  sent_at: string | null;
}

interface DashboardPayload {
  hasFlat: boolean;
  flat: FlatRow | null;
  currentRecord: MonthlyRecordRow | null;
  paymentHistory: PaymentRow[];
  notifications: NotifRow[];
}

export default function ResidentDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [error, setError] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);

  const load = useCallback(async () => {
    setError("");
    try {
      const res = await axiosIns.get<DashboardPayload>(
        "/api/resident/dashboard",
      );
      setData(res.data);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response
        ?.status;
      if (status === 401) {
        router.replace("/resident/login");
        return;
      }
      setError("Could not load dashboard");
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  if (error || !data) {
    return (
      <div className="flex flex-col gap-6">
        <p className="text-red-600">{error || "Loading…"}</p>
      </div>
    );
  }

  const now = new Date();
  const labelMonth =
    MONTHS[(data.currentRecord?.month ?? now.getMonth() + 1) - 1];
  const labelYear = data.currentRecord?.year ?? now.getFullYear();
  const recentNotifications = data.notifications.slice(0, 2);

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-600 mt-1">
              Your flat, current dues, payments, and society updates in one
              place.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowNotifications(true)}
            className="relative inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-700 shadow-sm hover:bg-gray-50"
            aria-label="Open notifications"
          >
            <Bell className="h-5 w-5" />
            {data.notifications.length > 0 && (
              <>
                <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-red-500" />
                <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  {data.notifications.length > 9
                    ? "9+"
                    : data.notifications.length}
                </span>
              </>
            )}
          </button>
        </div>

        {!data.hasFlat || !data.flat ? (
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-gray-700">
              You are not assigned to any flat yet.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="rounded-2xl bg-white p-5 shadow-sm lg:col-span-1">
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                    <Home className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-medium text-gray-500 mb-1">
                      Your flat
                    </h2>
                    <p className="text-lg font-semibold text-gray-900">
                      {data.flat.block} — {data.flat.flat_number}
                    </p>
                    <p className="text-sm text-gray-500 mt-1 capitalize">
                      {data.flat.flattype
                        ? data.flat.flattype
                        : "Flat assigned"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-white p-5 shadow-sm lg:col-span-2">
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-amber-50 p-3 text-amber-700">
                    <Wallet className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                      Current status
                    </h2>
                    {!data.currentRecord ? (
                      <p className="text-gray-600 text-sm">
                        No monthly record for {MONTHS[now.getMonth()]}{" "}
                        {now.getFullYear()} yet. Dues may not have been
                        generated.
                      </p>
                    ) : (
                      <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                        <div>
                          <dt className="text-gray-500">Month</dt>
                          <dd className="font-medium text-gray-900">
                            {labelMonth} {labelYear}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-gray-500">Amount due</dt>
                          <dd className="font-medium text-gray-900 tabular-nums">
                            {formatMoney(data.currentRecord.amount_due)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-gray-500">Status</dt>
                          <dd className="mt-1">
                            <StatusBadge status={data.currentRecord.status} />
                          </dd>
                        </div>
                      </dl>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_0.9fr] gap-6">
              <div className="rounded-2xl bg-white p-5 shadow-sm overflow-x-auto">
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                      Payment history
                    </h2>
                    {data.paymentHistory.length === 0 ? (
                      <p className="text-gray-600 text-sm">No payments yet.</p>
                    ) : (
                      <table className="w-full text-sm text-left">
                        <thead>
                          <tr className="border-b border-gray-200 text-gray-500">
                            <th className="py-2 pr-4">Month</th>
                            <th className="py-2 pr-4">Amount</th>
                            <th className="py-2">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.paymentHistory.map((p) => (
                            <tr
                              key={p.id}
                              className="border-b border-gray-100 last:border-0"
                            >
                              <td className="py-2 pr-4">
                                {MONTHS[p.month - 1]} {p.year}
                              </td>
                              <td className="py-2 pr-4 tabular-nums">
                                {formatMoney(p.amount)}
                              </td>
                              <td className="py-2 capitalize">{p.status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Recent notifications
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Society updates and reminders.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowNotifications(true)}
                    className="text-sm font-medium text-blue-600 hover:underline"
                  >
                    View all
                  </button>
                </div>

                {recentNotifications.length === 0 ? (
                  <p className="text-gray-600 text-sm">No notifications yet.</p>
                ) : (
                  <ul className="flex flex-col gap-4">
                    {recentNotifications.map((n) => (
                      <li
                        key={n.id}
                        className="rounded-2xl border border-gray-100 bg-gray-50/70 px-4 py-3"
                      >
                        <p className="font-medium text-gray-900">{n.title}</p>
                        <p className="text-gray-700 text-sm mt-1">
                          {n.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {formatDateTime(n.sent_at)}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {showNotifications && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="resident-notifications-title"
        >
          <div className="w-full max-w-2xl rounded-3xl bg-white shadow-xl border border-gray-200 overflow-hidden">
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-4">
              <div>
                <h2
                  id="resident-notifications-title"
                  className="text-lg font-semibold text-gray-900"
                >
                  Notifications
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  All recent reminders and society updates.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowNotifications(false)}
                className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto px-5 py-4">
              {data.notifications.length === 0 ? (
                <p className="text-sm text-gray-600">No notifications yet.</p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {data.notifications.map((n) => (
                    <li
                      key={n.id}
                      className="rounded-2xl border border-gray-100 bg-gray-50/70 px-4 py-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 rounded-2xl bg-slate-100 p-2 text-slate-700">
                          <Bell className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900">{n.title}</p>
                          <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                            {n.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            {formatDateTime(n.sent_at)}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function StatusBadge({ status }: { status: string }) {
  const s = String(status).toLowerCase();
  const paid = s === "paid";
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
        paid ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900"
      }`}
    >
      {paid ? "Paid" : "Pending"}
    </span>
  );
}
