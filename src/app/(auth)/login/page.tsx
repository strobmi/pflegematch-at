import LoginForm from "@/components/dashboard/auth/LoginForm";

export const metadata = { title: "Login · pflegematch AT" };

export default function LoginPage() {
  return (
    <div className="w-full max-w-md bg-white rounded-3xl border border-[#EAD9C8] shadow-xl shadow-[#C06B4A]/5 p-8">
      <h1 className="text-2xl font-bold text-[#2D2D2D] mb-1">Willkommen zurück</h1>
      <p className="text-sm text-[#2D2D2D]/55 mb-6">Melden Sie sich in Ihrem Konto an</p>
      <LoginForm />
    </div>
  );
}
