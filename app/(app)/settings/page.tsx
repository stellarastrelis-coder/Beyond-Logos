import { createClient } from "@/lib/supabase/server";
import { updateQrImage } from "./actions";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: settings } = await supabase
    .from("app_settings")
    .select("qr_image_url")
    .single();

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-brand-800">Settings</h1>
      <p className="mt-1 text-sm text-muted">
        Gambar QR pembayaran statis yang ditampilkan pas checkout di Kasir.
      </p>

      <div className="mt-6 max-w-sm rounded-2xl border border-brand-100 bg-white p-4 shadow-sm shadow-brand-100/50">
        <p className="text-sm font-medium text-ink">QR saat ini</p>
        <div className="mt-2 flex h-56 w-56 items-center justify-center overflow-hidden rounded-xl bg-brand-50">
          {settings?.qr_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={settings.qr_image_url}
              alt="QR pembayaran"
              className="h-full w-full object-contain"
            />
          ) : (
            <span className="text-xs text-brand-300">Belum ada QR</span>
          )}
        </div>

        <form action={updateQrImage} className="mt-4 flex flex-col gap-3">
          <input name="image" type="file" accept="image/*" required className="text-sm" />
          <button
            type="submit"
            className="brand-gradient rounded-xl px-4 py-2 text-sm font-medium text-white shadow-sm shadow-brand-300/40"
          >
            Simpan QR
          </button>
        </form>
      </div>
    </div>
  );
}
