import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";

export function AppHeader({ login = false }: { login?: boolean }) {
  return (
    <header className="fixed inset-x-0 top-0 z-30 border-b border-surface-low bg-surface/90 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-2 px-4 lg:px-8">
        <div className="flex min-w-0 items-center gap-2">
          {login && <Link href="/tasks" aria-label="Xem công việc" className="icon-button -ml-2"><Icon name="back" /></Link>}
          <Image src="/logo.svg" alt="" width={32} height={32} className="shrink-0" />
          <div className="min-w-0">
            <p className="text-[11px] font-semibold tracking-wide text-primary uppercase">Việc học của tôi</p>
            <h1 className="truncate text-xl leading-7 font-semibold">{login ? "Đăng nhập" : "Danh Sách Nhiệm Vụ"}</h1>
          </div>
        </div>
        <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary text-white" aria-label="Tài khoản sinh viên"><Icon name="user" className="size-[18px]" /></span>
      </div>
    </header>
  );
}
