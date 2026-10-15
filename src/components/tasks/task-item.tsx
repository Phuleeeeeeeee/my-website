"use client";

import { useRef, useState, type FormEvent } from "react";
import { Icon } from "@/components/ui/icon";
import { taskDecorations, validateTaskTitle, type Task, type TaskBadge } from "@/components/tasks/task-data";

const badgeColors = {
  danger: "bg-danger-soft text-[#40000d]",
  primary: "bg-primary-soft text-[#00174b]",
  success: "bg-success-soft text-[#00714d]",
};

type TaskItemProps = {
  task: Task;
  onEdit: (id: number, title: string) => void;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
};

export function TaskItem({ task, onEdit, onToggle, onDelete }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(task.title);
  const [error, setError] = useState("");
  const editButtonRef = useRef<HTMLButtonElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const decoration = taskDecorations[task.id];
  const badges: TaskBadge[] = task.is_done
    ? [{ label: "Đã hoàn tất", icon: "tasks", tone: "success" }, ...(decoration?.badges.filter((badge) => !badge.icon) ?? [])]
    : decoration?.badges ?? [{ label: "Mới tạo", icon: "clock" }];

  function stopEditing() {
    setIsEditing(false);
    setError("");
    editButtonRef.current?.focus();
  }

  function saveTitle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = validateTaskTitle(draft);
    setError(message);
    if (message) {
      editInputRef.current?.focus();
      return;
    }
    onEdit(task.id, draft.trim());
    stopEditing();
  }

  return (
    <li data-testid="task-item">
      <article className={`card relative flex items-center justify-between gap-1 p-4 ${task.is_done ? "bg-white/60" : ""}`}>
        <span className={`absolute inset-y-2 left-0 w-1 rounded-r-xl ${task.is_done ? "bg-success" : decoration?.urgent ? "bg-danger" : "bg-brand"}`} />
        <div className="flex min-w-0 flex-1 items-start gap-2">
          <label className="-m-2 relative flex size-9 shrink-0 cursor-pointer items-center justify-center">
            <input type="checkbox" checked={task.is_done} onChange={() => onToggle(task.id)} aria-label={`Hoàn thành: ${task.title}`} className="peer size-5 appearance-none rounded bg-surface-high checked:bg-success focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand" />
            <Icon name="check" className="pointer-events-none absolute size-4 text-white opacity-0 peer-checked:opacity-100" />
          </label>
          <div className="min-w-0 flex-1">
            {isEditing ? (
              <form onSubmit={saveTitle} onKeyDown={(event) => { if (event.key === "Escape") { event.preventDefault(); stopEditing(); } }} noValidate className="mb-2">
                <label htmlFor={`edit-task-${task.id}`} className="mb-1 block text-xs font-medium text-muted">Tên công việc</label>
                <input ref={editInputRef} autoFocus id={`edit-task-${task.id}`} value={draft} onChange={(event) => { setDraft(event.target.value); setError(""); }} aria-invalid={Boolean(error)} aria-describedby={error ? `edit-error-${task.id}` : undefined} className="field" />
                {error && <p id={`edit-error-${task.id}`} role="alert" className="mt-1 text-xs text-error">{error}</p>}
                <div className="mt-2 flex flex-wrap gap-2">
                  <button type="submit" className="primary-button px-3">Lưu</button>
                  <button type="button" onClick={stopEditing} className="min-h-11 rounded border border-surface-high px-3 text-sm text-muted">Hủy</button>
                </div>
              </form>
            ) : (
              <h2 title={task.title} className={`truncate text-sm leading-5 font-medium ${task.is_done ? "text-outline line-through" : "text-ink"}`}>{task.title}</h2>
            )}
            <div className="mt-1 flex flex-wrap items-center gap-1">
              {badges.map((badge) => <span key={badge.label} className={`inline-flex items-center gap-1 rounded-xl px-2 py-0.5 text-[11px] leading-[14px] font-semibold ${badge.tone ? badgeColors[badge.tone] : "bg-surface-container text-muted"}`}>{badge.icon && <Icon name={badge.icon} className="size-[13px]" />}{badge.label}</span>)}
            </div>
          </div>
        </div>
        <div className="-mr-2 flex shrink-0 items-center">
          <button ref={editButtonRef} type="button" onClick={() => { setDraft(task.title); setError(""); setIsEditing(true); }} aria-label={`Sửa: ${task.title}`} title="Sửa công việc" className="icon-button size-9 text-muted"><Icon name="edit" className="size-[18px]" /></button>
          <button type="button" onClick={() => onDelete(task.id)} aria-label={`Xóa: ${task.title}`} title="Xóa công việc" className="icon-button size-9 text-danger"><Icon name="trash" className="size-[18px]" /></button>
        </div>
      </article>
    </li>
  );
}
