export type WipStage = "draft" | "warna" | "test_print" | "mass_production";

export const WIP_STAGES: { value: WipStage; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "warna", label: "Warna" },
  { value: "test_print", label: "Test Print" },
  { value: "mass_production", label: "Mass Production" },
];

export type Profile = {
  id: string;
  display_name: string;
  created_at: string;
};

export type WipItem = {
  id: string;
  member_id: string;
  name: string;
  notes: string | null;
  stage: WipStage;
  created_at: string;
  updated_at: string;
};

export type StockItem = {
  id: string;
  member_id: string;
  name: string;
  image_url: string | null;
  price: number;
  quantity: number;
  created_at: string;
  updated_at: string;
  profiles?: Pick<Profile, "id" | "display_name"> | null;
};

export type Transaction = {
  id: string;
  created_at: string;
  total: number;
  handled_by: string;
  voided_at: string | null;
  profiles?: Pick<Profile, "id" | "display_name"> | null;
};

export type TransactionItem = {
  id: string;
  transaction_id: string;
  stock_item_id: string | null;
  item_owner_id: string;
  name_snapshot: string;
  price_snapshot: number;
  quantity: number;
  subtotal: number;
};
