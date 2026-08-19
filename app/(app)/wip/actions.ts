"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { WipStage } from "@/lib/types";

export async function addWipItem(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!name) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("wip_items").insert({
    member_id: user.id,
    name,
    notes: notes || null,
  });

  revalidatePath("/wip");
}

export async function setWipStage(id: string, stage: WipStage) {
  const supabase = await createClient();
  await supabase
    .from("wip_items")
    .update({ stage, updated_at: new Date().toISOString() })
    .eq("id", id);

  revalidatePath("/wip");
}

export async function deleteWipItem(id: string) {
  const supabase = await createClient();
  await supabase.from("wip_items").delete().eq("id", id);

  revalidatePath("/wip");
}
