import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

const port = Number(process.env.TEST_PORT || 3109);
const base = `http://127.0.0.1:${port}`;
mkdirSync('test-results', { recursive: true });
const database = path.resolve('test-results', `integration-${randomUUID()}.sqlite`);
let output = '';
const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', String(port)], {
  env: { ...process.env, STUDENT_DB_PATH: database }, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'],
});
server.stdout.on('data', chunk => { output += chunk; });
server.stderr.on('data', chunk => { output += chunk; });
let checks = 0;
function check(value, message) { assert.ok(value, message); checks++; console.log(`PASS ${message}`); }
async function client() {
  let cookie = '';
  return async (route, method = 'GET', body, expected = 200, origin = base) => {
    const response = await fetch(base + '/api/' + route, {
      method, headers: { 'Content-Type': 'application/json', Origin: origin, Cookie: cookie },
      ...(method === 'GET' ? {} : { body: JSON.stringify(body ?? {}) }),
    });
    if (response.headers.get('set-cookie')) cookie = response.headers.get('set-cookie').split(';')[0];
    const data = await response.json();
    assert.equal(response.status, expected, `${method} ${route}: ${JSON.stringify(data).slice(0,300)}`);
    checks++;
    return data;
  };
}
try {
  let ready = false;
  for (let i = 0; i < 100; i++) {
    if (server.exitCode !== null) throw new Error('Test server exited: ' + output);
    try { const r = await fetch(base + '/login'); if (r.status === 200) { ready = true; break; } } catch {}
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  assert.ok(ready, 'Test server started');
  const a = await client(), b = await client(), anonymous = await client();
  await anonymous('data', 'GET', undefined, 401);
  await a('auth/register', 'POST', { name: 'Kiểm thử A', email: 'a@example.test', password: 'Test-only-12345', sample: true }, 201);
  let data = await a('data');
  check(data.tasks.length === 7 && data.projects.length === 3 && data.habits.length === 3, 'Sample workspace is seeded transactionally');
  await b('auth/register', 'POST', { name: 'Kiểm thử B', email: 'b@example.test', password: 'Test-only-12345', sample: false }, 201);
  check((await b('data')).tasks.length === 0, 'New empty workspace has no other user data');
  const projectId = data.projects[0].id;
  const taskInput = { title: '  Công việc kiểm thử  ', notes: 'Ghi chú', status: 'todo', priority: 2, category: 'Học tập', due_date: '2026-10-20', estimate: 30, project_id: projectId };
  data = await a('tasks', 'POST', taskInput, 201);
  const task = data.tasks.find(t => t.title === 'Công việc kiểm thử');
  check(!!task && task.project_id === projectId, 'Task trim and project relation are persisted');
  await a('tasks', 'POST', { ...taskInput, title: '   ' }, 400);
  await a('tasks', 'POST', { ...taskInput, title: 'a'.repeat(121) }, 400);
  await a('tasks', 'POST', { ...taskInput, estimate: -1 }, 400);
  await a('tasks', 'POST', { ...taskInput, due_date: '2026-02-30' }, 400);
  await a('tasks', 'POST', taskInput, 403, 'https://untrusted.example');
  await b('tasks/' + task.id, 'PATCH', { title: 'Cross-account' }, 404);
  await b('tasks/' + task.id, 'DELETE', {}, 404);
  await b('tasks', 'POST', taskInput, 404);
  data = await a('tasks/' + task.id, 'PATCH', { status: 'done' });
  check(data.tasks.find(t => t.id === task.id).completed_at !== null, 'Completion timestamp follows task status');
  data = await a('tasks/' + task.id, 'PATCH', { status: 'doing', title: 'Đã sửa' });
  check(data.tasks.find(t => t.id === task.id).completed_at === null, 'Reopening clears completion timestamp');
  data = await a('projects', 'POST', { name: 'Dự án test', description: 'Mô tả', color: 'blue', due_date: null }, 201);
  const project = data.projects.find(p => p.name === 'Dự án test');
  await a('projects/' + project.id, 'PATCH', { name: 'Dự án đã sửa', description: '', color: 'green', due_date: '2026-11-01' });
  await a('tasks/' + task.id, 'PATCH', { project_id: project.id });
  data = await a('projects/' + project.id, 'DELETE');
  check(data.tasks.find(t => t.id === task.id).project_id === null, 'Deleting project preserves its tasks');
  const event = { title: 'Buổi học test', kind: 'study', start_at: '2026-10-20T02:00:00.000Z', end_at: '2026-10-20T03:00:00.000Z', location: 'C205', notes: '' };
  await a('events', 'POST', { ...event, end_at: event.start_at }, 400);
  data = await a('events', 'POST', event, 201);
  const eventId = data.events.find(e => e.title === event.title).id;
  await a('events/' + eventId, 'PATCH', { ...event, title: 'Đã đổi lịch' });
  await b('events/' + eventId, 'DELETE', {}, 404);
  await a('events/' + eventId, 'DELETE');
  data = await a('habits', 'POST', { title: 'Thói quen test' }, 201);
  const habit = data.habits.find(h => h.title === 'Thói quen test');
  data = await a(`habits/${habit.id}/toggle`, 'POST', { day: '2026-10-15' }, 201);
  check(data.habitLogs.some(l => l.habit_id === habit.id), 'Habit check-in stored');
  await b(`habits/${habit.id}/toggle`, 'POST', { day: '2026-10-15' }, 404);
  data = await a(`habits/${habit.id}/toggle`, 'POST', { day: '2026-10-15' }, 201);
  check(!data.habitLogs.some(l => l.habit_id === habit.id), 'Habit check-in can be undone');
  await a('habits/' + habit.id, 'DELETE');
  await a('focus/start', 'POST', { task_id: task.id, minutes: 1 }, 201);
  await a('focus/start', 'POST', { task_id: null, minutes: 25 }, 409);
  await new Promise(resolve => setTimeout(resolve, 1200));
  data = await a('focus/pause', 'POST', {}, 201);
  const paused = data.focus.find(f => f.status === 'paused');
  check(paused.elapsed_seconds >= 1 && paused.last_started_at === null, 'Focus elapsed time is measured by server');
  const reloaded = await a('data');
  check(reloaded.focus.find(f => f.id === paused.id).status === 'paused', 'Focus state survives data reload');
  await a('focus/resume', 'POST', {}, 201);
  data = await a('focus/finish', 'POST', {}, 201);
  check(data.focus.find(f => f.id === paused.id).status === 'completed', 'Completed focus session enters history');
  await a('focus/finish', 'POST', {}, 409);
  await a('reviews', 'POST', { week_start: '2026-10-12', wins: 'Đã hoàn thành', improvements: 'Ngủ sớm' }, 201);
  data = await a('reviews', 'POST', { week_start: '2026-10-12', wins: 'Cập nhật', improvements: '' }, 201);
  check(data.reviews.length === 1 && data.reviews[0].wins === 'Cập nhật', 'Weekly review upsert does not duplicate records');
  const exported = await a('export');
  check(!JSON.stringify(exported).includes('password_hash') && !('sessions' in exported), 'Export excludes authentication secrets');
  await a('tasks/' + task.id, 'DELETE');
  data = await a('data');
  check(!data.tasks.some(t => t.id === task.id) && data.focus.find(f => f.id === paused.id).task_id === null, 'Task deletion preserves focus history');
  await a('auth/logout', 'POST');
  await a('data', 'GET', undefined, 401);
  await a('auth/login', 'POST', { email: 'a@example.test', password: 'Wrong-password' }, 401);
  await a('auth/login', 'POST', { email: 'a@example.test', password: 'Test-only-12345' });
  check((await a('data')).reviews[0].wins === 'Cập nhật', 'Data survives sign out and sign in');
  console.log(`\n${checks} checks passed. Isolated test database only.`);
} catch (error) {
  console.error(error); console.error(output.slice(-6000)); process.exitCode = 1;
} finally {
  server.kill();
  await new Promise(resolve => { if (server.exitCode !== null) resolve(); else { server.once('exit', resolve); setTimeout(resolve,3000).unref(); } });
  for (const suffix of ['', '-wal', '-shm']) { try { rmSync(database + suffix, { force: true }); } catch {} }
}
