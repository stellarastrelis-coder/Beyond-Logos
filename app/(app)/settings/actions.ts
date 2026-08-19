"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateQrImage(formData: FormData) {
  const image = formData.get("image") as File | null;
  if (!image || image.size === 0) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const ext = image.name.split(".").pop() ?? "png";
  const path = `payment-qr-${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from("payment-qr")
    .upload(path, image, { contentType: image.type });

  if (error) return;

  const { data } = supabase.storage.from("payment-qr").getPublicUrl(path);

  await supabase.from("app_settings").update({ qr_image_url: data.publicUrl }).eq("id", true);

  revalidatePath("/settings");
  revalidatePath("/kasir");
}
