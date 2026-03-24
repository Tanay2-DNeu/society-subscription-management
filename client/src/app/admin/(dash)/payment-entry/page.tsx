"use client";

import axiosIns from "@/lib/axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCcw } from "lucide-react";

interface MonthlyRecordRow {
  id: number;
  amount_due: string | number;
  status: string;
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

export default function AdminPaymentsPage() {
  const now = useMemo(() => new Date(), []);
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [search, setSearch] = useState("");
  const [records, setRecords] = useState<MonthlyRecordRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedRecord, setSelectedRecord] = useState<MonthlyRecordRow | null>(
    null,
  );
  const [paymentMode, setPaymentMode] = useState<"cash" | "upi" | "online">(
    "cash",
  );
  const [transactionId, setTransactionId] = useState("");
  const [paying, setPaying] = useState(false);

  const yearOptions = useMemo(() => {
    const y = now.getFullYear();
    const list: number[] = [];
    for (let i = y - 3; i <= y + 2; i++) list.push(i);
    return list;
  }, [now]);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axiosIns.get<MonthlyRecordRow[]>(
        "/api/admin/monthly-records",
        {
          params: { month, year },
        },
      );
      setRecords(res.data || []);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to load payment records");
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const filtered = records.filter((r) =>
    String(r.flat_number).toLowerCase().includes(search.toLowerCase()),
  );

  const pendingCount = filtered.filter(
    (r) => String(r.status).toLowerCase() === "pending",
  ).length;

  const handlePay = async () => {
    if (!selectedRecord) return;

    setPaying(true);
    setError("");
    try {
      const amount = Number(selectedRecord.amount_due);
      await axiosIns.post("/api/admin/payments", {
        monthly_record_id: selectedRecord.id,
        amount,
        payment_mode: paymentMode,
        transaction_id: transactionId.trim() || undefined,
      });

      setRecords((prev) =>
        prev.map((r) =>
          r.id === selectedRecord.id ? { ...r, status: "paid" } : r,
        ),
      );

      setSelectedRecord(null);
      setTransactionId("");
      setPaymentMode("cash");
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to record payment");
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Entry</h1>
      <p className="text-sm text-gray-600 mb-6 max-w-2xl">
        Record offline payments (Cash/UPI/Online).
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
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Search flat
            </label>
            <input
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm min-w-48"
              placeholder="e.g. 101"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={fetchRecords}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium shadow-sm hover:bg-gray-50 disabled:opacity-50 lg:ml-auto"
        >
          <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Pending records in view: <strong>{pendingCount}</strong>
      </p>

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
            {!loading && filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-12 text-center text-gray-500"
                >
                  No pending payments
                </td>
              </tr>
            ) : loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : (
              filtered.map((r) => {
                const paid = String(r.status).toLowerCase() === "paid";
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
                        <span className="text-xs font-medium text-emerald-700">
                          Paid {String.fromCharCode(10003)}
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedRecord(r);
                            setPaymentMode("cash");
                            setTransactionId("");
                          }}
                          className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                        >
                          Pay
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

      {selectedRecord && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Record Payment
            </h2>

            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-gray-600 mb-1">Flat</label>
                <input
                  value={`${selectedRecord.flat_number} (${selectedRecord.block})`}
                  readOnly
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-gray-600 mb-1">Amount</label>
                <input
                  value={formatRupee(selectedRecord.amount_due)}
                  readOnly
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-gray-600 mb-1">Payment mode</label>
                <select
                  value={paymentMode}
                  onChange={(e) =>
                    setPaymentMode(e.target.value as "cash" | "upi" | "online")
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2"
                >
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="online">Online</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-600 mb-1">
                  Transaction ID (optional)
                </label>
                <input
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2"
                  placeholder="Enter reference id"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                onClick={() => setSelectedRecord(null)}
                disabled={paying}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePay}
                disabled={paying}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {paying ? "Saving..." : "Submit payment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
