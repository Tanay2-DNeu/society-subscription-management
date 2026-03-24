"use client";

import axiosIns from "@/lib/axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCcw, Sparkles } from "lucide-react";

interface MonthlyRecordRow {
  id: number;
  flat_id: number;
  plan_id: number;
  month: number;
  year: number;
  amount_due: string | number;
  status: string;
  created_at?: string;
  has_payment?: boolean;
  flat_number: string;
  block: string;
}

const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

function formatRupee(amount: string | number) {
  const n = typeof amount === "string" ? parseFloat(amount) : amount;
  if (Number.isNaN(n)) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function MonthlyRecordsPage() {
  const now = useMemo(() => new Date(), []);
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [records, setRecords] = useState<MonthlyRecordRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [generateMessage, setGenerateMessage] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const yearOptions = useMemo(() => {
    const y = now.getFullYear();
    const list: number[] = [];
    for (let i = y - 3; i <= y + 2; i++) list.push(i);
    return list;
  }, [now]);

  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const isFuturePeriod =
    year > currentYear || (year === currentYear && month > currentMonth);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError("");
    setGenerateMessage("");
    try {
      const res = await axiosIns.get<MonthlyRecordRow[]>(
        "/api/admin/monthly-records",
        { params: { month, year } },
      );
      setRecords(res.data || []);
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to load monthly records";
      setError(msg);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const hasRecords = records.length > 0;

  const handleGenerate = async () => {
    if (isFuturePeriod) {
      setGenerateMessage("");
      setError(
        "Future months cannot be generated. Select the current month or a past month.",
      );
      return;
    }
    if (hasRecords) return;
    setGenerating(true);
    setError("");
    setGenerateMessage("");
    try {
      const res = await axiosIns.post<{
        message: string;
        inserted: number;
      }>("/api/admin/monthly-records/generate", { month, year });
      setGenerateMessage(
        res.data.inserted > 0
          ? `Generated ${res.data.inserted} record(s).`
          : "No new rows inserted (all flats already had records for this month).",
      );
      await fetchRecords();
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Generation failed";
      setError(msg);
    } finally {
      setGenerating(false);
    }
  };

  const patchStatus = async (id: number, action: "pay" | "unpay") => {
    setActionLoadingId(id);
    setError("");
    try {
      const path =
        action === "pay"
          ? `/api/admin/monthly-records/${id}/pay`
          : `/api/admin/monthly-records/${id}/unpay`;
      const res = await axiosIns.patch<MonthlyRecordRow>(path);
      setRecords((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: res.data.status } : r)),
      );
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Update failed";
      setError(msg);
    } finally {
      setActionLoadingId(null);
    }
  };

  const statusNorm = (s: string) => s?.toLowerCase?.() || "";

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Monthly Records</h1>
      <p className="text-sm text-gray-600 mb-6 max-w-2xl">
        Generate records{" "}
        <code className="text-xs bg-gray-200 px-1 rounded">
          for this month.
        </code>
        <strong> Status</strong> can be manually marked paid.
      </p>

      <div className="flex flex-col lg:flex-row lg:flex-wrap lg:items-end gap-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Month
            </label>
            <select
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm min-w-40"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
            >
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Year
            </label>
            <select
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm min-w-30"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 lg:ml-auto">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={hasRecords || generating || loading || isFuturePeriod}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles size={16} />
            {generating ? "Generating…" : "Generate records"}
          </button>
          <button
            type="button"
            onClick={() => fetchRecords()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium shadow-sm hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {isFuturePeriod && !hasRecords && (
          <p className="text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-4 py-2 mb-4">
            You cannot generate records for future months. Choose the current
            month or a past month.
          </p>
        )}
      </div>

      {hasRecords && (
        <p className="text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-4 py-2 mb-4">
          Records already generated for this month. Use <strong>Refresh</strong>{" "}
          to reload.
        </p>
      )}

      {generateMessage && (
        <p className="text-sm text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-2 mb-4">
          {generateMessage}
        </p>
      )}

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-700">
              <th className="px-4 py-3 font-semibold text-left">Flat</th>
              <th className="px-4 py-3 font-semibold text-center">Block</th>
              <th className="px-4 py-3 font-semibold text-center">Amount</th>
              <th className="px-4 py-3 font-semibold text-center">Status</th>
              <th className="px-4 py-3 font-semibold text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {!loading && records.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-12 text-center text-gray-500"
                >
                  No records generated for this month.
                </td>
              </tr>
            ) : loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  Loading…
                </td>
              </tr>
            ) : (
              records.map((r) => {
                const paid = statusNorm(r.status) === "paid";
                const busy = actionLoadingId === r.id;
                const canMarkUnpaid = paid && !r.has_payment;
                return (
                  <tr
                    key={r.id}
                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50/90 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900 text-left">
                      {r.flat_number}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-800">
                      {r.block}
                    </td>
                    <td className="px-4 py-3 text-center tabular-nums text-gray-900">
                      {formatRupee(r.amount_due)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {paid ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-900">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {paid ? (
                        canMarkUnpaid ? (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => patchStatus(r.id, "unpay")}
                            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-50"
                          >
                            {busy ? "…" : "Mark unpaid"}
                          </button>
                        ) : (
                          <span className="inline-flex rounded-lg border border-gray-200 bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-500">
                            Payment recorded
                          </span>
                        )
                      ) : (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => patchStatus(r.id, "pay")}
                          className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                          {busy ? "…" : "Mark paid"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
