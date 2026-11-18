export type MaintenanceConfig = {
  id: string;
  societyId: string;
  name: string;
  description: string | null;
  monthlyAmount: string;
  billingCycle: "MONTHLY";
  dueDayOfMonth: number;
  additionalAmount: string;
  additionalDescription: string | null;
  scope: "SOCIETY" | "BUILDING" | "UNIT";
  targetBuildingId: string | null;
  targetUnitId: string | null;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  updatedAt: string;
};

export type BillStatus =
  | "DRAFT"
  | "PUBLISHED"
  | "PARTIALLY_PAID"
  | "PAID"
  | "OVERDUE"
  | "CANCELLED";

export type Bill = {
  id: string;
  societyId: string;
  buildingId: string;
  unitId: string;
  invoiceNumber: string;
  periodYear: number;
  periodMonth: number;
  periodStart: string;
  periodEnd: string;
  invoiceDate: string;
  dueDate: string;
  baseAmount: string;
  additionalAmount: string;
  discountAmount: string;
  totalAmount: string;
  paidAmount: string;
  outstandingAmount: string;
  status: BillStatus;
  unitNumber?: string;
  buildingCode?: string;
  lineItems?: Array<{
    id: string;
    description: string;
    amount: string;
    lineType: "BASE" | "ADDITIONAL" | "DISCOUNT";
  }>;
};

export type Payment = {
  id: string;
  billId: string;
  amount: string;
  method: "CASH" | "UPI" | "BANK_TRANSFER" | "CHEQUE" | "OTHER";
  paidAt: string;
  referenceNumber: string | null;
  notes: string | null;
  status: "RECORDED" | "REVERSED";
  idempotencyKey?: string;
  reversalReason: string | null;
};

export type BillingDashboard = {
  totalBilled: string;
  totalCollected: string;
  totalOutstanding: string;
  overdueAmount: string;
  paidInvoiceCount: number;
  partiallyPaidInvoiceCount: number;
  unpaidInvoiceCount: number;
};

export type PaginatedBills = {
  items: Bill[];
  page: number;
  limit: number;
  total: number;
};
