import Link from "next/link";
import { Icon, type IconName } from "@/components/ui/icon";

const entries: { label: string; icon: IconName }[] = [
  { label: "Nhiệm vụ", icon: "tasks" },
  { label: "Môn học", icon: "book" },
  { label: "Lịch biểu", icon: "calendar" },
  { label: "Ghi chú", icon: "edit" },
];

export function AppNavigation() {
  return (
    <nav
      aria-label="Điều hướng chính"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-surface-low bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:top-16 md:right-auto md:w-[72px] md:border-t-0 md:border-r lg:w-[260px]"
    >
      <div className="flex justify-around px-1 md:flex-col md:gap-3 md:px-2 md:py-6 lg:px-4">
        {entries.map(({ label, icon }, index) => {
          const isTasks = index === 0;

          const classes = [
            "flex min-h-16 min-w-11 flex-1 flex-col",
            "items-center justify-center gap-1 rounded-lg px-2",
            "md:min-h-12 md:flex-none",
            "lg:flex-row lg:justify-start lg:gap-3 lg:px-4",
            isTasks
              ? "text-primary md:bg-surface-high"
              : "cursor-not-allowed text-muted opacity-50",
          ].join(" ");

          const content = (
            <>
              <Icon name={icon} className="size-[22px]" />

              <span className="text-[11px] font-medium md:hidden lg:block lg:text-sm">
                {label}
              </span>

              {!isTasks && (
                <span className="text-[9px] md:hidden lg:ml-auto lg:block">
                  Chưa hỗ trợ
                </span>
              )}
            </>
          );

          if (isTasks) {
            return (
              <Link
                key={label}
                href="/tasks"
                aria-current="page"
                aria-label={label}
                className={classes}
              >
                {content}
              </Link>
            );
          }

          return (
            <button
              key={label}
              type="button"
              disabled
              aria-label={`${label} — chưa hỗ trợ trong Bài 1`}
              title={`${label} chưa được triển khai trong Bài 1`}
              className={classes}
            >
              {content}
            </button>
          );
        })}
      </div>

      <p className="absolute right-6 bottom-8 left-6 hidden text-xs leading-5 text-outline lg:block">
        Từng bước nhỏ hôm nay,
        <br />
        vững vàng hơn ngày mai.
      </p>
    </nav>
  );
}