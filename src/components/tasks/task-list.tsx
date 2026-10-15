"use client";

import { TaskItem } from "@/components/tasks/task-item";
import type { Task, TaskFilter } from "@/components/tasks/task-data";
import { Icon } from "@/components/ui/icon";

type TaskListProps = {
  tasks: Task[];
  filter: TaskFilter;
  onEdit: (id: number, title: string) => void;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
};

export function TaskList({ tasks, filter, onEdit, onToggle, onDelete }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <section role="status" className="card flex flex-col items-center px-4 py-8 text-center">
        <span className="mb-4 flex size-20 items-center justify-center rounded-full bg-surface-high text-primary"><Icon name="inbox" className="size-10" /></span>
        <h2 className="text-xl font-semibold">{filter === "all" ? "Chưa có công việc nào" : filter === "pending" ? "Không có công việc chưa xong" : "Chưa có công việc đã hoàn thành"}</h2>
        <p className="mt-2 max-w-xs text-sm text-muted">{filter === "all" ? "Hãy thêm nhiệm vụ học tập đầu tiên bằng ô nhập phía trên." : "Hãy chọn bộ lọc khác hoặc thêm công việc mới."}</p>
      </section>
    );
  }
  return <ul aria-label="Danh sách công việc" className="flex flex-col gap-2">{tasks.map((task) => <TaskItem key={task.id} task={task} onEdit={onEdit} onToggle={onToggle} onDelete={onDelete} />)}</ul>;
}
