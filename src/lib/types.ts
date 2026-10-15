export type User = { id: string; name: string; email: string };
export type Task = { id: string; title: string; notes: string; status: 'todo' | 'doing' | 'done'; priority: number; category: string; due_date: string | null; estimate: number; project_id: string | null; completed_at: string | null; created_at: string };
export type Project = { id: string; name: string; description: string; color: string; due_date: string | null };
export type CalendarEvent = { id: string; title: string; kind: string; start_at: string; end_at: string; location: string; notes: string };
export type FocusSession = { id: string; task_id: string | null; planned_minutes: number; elapsed_seconds: number; status: 'running' | 'paused' | 'completed'; started_at: string; last_started_at: string | null; finished_at: string | null };
export type Habit = { id: string; title: string };
export type Snapshot = { user: User; tasks: Task[]; projects: Project[]; events: CalendarEvent[]; focus: FocusSession[]; habits: Habit[]; habitLogs: { habit_id: string; day: string }[]; reviews: { week_start: string; wins: string; improvements: string }[] };
export const categories = ['Học tập', 'Dự án', 'Ngoại ngữ', 'Cá nhân'];
export const statuses = { todo: 'Cần làm', doing: 'Đang làm', done: 'Hoàn thành' };
export const eventKinds: Record<string, string> = { class: 'Lớp học', study: 'Tự học', exam: 'Kỳ thi', personal: 'Cá nhân', break: 'Nghỉ ngơi' };
export function dayKey(date = new Date()) { return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`; }
export function shiftDay(day: string, offset: number) { const d = new Date(day + 'T12:00:00'); d.setDate(d.getDate() + offset); return dayKey(d); }
export function weekStart(day = dayKey()) { const d = new Date(day + 'T12:00:00'); return shiftDay(day, -((d.getDay()+6)%7)); }
export function focusSeconds(session: FocusSession, now: number) { return session.elapsed_seconds + (session.status === 'running' && session.last_started_at ? Math.max(0, Math.floor((now - Date.parse(session.last_started_at))/1000)) : 0); }
