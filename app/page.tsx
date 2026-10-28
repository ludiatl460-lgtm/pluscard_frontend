"use client";

import { useState } from "react";
import {
  ArrowRight,
  CreditCard,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { AuthLogin } from "@/auth/AuthLogin";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loading) return;

    try {
      setLoading(true);
      await AuthLogin(username, password);
      router.replace('/dashboard')
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-dvh items-center justify-center bg-slate-100 px-4 py-8">
      <section className="w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-6 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-950 text-white">
              <CreditCard size={23} />
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-wide text-slate-900">
                PLUS CARD
              </h1>
              <p className="mt-0.5 text-sm text-slate-500">
                ລະບົບທຽບຍອດທຸລະກຳ
              </p>
            </div>
          </div>
        </div>
        <div className="px-6 py-7 sm:px-8 sm:py-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="username"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                ຊື່ຜູ້ໃຊ້
              </label>

              <div className="flex items-center gap-3 rounded-lg border border-slate-300 bg-white px-3.5 transition-colors focus-within:border-indigo-900 focus-within:ring-2 focus-within:ring-indigo-900/10">
                <UserRound size={18} className="shrink-0 text-slate-400" />

                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  placeholder="ປ້ອນຊື່ຜູ້ໃຊ້"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={loading}
                  className="h-12 w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                ລະຫັດຜ່ານ
              </label>

              <div className="flex items-center gap-3 rounded-lg border border-slate-300 bg-white px-3.5 transition-colors focus-within:border-indigo-900 focus-within:ring-2 focus-within:ring-indigo-900/10">
                <LockKeyhole size={18} className="shrink-0 text-slate-400" />

                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="ປ້ອນລະຫັດຜ່ານ"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="h-12 w-full min-w-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={
                    showPassword
                      ? "ເຊື່ອງລະຫັດຜ່ານ"
                      : "ສະແດງລະຫັດຜ່ານ"
                  }
                  className="shrink-0 text-slate-400 transition-colors hover:text-indigo-900"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 pt-1">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 accent-indigo-900 focus:ring-indigo-900"
                />
                ຈື່ຂ້ອຍໄວ້
              </label>

              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <ShieldCheck size={15} className="text-indigo-900" />
                ລະບົບປອດໄພ
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-indigo-900 px-5 text-sm font-semibold text-white transition-colors hover:bg-indigo-800 focus:outline-none focus:ring-4 focus:ring-indigo-900/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "ກຳລັງເຂົ້າສູ່ລະບົບ..." : "ເຂົ້າສູ່ລະບົບ"}

              {!loading && <ArrowRight size={18} />}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}