"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";

export function AlertBanner({ login = false }: { login?: boolean }) {
  const [visible, setVisible] = useState(false);

  if (!visible) {
    return (
      <button
        type="button"
        onClick={() => setVisible(true)}
        className="min-h-11 rounded-lg border border-primary/20 px-3 text-sm font-semibold text-primary"
      >
        Xem lỗi mẫu
      </button>
    );
  }

  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-lg bg-error-soft p-4 text-error"
    >
      <Icon
        name={login ? "error" : "wifi"}
        className="mt-0.5 size-5"
      />

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">
          {login
            ? "Mô phỏng lỗi đăng nhập"
            : "Mô phỏng lỗi đồng bộ dữ liệu"}
        </p>

        <p className="mt-1 text-xs leading-5">
          Đây là trạng thái minh họa cho Bài 1.
          Ứng dụng chưa kết nối hệ thống đăng nhập hoặc cơ sở dữ liệu.
        </p>
      </div>

      <button
        type="button"
        onClick={() => setVisible(false)}
        aria-label="Đóng thông báo"
        className="icon-button text-muted"
      >
        <Icon name="close" className="size-[18px]" />
      </button>
    </div>
  );
}