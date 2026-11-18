export type ServiceCategory =
  | "PLUMBING"
  | "ELECTRICAL"
  | "CARPENTRY"
  | "HOUSEKEEPING"
  | "PEST_CONTROL"
  | "INTERNET_CABLE"
  | "APPLIANCE_REPAIR"
  | "OTHER";

export type ServiceProvider = {
  id: string;
  societyId: string;
  name: string;
  category: ServiceCategory;
  description: string | null;
  contactPerson: string | null;
  phone: string;
  whatsappNumber: string | null;
  address: string | null;
  isActive: boolean;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
};

export type PaginatedServices = {
  items: ServiceProvider[];
  page: number;
  limit: number;
  total: number;
};

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  "PLUMBING",
  "ELECTRICAL",
  "CARPENTRY",
  "HOUSEKEEPING",
  "PEST_CONTROL",
  "INTERNET_CABLE",
  "APPLIANCE_REPAIR",
  "OTHER",
];
