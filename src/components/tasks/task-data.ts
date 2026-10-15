import type { IconName } from "@/components/ui/icon";

export type Task = { id: number; title: string; is_done: boolean };
export type TaskFilter = "all" | "pending" | "completed";
export type TaskBadge = { label: string; icon?: IconName; tone?: "danger" | "primary" | "success" };

export const initialTasks: Task[] = [
  { id: 1, title: "Làm bài tập lớn Lập trình Web", is_done: false },
  { id: 2, title: "Ôn thi giữa kỳ môn Giải tích 2", is_done: false },
  { id: 3, title: "Nộp báo cáo thực tập cơ sở", is_done: true },
  { id: 4, title: "Đọc chương 3 giáo trình Triết học Mác-Lênin", is_done: false },
];

// Decorative details from Stitch are separate from the exercise's task model.
export const taskDecorations: Record<number, { urgent?: boolean; badges: TaskBadge[] }> = {
  1: { urgent: true, badges: [{ label: "Hôm nay, 23:59", icon: "clock", tone: "danger" }, { label: "CNTT" }] },
  2: { badges: [{ label: "Toán", icon: "book", tone: "primary" }, { label: "Thứ Sáu tới", icon: "calendar" }] },
  3: { badges: [{ label: "Doanh nghiệp" }] },
  4: { badges: [{ label: "Lý luận", icon: "book" }, { label: "Chủ Nhật" }] },
};

export function validateTaskTitle(value: string): string {
  const title = value.trim();
  if (!title) return "Vui lòng nhập tên công việc.";
  if (title.length > 120) return "Tên công việc không được dài quá 120 ký tự.";
  return "";
}
