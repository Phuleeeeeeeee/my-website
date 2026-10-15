"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <section
      aria-label="Đăng nhập sinh viên"
      className="card flex flex-col gap-4 p-6"
    >
      <p className="text-xs leading-5 text-muted">
        Giao diện minh họa Bài 1. Chưa có đăng nhập thật.
        Không nhập mật khẩu thật.
      </p>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="student-email"
            className="text-xs font-medium text-muted"
          >
            Email sinh viên
          </label>

          <div className="relative flex items-center">
            <Icon
              name="mail"
              className="pointer-events-none absolute left-3.5 size-5 text-outline"
            />

            <input
              id="student-email"
              type="email"
              autoComplete="off"
              placeholder="sinhvien@daihoc.edu.vn"
              defaultValue="nguyen.van.a@daihoc.edu.vn"
              className="field pl-11"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <label
              htmlFor="student-password"
              className="text-xs font-medium text-muted"
            >
              Mật khẩu
            </label>

            <button
              type="button"
              disabled
              className="min-h-6 text-[11px] font-semibold text-primary disabled:cursor-not-allowed disabled:opacity-60"
              title="Chưa hỗ trợ trong Bài 1"
            >
              Quên mật khẩu?
            </button>
          </div>

          <div className="relative flex items-center">
            <Icon
              name="lock"
              className="pointer-events-none absolute left-3.5 size-5 text-outline"
            />

            <input
              id="student-password"
              type={showPassword ? "text" : "password"}
              autoComplete="off"
              placeholder="Nhập mật khẩu mẫu"
              className="field pr-12 pl-11"
            />

            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              aria-pressed={showPassword}
              className="icon-button absolute right-0 text-outline"
            >
              <Icon name="eye" />
            </button>
          </div>
        </div>

        <label className="flex min-h-8 items-center gap-2 text-xs text-muted">
          <input
            type="checkbox"
            disabled
            className="size-4 accent-brand"
          />
          Ghi nhớ đăng nhập — chưa hỗ trợ
        </label>

        <button
          type="button"
          disabled
          className="primary-button mt-1 w-full disabled:cursor-not-allowed disabled:opacity-60"
        >
          Đăng nhập — bản mẫu
          <Icon name="arrow" className="size-[18px]" />
        </button>
      </div>

      <div className="flex items-center gap-3 py-1 text-[11px] font-semibold tracking-wider text-outline uppercase">
        <span className="h-px flex-1 bg-surface-high" />
        Hoặc tiếp tục với
        <span className="h-px flex-1 bg-surface-high" />
      </div>

      <button
        type="button"
        disabled
        title="Chưa hỗ trợ đăng nhập Google trong Bài 1"
        className="flex min-h-11 items-center justify-center gap-2.5 rounded bg-surface-low px-3 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-60"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="size-4 shrink-0"
        >
          <path
            fill="#4285F4"
            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
          />
        </svg>

        Google Nhà trường — chưa hỗ trợ
      </button>
    </section>
  );
}