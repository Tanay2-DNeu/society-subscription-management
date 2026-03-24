"use client";

import axiosIns from "@/lib/axios";
import { useCallback, useEffect, useState } from "react";
import { Pencil, RefreshCcw } from "lucide-react";

interface Plan {
  id: number;
  flat_type: "1bhk" | "2bhk" | "3bhk";
  monthly_cost: number;
  is_active?: boolean;
  created_at?: string;
}

interface SubscriptionPlansResponse {
  active: Plan[];
  history: Plan[];
}

function formatRupee(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function SubscriptionPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [history, setHistory] = useState<Plan[]>([]);
  const [editPlan, setEditPlan] = useState<Plan | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axiosIns.get<SubscriptionPlansResponse>(
        "/api/subscription-plans",
      );
      setPlans(res.data.active || []);
      setHistory(res.data.history || []);
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to fetch subscription plans";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleUpdate = async () => {
    if (!editPlan) return;
    const value = amount.trim();

    if (!value) {
      setError("Price is required");
      return;
    }

    const num = Number(value);
    if (Number.isNaN(num) || !Number.isFinite(num)) {
      setError("Price must be numeric");
      return;
    }

    if (num <= 0) {
      setError("Price must be greater than 0");
      return;
    }

    try {
      setError("");
      await axiosIns.put(`/api/subscriptions/${editPlan.id}`, {
        monthly_cost: num,
      });

      const res = await axiosIns.get<SubscriptionPlansResponse>(
        "/api/subscription-plans",
      );
      setPlans(res.data.active || []);
      setHistory(res.data.history || []);

      setEditPlan(null);
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to update plan";
      setError(msg);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Subscription Plans
          </h1>
          <p className="text-sm text-gray-600 mt-2 max-w-xl">
            Plan changes apply from <strong>next month</strong> when monthly
            records are generated. Existing dues and snapshots are{" "}
            <strong>not</strong> changed.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchAll}
          className="inline-flex items-center justify-center gap-2 border border-gray-300 bg-white px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm hover:bg-gray-50 disabled:opacity-50 shrink-0"
          disabled={loading}
        >
          <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}
      {loading && plans.length === 0 && history.length === 0 && (
        <p className="text-sm text-gray-500 mb-4">Loading...</p>
      )}

      <section className="mb-10">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Active plans
        </h2>
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-left text-gray-700">
                <th className="px-4 py-3 font-semibold">Flat type</th>
                <th className="px-4 py-3 font-semibold text-center">
                  Monthly amount
                </th>
                <th className="px-4 py-3 font-semibold text-center">Status</th>
                <th className="px-4 py-3 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {plans.length === 0 && !loading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No active plans. Create one via API{" "}
                    <code className="text-xs bg-gray-100 px-1 rounded">
                      POST /api/subscriptions
                    </code>
                    .
                  </td>
                </tr>
              ) : (
                plans.map((plan) => (
                  <tr
                    key={plan.id}
                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50/80 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      <span className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide">
                        {plan.flat_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center tabular-nums text-gray-900">
                      {formatRupee(Number(plan.monthly_cost))}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Active
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-lg p-2 text-emerald-700 hover:bg-emerald-50"
                        title="Update price"
                        onClick={() => {
                          setEditPlan(plan);
                          setAmount(String(plan.monthly_cost));
                          setError("");
                        }}
                      >
                        <Pencil size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Plan history
        </h2>
        <p className="text-xs text-gray-500 mb-3">
          Newest first. Inactive rows keep old prices for audit; billing uses
          snapshots in <code className="bg-gray-100 px-1 rounded">monthly_records</code>.
        </p>
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-left text-gray-700">
                <th className="px-4 py-3 font-semibold">Flat type</th>
                <th className="px-4 py-3 font-semibold text-center">
                  Monthly amount
                </th>
                <th className="px-4 py-3 font-semibold text-center">Status</th>
                <th className="px-4 py-3 font-semibold">Created</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 && !loading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No history yet.
                  </td>
                </tr>
              ) : (
                history.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50/80 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      <span className="uppercase">{p.flat_type}</span>
                    </td>
                    <td className="px-4 py-3 text-center tabular-nums text-gray-900">
                      {formatRupee(Number(p.monthly_cost))}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {p.is_active ? (
                        <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {p.created_at
                        ? new Date(p.created_at).toLocaleString()
                        : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {editPlan && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="update-plan-title"
        >
          <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-xl">
            <h2
              id="update-plan-title"
              className="text-lg font-semibold text-gray-900"
            >
              Update plan price
            </h2>
            <p className="mt-2 text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
              This change will apply from the <strong>next billing cycle</strong>{" "}
              when monthly records are generated. Current month dues stay the
              same.
            </p>
            <p className="mt-3 text-sm text-gray-600">
              Flat type:{" "}
              <span className="font-semibold uppercase">
                {editPlan.flat_type}
              </span>
            </p>

            <label className="mt-4 block text-sm font-medium text-gray-700">
              New price
            </label>
            <input
              type="text"
              inputMode="decimal"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 1500"
            />

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                onClick={() => setEditPlan(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdate}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
