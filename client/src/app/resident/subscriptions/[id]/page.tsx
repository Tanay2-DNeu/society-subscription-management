"use client";

import axiosIns from "@/lib/axios";
import { formatDateTime, formatMoney, MONTHS } from "@/lib/residentUi";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface DetailRow {
  id: number;
  month: number;
  year: number;
  amount_due: string | number;
  status: string;
  payment_id: number | null;
  payment_amount: string | number | null;
  payment_mode: string | null;
  payment_status: string | null;
  payment_created_at: string | null;
}

export default function SubscriptionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [row, setRow] = useState<DetailRow | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const res = await axiosIns.get<DetailRow>(
        `/api/resident/subscriptions/${id}`,
      );
      setRow(res.data);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response
        ?.status;
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message;
      if (status === 401) router.replace("/resident/login");
      else setError(msg || "Could not load record");
    }
  }, [id, router]);

  useEffect(() => {
    load();
  }, [load]);

  if (error || !row) {
    return (
      <div className="flex flex-col gap-6">
        <Link
          href="/resident/subscriptions"
          className="text-sm text-blue-600 hover:underline w-fit"
        >
          ← Back to subscriptions
        </Link>
        <p className="text-red-600">{error || "Loading…"}</p>
      </div>
    );
  }

  const paid = String(row.status).toLowerCase() === "paid";

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/resident/subscriptions"
        className="text-sm text-blue-600 hover:underline w-fit"
      >
        ← Back to subscriptions
      </Link>

      <h1 className="text-2xl font-bold text-gray-900">Bill details</h1>

      <div className="rounded-2xl bg-white p-5 shadow-sm flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Period</p>
            <p className="font-medium text-gray-900">
              {MONTHS[row.month - 1]} {row.year}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Amount due</p>
            <p className="font-medium text-gray-900 tabular-nums">
              {formatMoney(row.amount_due)}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Status</p>
            <p className="mt-1">
              <span
                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  paid
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-900"
                }`}
              >
                {paid ? "Paid" : "Pending"}
              </span>
            </p>
          </div>
        </div>

        {paid && row.payment_created_at && (
          <div className="border-t border-gray-100 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Payment date</p>
              <p className="font-medium text-gray-900">
                {formatDateTime(row.payment_created_at)}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Payment mode</p>
              <p className="font-medium text-gray-900 capitalize">
                {row.payment_mode ?? "—"}
              </p>
            </div>
          </div>
        )}

        {!paid && (
          <p className="text-sm text-gray-600">
            Pay from{" "}
            <Link href="/resident/pay-now" className="text-blue-600 font-medium">
              Pay Now
            </Link>{" "}
            when you&apos;re ready.
          </p>
        )}
      </div>
    </div>
  );
}
