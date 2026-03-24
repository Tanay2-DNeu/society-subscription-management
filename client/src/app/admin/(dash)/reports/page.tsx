"use client";

import axiosIns from "@/lib/axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

type PaymentModes = {
  cash: number;
  upi: number;
  online: number;
};

type AdminReportsResponse = {
  totalCollection: number;
  paidAmount: number;
  pendingAmount: number;
  paymentModes: PaymentModes;
};

function toNumber(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function formatRupee(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function escapeCsvValue(value: string): string {
  const needsQuotes =
    value.includes(",") || value.includes('"') || value.includes("\n");
  const escaped = value.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}

export default function AdminReportsPage() {
  const now = useMemo(() => new Date(), []);
  const [month, setMonth] = useState<number>(() => now.getMonth() + 1);
  const [year, setYear] = useState<number>(() => now.getFullYear());

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AdminReportsResponse | null>(null);

  const monthOptions = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      value: i + 1,
      label: new Date(2000, i, 1).toLocaleString("en-IN", { month: "long" }),
    }));
  }, []);

  const yearOptions = useMemo(() => {
    const base = now.getFullYear();
    const list: number[] = [];
    for (let y = base - 3; y <= base + 2; y++) list.push(y);
    return list;
  }, [now]);

  const fetchReports = useCallback(async () => {
    const safeMonth = Math.min(12, Math.max(1, month));
    const safeYear = year;

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await axiosIns.get<AdminReportsResponse>("/api/reports", {
        params: { month: safeMonth, year: safeYear },
      });

      setData(res.data ?? null);
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to load reports";
      setError(msg);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const totalCollection = toNumber(data?.totalCollection ?? 0);
  const paidAmount = toNumber(data?.paidAmount ?? 0);
  const pendingAmount = toNumber(data?.pendingAmount ?? 0);
  const cash = toNumber(data?.paymentModes?.cash ?? 0);
  const upi = toNumber(data?.paymentModes?.upi ?? 0);
  const online = toNumber(data?.paymentModes?.online ?? 0);

  const modesTotal = cash + upi + online;
  const hasData =
    totalCollection > 0 ||
    paidAmount > 0 ||
    pendingAmount > 0 ||
    modesTotal > 0;

  const pieData = useMemo(
    () => [
      { name: "Cash", value: cash },
      { name: "UPI", value: upi },
      { name: "Online", value: online },
    ],
    [cash, upi, online],
  );

  const COLORS: Record<string, string> = {
    Cash: "#22c55e",
    UPI: "#3b82f6",
    Online: "#f59e0b",
  };

  const buildCsv = useCallback(() => {
    const header = [
      "Month",
      "Year",
      "Total Collection",
      "Paid Amount",
      "Pending Amount",
      "Cash",
      "UPI",
      "Online",
    ];
    const row = [
      String(month),
      String(year),
      String(totalCollection),
      String(paidAmount),
      String(pendingAmount),
      String(cash),
      String(upi),
      String(online),
    ];
    const csv = `${header.join(",")}\n${row
      .map((v) => escapeCsvValue(v))
      .join(",")}\n`;
    return csv;
  }, [
    month,
    year,
    totalCollection,
    paidAmount,
    pendingAmount,
    cash,
    upi,
    online,
  ]);

  const downloadCsv = useCallback(() => {
    if (!hasData || loading) return;
    const csvString = buildCsv();
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `admin-reports_${year}-${String(month).padStart(2, "0")}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [buildCsv, hasData, loading, month, year]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Admin Reports
          </h1>
          <p className="text-sm text-gray-600">
            Filters refetch data from the backend and update the metrics +
            chart.
          </p>
        </div>

        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Month
            </label>
            <select
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm min-w-40"
              value={month}
              onChange={(e) => {
                const m = toNumber(e.target.value);
                setMonth(Math.min(12, Math.max(1, m)));
              }}
            >
              {monthOptions.map((m) => (
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
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm min-w-32"
              value={year}
              onChange={(e) => setYear(toNumber(e.target.value))}
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={downloadCsv}
            disabled={loading || !hasData}
            className="inline-flex items-center justify-center rounded-lg bg-white border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Download CSV
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {loading && (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6 text-sm text-gray-600">
          Loading report data...
        </div>
      )}

      {!loading && !hasData && !error && (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-8 text-center text-sm text-gray-600">
          No data available
        </div>
      )}

      {!loading && hasData && data && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-gray-500">
                Total Collection
              </p>
              <p className="mt-2 text-center text-2xl font-bold text-gray-900 tabular-nums">
                {formatRupee(totalCollection)}
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-gray-500">Paid Amount</p>
              <p className="mt-2 text-center text-2xl font-bold text-gray-900 tabular-nums">
                {formatRupee(paidAmount)}
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-gray-500">
                Pending Amount
              </p>
              <p className="mt-2 text-center text-2xl font-bold text-gray-900 tabular-nums">
                {formatRupee(pendingAmount)}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-4">
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  Payment Mode Breakdown
                </h2>
                <p className="text-sm text-gray-600">
                  Cash vs UPI vs Online for the selected month/year.
                </p>
              </div>
            </div>

            <div className="h-75 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    formatter={(value) => [
                      formatRupee(toNumber(value)),
                      "Amount",
                    ]}
                  />
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={3}
                    isAnimationActive={false}
                  >
                    {pieData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={COLORS[entry.name] || "#6b7280"}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-600">
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                Cash
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                UPI
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                Online
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
