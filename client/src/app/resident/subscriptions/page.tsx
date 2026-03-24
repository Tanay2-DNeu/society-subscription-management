"use client";

import axiosIns from "@/lib/axios";
import { formatMoney, MONTHS } from "@/lib/residentUi";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface SubRow {
  id: number;
  month: number;
  year: number;
  amount_due: string | number;
  status: string;
  payment_mode: string | null;
  payment_status: string | null;
}

interface SubscriptionsResponse {
  hasFlat: boolean;
  flat: { id: number; flat_number: string; block: string } | null;
  records: SubRow[];
}

export default function SubscriptionsPage() {
  const router = useRouter();
  const [data, setData] = useState<SubscriptionsResponse | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const res = await axiosIns.get<SubscriptionsResponse>(
        "/api/resident/subscriptions",
      );
      setData(res.data);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response
        ?.status;
      if (status === 401) router.replace("/resident/login");
      else setError("Could not load subscriptions");
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  if (error || !data) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-gray-900">Subscriptions</h1>
        <p className="text-red-600">{error || "Loading…"}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-900">Subscriptions</h1>
      <p className="text-sm text-gray-600">
        Monthly bills for your flat
        {data.flat
          ? ` (${data.flat.block} — ${data.flat.flat_number})`
          : ""}
      </p>

      {!data.hasFlat ? (
        <div className="rounded-2xl bg-white p-5 shadow-sm text-gray-700">
          You are not assigned to any flat yet.
        </div>
      ) : data.records.length === 0 ? (
        <div className="rounded-2xl bg-white p-5 shadow-sm text-gray-600">
          No subscription records yet.
        </div>
      ) : (
        <div className="rounded-2xl bg-white p-5 shadow-sm overflow-x-auto">
          <table className="w-full text-sm text-left min-w-[640px]">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500">
                <th className="py-3 pr-4">Month / Year</th>
                <th className="py-3 pr-4">Amount</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 pr-4">Payment mode</th>
                <th className="py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {data.records.map((r) => {
                const paid = String(r.status).toLowerCase() === "paid";
                return (
                  <tr key={r.id} className="border-b border-gray-100">
                    <td className="py-3 pr-4">
                      {MONTHS[r.month - 1]} {r.year}
                    </td>
                    <td className="py-3 pr-4 tabular-nums">
                      {formatMoney(r.amount_due)}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          paid
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-900"
                        }`}
                      >
                        {paid ? "Paid" : "Pending"}
                      </span>
                    </td>
                    <td className="py-3 pr-4 capitalize">
                      {r.payment_mode ?? "—"}
                    </td>
                    <td className="py-3">
                      <Link
                        href={`/resident/subscriptions/${r.id}`}
                        className="text-blue-600 font-medium hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
