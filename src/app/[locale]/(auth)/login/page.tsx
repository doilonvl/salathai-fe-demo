/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { z } from "zod";
import Image from "next/image";

const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
});

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = String(params?.locale || "vi");

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Dữ liệu không hợp lệ");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: parsed.data.email, password: parsed.data.password }),
        credentials: "include",
      });

      if (res.status === 429) {
        throw new Error("Bạn đang gửi quá nhiều yêu cầu. Vui lòng đợi một lát.");
      }

      if (!res.ok) {
        const data = await safeJson(res);
        throw new Error(data?.message || "Đăng nhập thất bại");
      }

      const nextUrl = searchParams.get("next") || `/${locale}/admin`;
      router.replace(nextUrl);
    } catch (err: any) {
      setError(err?.message || "Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/Marquee/slide-1.jpg"
          alt="SalaThai background"
          fill
          className="object-cover"
          priority
          sizes="100vw"
          quality={85}
        />
        <div className="absolute inset-0 bg-black/75" />
      </div>

      {/* Login panel */}
      <div className="relative z-10 w-full max-w-md px-8 py-16">
        {/* Logo / brand */}
        <div className="text-center mb-12">
          <span className="text-sala-accent tracking-[0.6em] uppercase text-[10px] font-black block mb-4">
            Authentic Thai Cuisine
          </span>
          <h1 className="text-5xl font-serif text-white tracking-tight leading-none mb-2">
            SalaThai
          </h1>
          <div className="w-12 h-[1px] bg-sala-accent mx-auto mt-6" />
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-8">
          <div>
            <label
              htmlFor="email"
              className="block text-[10px] font-black uppercase tracking-[0.4em] text-white/50 mb-3"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              placeholder="admin@salathai.com.vn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-transparent border-b border-white/20 text-white placeholder:text-white/25 py-3 focus:outline-none focus:border-sala-accent transition-colors text-base font-light"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-[10px] font-black uppercase tracking-[0.4em] text-white/50 mb-3"
            >
              Mật khẩu
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-transparent border-b border-white/20 text-white placeholder:text-white/25 py-3 focus:outline-none focus:border-sala-accent transition-colors text-base font-light"
            />
          </div>

          {error ? (
            <p className="text-[11px] text-red-400 tracking-wide">{error}</p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-5 bg-sala-accent text-stone-900 tracking-[0.4em] uppercase text-[10px] font-black hover:bg-white transition-all duration-500 shadow-2xl disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        {/* Decorative bottom line */}
        <div className="mt-16 text-center">
          <div className="w-[1px] h-12 bg-gradient-to-b from-white/20 to-transparent mx-auto" />
        </div>
      </div>
    </div>
  );
}

async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}
