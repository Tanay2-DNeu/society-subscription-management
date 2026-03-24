"use client";

import axiosIns from "@/lib/axios";
import Link from "next/link";
import {
  Building2,
  Calendar,
  ChevronRight,
  Clock,
  CreditCard,
  IndianRupee,
  LayoutDashboard,
  RefreshCw,
  Users,
  Wallet,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface MonthlyRevenuePoint {
  month: number;
  year: number;
  revenue: number;
}

/** GET /api/admin/dashboard — simplified stats */
export interface DashboardApiResponse {
  flats: string | number;
  residents: string | number;
  pendingPayments: string | number;
  paidMonthlyRecords: string | number;
  totalCollection: string | number | null;
  monthlyRevenue: MonthlyRevenuePoint[];
}

const PIE_COLORS = { paid: "#22c55e", pending: "#eab308" };

function formatCount(n: string | number): string {
  return String(n);
}

function formatRupee(amount: string | number | null | undefined): string {
  if (amount === null || amount === undefined) return "₹0";
  const n = typeof amount === "string" ? parseFloat(amount) : Number(amount);
  if (Number.isNaN(n)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatRupeeShort(n: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosIns.get<DashboardApiResponse>(
        "/api/admin/dashboard",
      );
      setData(res.data);
    } catch {
      setError("Could not load dashboard stats. Check that you are logged in.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const pieData = useMemo(() => {
    if (!data) return [];
    const paid = Number(data.paidMonthlyRecords);
    const pending = Number(data.pendingPayments);
    return [
      { name: "Paid", value: paid },
      { name: "Pending", value: pending },
    ];
  }, [data]);

  const barData = useMemo(() => {
    if (!data?.monthlyRevenue?.length) return [];
    return data.monthlyRevenue.map((d) => ({
      name: new Date(Number(d.year), Number(d.month) - 1, 1).toLocaleString(
        "en-IN",
        { month: "short", year: "numeric" },
      ),
      revenue: Number(d.revenue) || 0,
    }));
  }, [data]);

  const quickLinks = [
    {
      href: "/admin/flats",
      label: "Flats",
      desc: "Manage units & assignments",
      icon: Building2,
    },
    {
      href: "/admin/subscriptions",
      label: "Subscription plans",
      desc: "Pricing & history",
      icon: CreditCard,
    },
    {
      href: "/admin/monthly-records",
      label: "Monthly records",
      desc: "Generate dues",
      icon: Calendar,
    },
    {
      href: "/admin/payment-entry",
      label: "Payment entry",
      desc: "Record offline pay",
      icon: Wallet,
    },
  ];

  const hasPieData = pieData.length > 0 && pieData.some((d) => d.value > 0);
  const hasAnyData =
    !!data &&
    (Number(data.flats) > 0 ||
      Number(data.residents) > 0 ||
      Number(data.pendingPayments) > 0 ||
      Number(data.paidMonthlyRecords) > 0 ||
      Number(data.totalCollection) > 0);

  return (
    <div className="p-6 w-full ">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 mb-1">
            <LayoutDashboard className="h-6 w-6" />
            <span className="text-sm font-semibold uppercase tracking-wide">
              Overview
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1 max-w-xl">
            Analytics from your database: occupancy, dues, collection, and
            payment trends.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchDashboard}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 shrink-0"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {loading && !data ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="h-36 rounded-2xl border border-gray-200 bg-gray-100 shadow-sm"
            />
          ))}
        </div>
      ) : data ? (
        <>
          {!hasAnyData ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-600 shadow-sm">
              No data available
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <StatCard
                icon={<Building2 className="h-6 w-6" />}
                iconBg="bg-indigo-100 text-indigo-700"
                label="Total flats"
                value={formatCount(data.flats)}
                hint="All flats in database"
              />
              <StatCard
                icon={<Users className="h-6 w-6" />}
                iconBg="bg-emerald-100 text-emerald-700"
                label="Residents"
                value={formatCount(data.residents)}
                hint="Users with role resident"
              />
              <StatCard
                icon={<Clock className="h-6 w-6" />}
                iconBg="bg-amber-100 text-amber-800"
                label="Pending monthly dues"
                value={formatCount(data.pendingPayments)}
                hint="monthly_records status pending"
              />
              <StatCard
                icon={<IndianRupee className="h-6 w-6" />}
                iconBg="bg-green-100 text-green-800"
                label="Total collection"
                value={formatRupee(data.totalCollection)}
                hint="Sum of payment amounts"
              />
            </div>
          )}

          {hasAnyData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <h2 className="text-left text-sm font-semibold text-gray-900 mb-1">
                  Payment status
                </h2>
                <p className="text-left text-xs text-gray-500 mb-4">
                  Monthly records: paid vs pending
                </p>
                <div className="h-[280px] w-full flex items-center justify-center">
                  {hasPieData ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={68}
                          outerRadius={96}
                          paddingAngle={2}
                        >
                          {pieData.map((entry) => (
                            <Cell
                              key={entry.name}
                              fill={
                                entry.name === "Paid"
                                  ? PIE_COLORS.paid
                                  : PIE_COLORS.pending
                              }
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => [
                            String(Number(value ?? 0)),
                            "Monthly records",
                          ]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-sm text-gray-500 text-center">
                      No monthly records yet to chart.
                    </p>
                  )}
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-600">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                    Paid
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
                    Pending
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <h2 className="text-left text-sm font-semibold text-gray-900 mb-1">
                  Monthly revenue
                </h2>
                <p className="text-left text-xs text-gray-500 mb-4">
                  Sum of payment amounts by month (last 12 months)
                </p>
                <div className="h-[280px] w-full">
                  {barData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={barData}
                        margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 11 }}
                          interval={0}
                          angle={-35}
                          textAnchor="end"
                          height={64}
                        />
                        <YAxis
                          tick={{ fontSize: 11 }}
                          tickFormatter={(v) =>
                            v >= 1000 ? `${v / 1000}k` : String(v)
                          }
                        />
                        <Tooltip
                          formatter={(value) => [
                            formatRupeeShort(Number(value ?? 0)),
                            "Revenue",
                          ]}
                        />
                        <Bar
                          dataKey="revenue"
                          fill="#6366f1"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-sm text-gray-500 text-center pt-8">
                      No payment data in range.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      ) : null}

      <section className="mt-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-gray-800 mb-4">
            Quick Links
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quickLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 hover:border-gray-300 hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-700 group-hover:bg-indigo-100 group-hover:text-indigo-700">
                    <item.icon className="h-4 w-4" />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {item.label}
                    </p>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                </div>

                <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({
  icon,
  iconBg,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-left text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-2 text-center text-3xl font-bold tabular-nums text-gray-900">
            {value}
          </p>
          <p className="mt-2 text-left text-xs text-gray-400">{hint}</p>
        </div>
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconBg}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
