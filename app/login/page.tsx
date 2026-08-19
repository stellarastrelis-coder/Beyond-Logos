import LoginForm from "./login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-neutral-900">Circle Booth</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Masuk pakai akun yang sudah dibuatkan admin circle.
        </p>
        <LoginForm />
      </div>
    </div>
  );
}
