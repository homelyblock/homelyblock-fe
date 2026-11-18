export type DashboardActivityItem = {
  id: string;
  type: string;
  title: string;
  occurredAt: string;
  hrefHint?: string;
};

export type ResidentDashboard = {
  role: "RESIDENT";
  society: { id: string; name: string; status: string };
  membership: {
    id: string;
    role: string;
    status: string;
    primaryUnitId: string | null;
    unitNumber: string | null;
    buildingName: string | null;
    buildingCode: string | null;
  };
  notices: {
    unreadCount: number;
    recent: Array<{
      id: string;
      title: string;
      category: string;
      publishedAt: string | null;
      isRead: boolean;
    }>;
  };
  maintenance: {
    outstandingBalance: string;
    openBills: Array<{
      id: string;
      invoiceNumber: string;
      status: string;
      outstandingAmount: string;
      dueDate: string;
      periodYear: number;
      periodMonth: number;
    }>;
    recentPayments: Array<{
      id: string;
      billId: string;
      amount: string;
      paidAt: string;
      method: string;
      status: string;
    }>;
  };
  complaints: {
    openOrInProgressCount: number;
    recent: Array<{
      id: string;
      title: string;
      status: string;
      category: string;
      createdAt: string;
    }>;
  };
  visitors: {
    pendingApprovalCount: number;
    recentExpected: Array<{
      id: string;
      visitorName: string;
      status: string;
      expectedAt: string | null;
    }>;
  };
  quickActions: string[];
  recentActivity: DashboardActivityItem[];
};

export type AdminDashboard = {
  role: "ADMIN";
  society: { id: string; name: string; status: string };
  occupancy: {
    totalBuildings: number;
    totalUnits: number;
    activeUnits: number;
    occupiedUnits: number;
    vacantUnits: number;
    activeResidentMemberships: number;
    activeAdminMemberships: number;
    activeHouseholdMembers: number;
    occupancyDefinition: string;
  };
  maintenance: {
    totalBilled: string;
    totalCollected: string;
    totalOutstanding: string;
    overdueAmount: string;
    paidInvoiceCount: number;
    partiallyPaidInvoiceCount: number;
    unpaidInvoiceCount: number;
    periodYear: number | null;
    periodMonth: number | null;
  };
  complaints: {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    highOrUrgent: number;
    byCategory: Array<{ category: string; count: number }>;
    recent: Array<{
      id: string;
      title: string;
      status: string;
      createdAt: string;
    }>;
  };
  visitors: {
    pendingApprovals: number;
    checkedIn: number;
    recent: Array<{
      id: string;
      visitorName: string;
      status: string;
      expectedAt: string | null;
      createdAt: string;
    }>;
  };
  notices: {
    draftCount: number;
    publishedCount: number;
    recent: Array<{
      id: string;
      title: string;
      status: string;
      publishedAt: string | null;
      createdAt: string;
    }>;
  };
  quickActions: string[];
  recentActivity: DashboardActivityItem[];
};

export type SocietyDashboard = ResidentDashboard | AdminDashboard;
