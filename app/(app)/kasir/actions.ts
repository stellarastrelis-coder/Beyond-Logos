"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type CartLine = { stock_item_id: string; quantity: number };

function refreshKasirPaths() {
  revalidatePath("/kasir");
  revalidatePath("/");
  revalidatePath("/laporan");
}

export async function checkout(
  cart: CartLine[],
): Promise<{ error?: string; transactionId?: string }> {
  if (cart.length === 0) return { error: "Keranjang kosong." };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("checkout_transaction", { cart });

  if (error) return { error: error.message };

  refreshKasirPaths();
  return { transactionId: data as string };
}

export async function voidTransaction(id: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("void_transaction", { p_transaction_id: id });

  refreshKasirPaths();
  return { error: error?.message };
}
