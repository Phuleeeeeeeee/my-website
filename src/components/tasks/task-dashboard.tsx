"use client";

import { useRef, useState } from "react";
import {
  initialTasks,
  validateTaskTitle,
  type Task,
  type TaskFilter,
} from "@/components/tasks/task-data";
import { AppHeader } from "@/components/app-header";
import { AppNavigation } from "@/components/app-navigation";
import { TaskForm } from "@/components/tasks/task-form";
import { TaskList } from "@/components/tasks/task-list";
import { AlertBanner } from "@/components/ui/alert-banner";
import { Icon } from "@/components/ui/icon";

type PreviewState = "normal" | "empty" | "loading";

export function TaskDashboard() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [filter, setFilter] = useState<TaskFilter>("all");
  const [preview, setPreview] = useState<PreviewState>("normal");

  const nextId = useRef(
    Math.max(0, ...initialTasks.map((task) => task.id)) + 1
  );

  const completedCount = tasks.filter((task) => task.is_done).length;

  const filters: {
    value: TaskFilter;
    label: string;
    count: number;
  }[] = [
    {
      value: "all",
      label: "Tất cả",
      count: tasks.length,
    },
    {
      value: "pending",
      label: "Chưa xong",
      count: tasks.length - completedCount,
    },
    {
      value: "completed",
      label: "Đã xong",
      count: completedCount,
    },
  ];

  const visibleTasks = tasks.filter((task) => {
    if (filter === "all") return true;
    if (filter === "completed") return task.is_done;
    return !task.is_done;
  });

  function addTask(value: string) {
    if (validateTaskTitle(value)) return;

    const task: Task = {
      id: nextId.current++,
      title: value.trim(),
      is_done: false,
    };

    setTasks((current) => [task, ...current]);
    setFilter("all");
    setPreview("normal");
  }

  function editTask(id: number, value: string) {
    if (validateTaskTitle(value)) return;

    setTasks((current) =>
      current.map((task) =>
        task.id === id ? { ...task, title: value.trim() } : task
      )
    );
  }

  function toggleTask(id: number) {
    setTasks((current) =>
      current.map((task) =>
        task.id === id ? { ...task, is_done: !task.is_done } : task
      )
    );
  }

  function deleteTask(id: number) {
    const task = tasks.find((item) => item.id === id);

    if (
      task &&
      window.confirm(`Bạn có chắc muốn xóa công việc “${task.title}”?`)
    ) {
      setTasks((current) => current.filter((item) => item.id !== id));
    }
  }

  return (
    <>
      <AppHeader />
      <AppNavigation />

      <main className="min-h-dvh min-w-0 pt-[calc(64px+env(safe-area-inset-top))] pb-[calc(96px+env(safe-area-inset-bottom))] md:ml-[72px] md:pb-10 lg:ml-[260px]">
        <div className="mx-auto max-w-[1040px] px-4 md:px-6 lg:px-8 lg:pt-4">
          <div className="mb-2 flex items-center justify-between gap-2 py-2">
            <p className="flex min-w-0 items-center gap-1.5 text-[11px] font-semibold text-muted">
              <span className="size-2.5 shrink-0 rounded-full bg-success" />
              <span>Học kỳ 2 · Năm học 2024-2025</span>
            </p>

            <button
              type="button"
              disabled
              title="Chưa có đăng nhập thật trong Bài 1"
              className="flex min-h-9 shrink-0 items-center gap-1.5 rounded-lg bg-surface-low px-2 text-[11px] font-medium text-muted disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Icon name="logout" className="size-4" />
              Đăng xuất
            </button>
          </div>

          <div className="mb-4">
            <AlertBanner />
          </div>

          <TaskForm onAdd={addTask} />

          <section
            aria-label="Bộ lọc công việc"
            className="mb-4 flex flex-wrap items-center justify-between gap-2"
          >
            <div className="flex min-w-0 flex-1 rounded-lg bg-surface-high p-1 shadow-inner sm:max-w-xs">
              {filters.map(({ value, label, count }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setFilter(value);
                    setPreview("normal");
                  }}
                  aria-pressed={filter === value}
                  className={`flex min-h-8 flex-1 items-center justify-center gap-1 rounded px-1 text-[11px] font-semibold whitespace-nowrap ${
                    filter === value
                      ? "bg-white text-primary shadow-sm"
                      : "text-muted"
                  }`}
                >
                  {label}

                  <span
                    className={`rounded-xl px-1.5 text-[10px] ${
                      filter === value
                        ? "bg-primary-soft"
                        : "bg-surface-container"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex shrink-0 gap-1">
              <button
                type="button"
                onClick={() => setPreview("empty")}
                aria-label="Xem trạng thái rỗng"
                aria-pressed={preview === "empty"}
                title="Xem trạng thái rỗng"
                className={`icon-button size-9 ${
                  preview === "empty"
                    ? "bg-primary-soft text-primary"
                    : "bg-surface-container text-muted"
                }`}
              >
                <Icon name="inbox" className="size-[18px]" />
              </button>

              <button
                type="button"
                onClick={() => setPreview("loading")}
                aria-label="Xem trạng thái đang tải"
                aria-pressed={preview === "loading"}
                title="Xem trạng thái đang tải"
                className={`icon-button size-9 ${
                  preview === "loading"
                    ? "bg-primary-soft text-primary"
                    : "bg-surface-container text-muted"
                }`}
              >
                <Icon name="hourglass" className="size-[18px]" />
              </button>
            </div>
          </section>

          {preview !== "normal" && (
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-surface-low p-3">
              <p className="text-xs leading-5 text-muted">
                Đang xem trạng thái minh họa. Dữ liệu công việc được giữ nguyên.
              </p>

              <button
                type="button"
                onClick={() => setPreview("normal")}
                className="min-h-11 rounded border border-primary/20 px-3 text-sm font-semibold text-primary hover:bg-white"
              >
                Quay lại danh sách
              </button>
            </div>
          )}

          {preview === "loading" ? (
            <section
              role="status"
              aria-live="polite"
              className="card flex flex-col items-center gap-3 px-4 py-8 text-center"
            >
              <Icon
                name="hourglass"
                className="size-10 text-primary motion-safe:animate-pulse"
              />

              <h2 className="text-xl font-semibold">
                Đang tải công việc…
              </h2>

              <p className="max-w-xs text-sm leading-5 text-muted">
                Đây là trạng thái mô phỏng của Bài 1. Nhấn “Quay lại danh
                sách” để tiếp tục.
              </p>
            </section>
          ) : (
            <TaskList
              tasks={preview === "empty" ? [] : visibleTasks}
              filter={preview === "empty" ? "all" : filter}
              onEdit={editTask}
              onToggle={toggleTask}
              onDelete={deleteTask}
            />
          )}

          <p className="mt-6 flex items-center justify-center gap-1 text-center text-xs leading-4 text-outline">
            <Icon name="award" className="size-4 text-success" />
            Mỗi nhiệm vụ hoàn thành đưa bạn gần hơn tới mục tiêu kỳ này!
          </p>
        </div>
      </main>
    </>
  );
}