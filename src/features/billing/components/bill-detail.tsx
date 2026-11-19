"use client";

import { useSubmitGuard } from "@/lib/use-submit-guard";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { controlClassName, fieldLabelClassName, textareaClassName } from "@/components/ui/control";
import { AuthStatus } from "@/features/auth/components/auth-status";
import { Field } from "@/features/auth/components/field";
import { getBrowserAccessToken } from "@/features/auth/browser-session";
import { ApiError } from "@/services/api-client";
import {
  downloadInvoicePdf,
  fetchBill,
  fetchBillPayments,
  publishBill,
  recordPayment,
  reversePayment,
} from "../api";
import { formatStatus } from "@/components/ui/status-tone";
import {
  formatDate,
  formatDateTime,
  formatDateTimeLocalIndia,
  indiaDateTimeLocalToIso,
} from "@/lib/format-date";
import { formatMoney, formatPeriod } from "../format";
import type { Payment } from "../types";

type BillDetailViewProps = {
  societyId: string;
  billId: string;
  canManage: boolean;
};

export function BillDetailView({
  societyId,
  billId,
  canManage,
}: BillDetailViewProps) {
  const queryClient = useQueryClient();
  const printRef = useRef<HTMLElement>(null);
  const paymentIdempotencyKeyRef = useRef<string | null>(null);
  const { pending, guard } = useSubmitGuard();
  const [status, setStatus] = useState<"idle" | "error" | "success">("idle");
  const [message, setMessage] = useState<string | undefined>();
  const [reverseTarget, setReverseTarget] = useState<Payment | null>(null);
  const [reverseReason, setReverseReason] = useState("");
  const [reverseError, setReverseError] = useState<string | undefined>();
  const reverseLock = useRef(false);

  const billQuery = useQuery({
    queryKey: ["maintenance-bill", billId],
    queryFn: async () => {
      const token = await getBrowserAccessToken();
      if (!token) {
        throw new ApiError("Sign in required", 401, "UNAUTHORIZED");
      }
      return fetchBill(token, billId);
    },
  });

  const paymentsQuery = useQuery({
    queryKey: ["maintenance-bill-payments", billId],
    queryFn: async () => {
      const token = await getBrowserAccessToken();
      if (!token) {
        throw new ApiError("Sign in required", 401, "UNAUTHORIZED");
      }
      return fetchBillPayments(token, billId);
    },
  });

  function refresh() {
    return Promise.all([
      queryClient.invalidateQueries({ queryKey: ["maintenance-bill", billId] }),
      queryClient.invalidateQueries({
        queryKey: ["maintenance-bill-payments", billId],
      }),
      queryClient.invalidateQueries({
        queryKey: ["maintenance-bills", societyId],
      }),
      queryClient.invalidateQueries({
        queryKey: ["billing-dashboard", societyId],
      }),
    ]);
  }

  function onPublish() {
    guard(async () => {
      try {
        const token = await getBrowserAccessToken();
        if (!token) {
          throw new ApiError("Sign in required", 401, "UNAUTHORIZED");
        }
        await publishBill(token, billId);
        setStatus("success");
        setMessage("Invoice published.");
        await refresh();
      } catch (error) {
        setStatus("error");
        setMessage(
          error instanceof ApiError
            ? error.message
            : "Unable to publish invoice.",
        );
      }
    });
  }

  function onRecordPayment(formData: FormData, form: HTMLFormElement) {
    const amount = String(formData.get("amount") ?? "").trim();
    const method = String(formData.get("method") ?? "") as Payment["method"];
    const paidAtLocal = String(formData.get("paidAt") ?? "");
    const referenceNumber = String(
      formData.get("referenceNumber") ?? "",
    ).trim();
    const notes = String(formData.get("notes") ?? "").trim();

    if (!/^\d+(\.\d{1,2})?$/.test(amount) || Number(amount) <= 0) {
      setStatus("error");
      setMessage("Enter a valid payment amount.");
      return;
    }
    const paidAt = indiaDateTimeLocalToIso(paidAtLocal);
    if (!paidAt) {
      setStatus("error");
      setMessage("Enter a valid payment date and time.");
      return;
    }

    if (!paymentIdempotencyKeyRef.current) {
      paymentIdempotencyKeyRef.current = crypto.randomUUID();
    }
    const idempotencyKey = paymentIdempotencyKeyRef.current;

    guard(async () => {
      try {
        const token = await getBrowserAccessToken();
        if (!token) {
          throw new ApiError("Sign in required", 401, "UNAUTHORIZED");
        }
        await recordPayment(token, billId, {
          idempotencyKey,
          amount,
          method,
          paidAt,
          referenceNumber: referenceNumber || undefined,
          notes: notes || undefined,
        });
        paymentIdempotencyKeyRef.current = null;
        setStatus("success");
        setMessage("Payment recorded.");
        form.reset();
        await refresh();
      } catch (error) {
        setStatus("error");
        setMessage(
          error instanceof ApiError
            ? error.message
            : "Unable to record payment.",
        );
      }
    });
  }

  function onDownloadPdf() {
    guard(async () => {
      try {
        const token = await getBrowserAccessToken();
        if (!token) {
          throw new ApiError("Sign in required", 401, "UNAUTHORIZED");
        }
        const blob = await downloadInvoicePdf(token, billId);
        const objectUrl = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = objectUrl;
        anchor.download = `invoice-${billId}.pdf`;
        anchor.click();
        URL.revokeObjectURL(objectUrl);
        setStatus("success");
        setMessage("Invoice PDF downloaded.");
      } catch (error) {
        setStatus("error");
        setMessage(
          error instanceof ApiError
            ? error.message
            : "Unable to download invoice PDF.",
        );
      }
    });
  }

  function confirmReverse() {
    const payment = reverseTarget;
    if (!payment || pending || reverseLock.current) return;
    const reason = reverseReason.trim();
    if (!reason) {
      setReverseError("Enter a reason for this reversal.");
      return;
    }
    reverseLock.current = true;
    setReverseError(undefined);
    guard(async () => {
      try {
        const token = await getBrowserAccessToken();
        if (!token) {
          throw new ApiError("Sign in required", 401, "UNAUTHORIZED");
        }
        await reversePayment(token, payment.id, reason);
        setReverseTarget(null);
        setReverseReason("");
        setStatus("success");
        setMessage("Payment reversed.");
        await refresh();
      } catch (error) {
        setReverseError(
          error instanceof ApiError
            ? error.message
            : "Unable to reverse payment.",
        );
      } finally {
        reverseLock.current = false;
      }
    });
  }

  if (billQuery.isLoading) {
    return (
      <p className="text-sm text-muted-foreground" role="status">
        Loading invoice…
      </p>
    );
  }

  if (billQuery.isError || !billQuery.data) {
    return (
      <p
        role="alert"
        className="rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive"
      >
        {billQuery.error instanceof ApiError
          ? billQuery.error.message
          : "Unable to load invoice."}
      </p>
    );
  }

  const bill = billQuery.data;
  const canRecordPayment =
    canManage &&
    ["PUBLISHED", "PARTIALLY_PAID", "OVERDUE"].includes(bill.status) &&
    Number(bill.outstandingAmount) > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            {bill.invoiceNumber}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatPeriod(bill.periodYear, bill.periodMonth)}
            {bill.buildingCode || bill.unitNumber
              ? ` · ${bill.buildingCode ?? ""}-${bill.unitNumber ?? ""}`
              : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge value={bill.status} />
          <Button
            type="button"
            variant="secondary"
            disabled={pending}
            onClick={onDownloadPdf}
          >
            Download PDF
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => window.print()}
          >
            Print
          </Button>
          {canManage && bill.status === "DRAFT" ? (
            <Button type="button" disabled={pending} onClick={onPublish}>
              Publish
            </Button>
          ) : null}
        </div>
      </div>

      <AuthStatus status={status} message={message} />

      <article
        ref={printRef}
        className="space-y-4 rounded-lg border border-border bg-card p-5 print:border-0"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <p className="text-sm text-foreground">
            <span className="font-medium text-foreground">Invoice date:</span>{" "}
            {formatDate(bill.invoiceDate)}
          </p>
          <p className="text-sm text-foreground">
            <span className="font-medium text-foreground">Due date:</span>{" "}
            {formatDate(bill.dueDate)}
          </p>
          <p className="text-sm text-foreground">
            <span className="font-medium text-foreground">Period:</span>{" "}
            {bill.periodStart} → {bill.periodEnd}
          </p>
          <p className="text-sm text-foreground">
            <span className="font-medium text-foreground">Outstanding:</span>{" "}
            {formatMoney(bill.outstandingAmount)}
          </p>
        </div>

        <div className="max-w-full overflow-x-auto">
        <table className="w-full min-w-[20rem] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="py-2 font-medium">Description</th>
              <th className="py-2 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {(bill.lineItems ?? []).map((item) => (
              <tr key={item.id} className="border-b border-border">
                <td className="py-2 text-foreground">{item.description}</td>
                <td className="py-2 text-right text-foreground">
                  {item.lineType === "DISCOUNT" ? "-" : ""}
                  {formatMoney(item.amount)}
                </td>
              </tr>
            ))}
            {(bill.lineItems?.length ?? 0) === 0 ? (
              <>
                <tr className="border-b border-border">
                  <td className="py-2">Base maintenance</td>
                  <td className="py-2 text-right">
                    {formatMoney(bill.baseAmount)}
                  </td>
                </tr>
                {Number(bill.additionalAmount) > 0 ? (
                  <tr className="border-b border-border">
                    <td className="py-2">Additional charges</td>
                    <td className="py-2 text-right">
                      {formatMoney(bill.additionalAmount)}
                    </td>
                  </tr>
                ) : null}
                {Number(bill.discountAmount) > 0 ? (
                  <tr className="border-b border-border">
                    <td className="py-2">Discount</td>
                    <td className="py-2 text-right">
                      -{formatMoney(bill.discountAmount)}
                    </td>
                  </tr>
                ) : null}
              </>
            ) : null}
          </tbody>
          <tfoot>
            <tr>
              <td className="pt-3 font-semibold text-foreground">Total</td>
              <td className="pt-3 text-right font-semibold text-foreground">
                {formatMoney(bill.totalAmount)}
              </td>
            </tr>
            <tr>
              <td className="pt-1 text-foreground">Paid</td>
              <td className="pt-1 text-right text-foreground">
                {formatMoney(bill.paidAmount)}
              </td>
            </tr>
          </tfoot>
        </table>
        </div>
      </article>

      {canRecordPayment ? (
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            const form = event.currentTarget;
            if (form.dataset.locked === "1") return;
            onRecordPayment(new FormData(form), form);
          }}
          className="space-y-4 rounded-lg border border-border bg-card p-4 print:hidden"
        >
          <h3 className="text-base font-semibold text-foreground">
            Record payment
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              id="amount"
              name="amount"
              label="Amount"
              inputMode="decimal"
              placeholder={bill.outstandingAmount}
            />
            <div className="space-y-1.5">
              <label
                htmlFor="method"
                className="block text-sm font-medium text-foreground"
              >
                Method
              </label>
              <select
                id="method"
                name="method"
                className={controlClassName}
                defaultValue="UPI"
              >
                <option value="CASH">CASH</option>
                <option value="UPI">UPI</option>
                <option value="BANK_TRANSFER">BANK_TRANSFER</option>
                <option value="CHEQUE">CHEQUE</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>
            <Field
              id="paidAt"
              name="paidAt"
              label="Payment date"
              type="datetime-local"
              defaultValue={formatDateTimeLocalIndia()}
            />
            <Field
              id="referenceNumber"
              name="referenceNumber"
              label="Reference number"
            />
          </div>
          <Field id="notes" name="notes" label="Notes" />
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Record payment"}
          </Button>
        </form>
      ) : null}

      <section className="space-y-3 print:break-before-page">
        <h3 className="text-base font-semibold text-foreground">
          Payment history
        </h3>
        {paymentsQuery.isLoading ? (
          <p className="text-sm text-muted-foreground" role="status">
            Loading payments…
          </p>
        ) : null}
        {paymentsQuery.isError ? (
          <p
            role="alert"
            className="rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {paymentsQuery.error instanceof ApiError
              ? paymentsQuery.error.message
              : "Unable to load payments."}
          </p>
        ) : null}
        {!paymentsQuery.isLoading &&
        !paymentsQuery.isError &&
        (paymentsQuery.data?.length ?? 0) === 0 ? (
          <p className="rounded-lg border border-dashed border-input bg-card px-4 py-6 text-sm text-muted-foreground">
            No payments recorded yet.
          </p>
        ) : null}
        <ul className="space-y-2">
          {(paymentsQuery.data ?? []).map((payment) => (
            <li
              key={payment.id}
              className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium text-foreground">
                  {formatMoney(payment.amount)} · {payment.method} ·{" "}
                  {payment.status}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {formatDateTime(payment.paidAt)}
                  {payment.referenceNumber
                    ? ` · Ref ${payment.referenceNumber}`
                    : ""}
                </p>
                {payment.reversalReason ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Reversal: {payment.reversalReason}
                  </p>
                ) : null}
              </div>
              {canManage && payment.status === "RECORDED" ? (
                <Button
                  type="button"
                  variant="secondary"
                  disabled={pending}
                  className="print:hidden"
                  onClick={() => {
                    setReverseReason("");
                    setReverseError(undefined);
                    setReverseTarget(payment);
                  }}
                >
                  Reverse
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      </section>
      <ConfirmDialog
        open={reverseTarget !== null}
        title="Reverse this payment?"
        description={
          reverseTarget
            ? `Reverse ${formatMoney(reverseTarget.amount)} recorded by ${formatStatus(reverseTarget.method)} on ${formatDateTime(reverseTarget.paidAt)}${reverseTarget.referenceNumber ? `, reference ${reverseTarget.referenceNumber}` : ""}. The invoice balance is updated, and the payment stays in the history as reversed.`
            : undefined
        }
        confirmLabel="Reverse payment"
        pending={pending}
        error={reverseError}
        onCancel={() => {
          if (pending) return;
          setReverseTarget(null);
          setReverseReason("");
          setReverseError(undefined);
        }}
        onConfirm={confirmReverse}
      >
        <div className="space-y-1.5">
          <label htmlFor="reversal-reason" className={fieldLabelClassName}>
            Reason
            <span className="text-destructive" aria-hidden>
              {" "}
              *
            </span>
          </label>
          <textarea
            id="reversal-reason"
            value={reverseReason}
            onChange={(event) => setReverseReason(event.target.value)}
            rows={3}
            required
            disabled={pending}
            aria-invalid={reverseError ? true : undefined}
            className={textareaClassName}
          />
        </div>
      </ConfirmDialog>
    </div>
  );
}
