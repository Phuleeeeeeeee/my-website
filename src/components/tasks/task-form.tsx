"use client";

import { useRef, useState, type FormEvent } from "react";
import { Icon } from "@/components/ui/icon";
import { validateTaskTitle } from "@/components/tasks/task-data";

export function TaskForm({ onAdd }: { onAdd: (title: string) => void }) {
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = validateTaskTitle(title);
    setError(message);
    if (!message) {
      onAdd(title.trim());
      setTitle("");
    }
    inputRef.current?.focus();
  }

  return (
    <form onSubmit={handleSubmit} noValidate aria-label="Thêm công việc" className="card mb-6 flex flex-col gap-2 p-4">
      <label htmlFor="new-task" className="sr-only">Tên công việc</label>
      <div className="relative flex items-center">
        <Icon name="clipboard" className="pointer-events-none absolute left-3 size-5 text-outline" />
        <input ref={inputRef} id="new-task" type="text" value={title} onChange={(event) => { setTitle(event.target.value); setError(""); }} aria-invalid={Boolean(error)} aria-describedby={error ? "new-task-error" : undefined} placeholder="Nhập tên bài tập, đồ án, việc cần làm..." className="field border-transparent bg-surface-low pl-10 shadow-none" />
      </div>
      {error && <p id="new-task-error" role="alert" className="text-xs text-error">{error}</p>}
      <div className="flex items-center justify-between gap-2 pt-1">
        <p className="flex min-w-0 items-center gap-1.5 text-[11px] leading-4 font-medium text-muted"><Icon name="bulb" className="size-4 text-primary" /><span>Nhấn Enter để thêm nhanh</span></p>
        <button type="submit" className="primary-button shrink-0 gap-1.5 px-3 text-xs sm:px-4 sm:text-sm"><Icon name="plus" className="size-[18px]" />Thêm công việc</button>
      </div>
    </form>
  );
}
