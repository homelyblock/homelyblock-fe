import type { ReactNode } from "react";
import { readOperatorIdentity } from "@/features/marketing/operator";

export const LEGAL_UPDATED = "18 November 2026";

export function LegalReviewNotice() {
  return (
    <p className="rounded-xl border border-border bg-muted px-4 py-3 text-sm leading-6">
      Last updated {LEGAL_UPDATED}. This page describes the application and the official Indian sources reviewed while writing it. It is not a legal opinion, a certification, or a claim that every duty is already in force. A qualified adviser must approve it before a public launch.
    </p>
  );
}

export function OperatorBlock() {
  const operator = readOperatorIdentity();
  return (
    <>
      <h2>Who operates this deployment</h2>
      {operator.legalName ? (
        <p>
          This deployment is operated by {operator.legalName}
          {operator.address ? `, ${operator.address}` : ""}. That name is published from the operator’s configuration. It is not a registration certificate.
        </p>
      ) : (
        <p>
          The registered legal name, address, GSTIN, and CIN of the organisation that operates this deployment are not configured. Do not treat any company name or office address as belonging to HomelyBlock until the operator publishes them. This is a launch blocker.
        </p>
      )}
      <h2>How to reach the operator</h2>
      <p>
        Use the <a href="/contact">contact form</a> for platform questions. Society complaints, visitor issues, and maintenance disputes belong with the society administrator inside the society, not in this form.
      </p>
      {operator.supportEmail ? (
        <p>Configured support email: {operator.supportEmail}.</p>
      ) : (
        <p>A support email address has not been published. The contact form stores the message for the operator.</p>
      )}
      {operator.grievanceEmail ? (
        <p>Configured grievance and privacy contact: {operator.grievanceEmail}.</p>
      ) : (
        <p>
          A named grievance officer and a published privacy contact are not configured. Publishing them is a launch blocker. Do not assume a government portal or a personal inbox is the grievance channel.
        </p>
      )}
    </>
  );
}

export function PolicySection({ children }: { children: ReactNode }) {
  return <div className="space-y-4 [&_h2]:pt-4 [&_h2]:text-base [&_h2]:font-semibold [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">{children}</div>;
}
