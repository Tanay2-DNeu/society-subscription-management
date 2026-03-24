"use client";

import axiosIns from "@/lib/axios";
import { formatMoney, MONTHS } from "@/lib/residentUi";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Smartphone } from "lucide-react";

interface PendingRow {
  id: number;
  month: number;
  year: number;
  amount_due: string | number;
  status: string;
}

interface PendingResponse {
  hasFlat: boolean;
  flat: { id: number; flat_number: string; block: string } | null;
  pending: PendingRow[];
}

export default function PayNowPage() {
  const router = useRouter();
  const [data, setData] = useState<PendingResponse | null>(null);
  const [error, setError] = useState("");
  const [payingId, setPayingId] = useState<number | null>(null);
  const [msg, setMsg] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<PendingRow | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card">("upi");
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  const load = useCallback(async () => {
    setError("");
    setMsg("");
    try {
      const res = await axiosIns.get<PendingResponse>(
        "/api/resident/pending-dues",
      );
      setData(res.data);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response
        ?.status;
      if (status === 401) router.replace("/resident/login");
      else setError("Could not load pending dues");
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  const pay = async (monthlyRecordId: number) => {
    setPayingId(monthlyRecordId);
    setMsg("");
    try {
      await axiosIns.post("/api/resident/payments", {
        monthly_record_id: monthlyRecordId,
      });
      setMsg("Payment successful.");
      await load();
      setSelectedRecord(null);
      setUpiId("");
      setCardNumber("");
      setCardName("");
      setCardExpiry("");
      setCardCvv("");
    } catch (err: unknown) {
      const m =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Payment failed";
      setMsg(m);
    } finally {
      setPayingId(null);
    }
  };

  const openGateway = (record: PendingRow) => {
    setSelectedRecord(record);
    setPaymentMethod("upi");
    setUpiId("");
    setCardNumber("");
    setCardName("");
    setCardExpiry("");
    setCardCvv("");
    setMsg("");
  };

  const handleGatewayPay = async () => {
    if (!selectedRecord) return;

    if (paymentMethod === "upi") {
      if (!upiId.trim()) {
        setMsg("Enter a UPI ID to continue.");
        return;
      }
    } else {
      if (
        !cardNumber.trim() ||
        !cardName.trim() ||
        !cardExpiry.trim() ||
        !cardCvv.trim()
      ) {
        setMsg("Enter complete card details to continue.");
        return;
      }
    }

    await pay(selectedRecord.id);
  };

  if (error || !data) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-gray-900">Pay Now</h1>
        <p className="text-red-600">{error || "Loading…"}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-900">Pay Now</h1>
      <p className="text-sm text-gray-600">
        Simulated payment. Pending months for your flat.
      </p>

      {msg && (
        <div
          className={`rounded-lg px-4 py-3 text-sm ${
            msg.includes("successful")
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {msg}
        </div>
      )}

      {!data.hasFlat ? (
        <div className="rounded-2xl bg-white p-5 shadow-sm text-gray-700">
          You are not assigned to any flat yet.
        </div>
      ) : data.pending.length === 0 ? (
        <div className="rounded-2xl bg-white p-5 shadow-sm text-gray-600">
          No pending dues. You&apos;re all caught up.
        </div>
      ) : (
        <div className="rounded-2xl bg-white p-5 shadow-sm overflow-x-auto">
          <table className="w-full text-sm text-left min-w-[480px]">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500">
                <th className="py-3 pr-4">Month</th>
                <th className="py-3 pr-4">Amount</th>
                <th className="py-3">Pay</th>
              </tr>
            </thead>
            <tbody>
              {data.pending.map((r) => (
                <tr key={r.id} className="border-b border-gray-100">
                  <td className="py-3 pr-4">
                    {MONTHS[r.month - 1]} {r.year}
                  </td>
                  <td className="py-3 pr-4 tabular-nums">
                    {formatMoney(r.amount_due)}
                  </td>
                  <td className="py-3">
                    <button
                      type="button"
                      disabled={payingId === r.id}
                      onClick={() => openGateway(r)}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                    >
                      {payingId === r.id ? "Processing…" : "Pay now"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedRecord && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mock-payment-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden">
            <div className="border-b border-gray-100 px-5 py-4">
              <h2
                id="mock-payment-title"
                className="text-lg font-semibold text-gray-900"
              >
                Complete payment
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Mock gateway for {MONTHS[selectedRecord.month - 1]}{" "}
                {selectedRecord.year}
              </p>
            </div>

            <div className="px-5 py-4 space-y-4">
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Amount
                </p>
                <p className="text-xl font-semibold text-gray-900 mt-1">
                  {formatMoney(selectedRecord.amount_due)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("upi")}
                  className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                    paymentMethod === "upi"
                      ? "border-blue-500 bg-blue-50 text-blue-900"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    <span className="font-medium text-sm">UPI</span>
                  </div>
                  <p className="text-xs mt-1 text-gray-500">
                    Fast mock payment
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                    paymentMethod === "card"
                      ? "border-blue-500 bg-blue-50 text-blue-900"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    <span className="font-medium text-sm">Card</span>
                  </div>
                  <p className="text-xs mt-1 text-gray-500">
                    Visa / Mastercard mock
                  </p>
                </button>
              </div>

              {paymentMethod === "upi" ? (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    UPI ID
                  </label>
                  <input
                    type="text"
                    placeholder="name@bank"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Card number
                    </label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name on card
                    </label>
                    <input
                      type="text"
                      placeholder="Resident Name"
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expiry
                      </label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CVV
                      </label>
                      <input
                        type="password"
                        placeholder="123"
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-5 py-4">
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                disabled={payingId === selectedRecord.id}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGatewayPay}
                disabled={payingId === selectedRecord.id}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {payingId === selectedRecord.id
                  ? "Processing…"
                  : "Pay securely"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
