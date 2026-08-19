import Image from "next/image";
import LoginForm from "./login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 via-white to-brand-100 px-4">
      <div className="w-full max-w-sm rounded-3xl border border-brand-100 bg-white p-8 shadow-xl shadow-brand-200/40">
        <div className="flex flex-col items-center text-center">
          <Image src="/mascot-icon.png" alt="" width={64} height={64} className="h-16 w-16" />
          <h1 className="mt-3 font-display text-2xl font-semibold text-brand-800">
            Beyond Logos
          </h1>
          <p className="mt-1 text-sm text-muted">
            Masuk pakai akun yang sudah dibuatkan admin circle.
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
