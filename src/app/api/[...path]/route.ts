import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { db, seedWorkspace, transaction } from '@/lib/db';
import { createSession, currentUser, hashPassword, logout, verifyPassword } from '@/lib/auth';
import { categories, eventKinds, focusSeconds, type FocusSession } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
class ApiError extends Error { constructor(message: string, public status = 400) { super(message); } }
type Body = Record<string, unknown>;
function string(b: Body, key: string, max: number, required = false) {
  const value = b[key] ?? '';
  if (typeof value !== 'string' || value.trim().length > max || (required && !value.trim())) throw new ApiError(`Vui lòng kiểm tra trường ${key} (tối đa ${max} ký tự).`);
  return value.trim();
}
function integer(b: Body, key: string, min: number, max: number) {
  const v = b[key]; if (typeof v !== 'number' || !Number.isInteger(v) || v < min || v > max) throw new ApiError(`${key} phải từ ${min} đến ${max}.`); return v;
}
function date(b: Body, key: string, required = false) {
  const v = string(b,key,10,required);
  if (!v) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v) || !Number.isFinite(Date.parse(v)) || new Date(v).toISOString().slice(0,10)!==v) throw new ApiError('Ngày không hợp lệ.');
  return v;
}
function choice(b: Body, key: string, choices: string[]) { const v = string(b,key,80,true); if (!choices.includes(v)) throw new ApiError('Lựa chọn không hợp lệ.'); return v; }
function owned(table: 'tasks'|'projects'|'events'|'habits'|'focus_sessions', id: string, user: string) {
  const row = db().prepare(`SELECT * FROM ${table} WHERE id=? AND user_id=?`).get(id,user);
  if (!row) throw new ApiError('Không tìm thấy dữ liệu.',404);
  return row;
}
function snapshot(user: {id:string;name:string;email:string}) {
  const data = db();
  return {
    user,
    tasks: data.prepare('SELECT * FROM tasks WHERE user_id=? ORDER BY created_at DESC, id').all(user.id),
    projects: data.prepare('SELECT * FROM projects WHERE user_id=? ORDER BY created_at, id').all(user.id),
    events: data.prepare('SELECT * FROM events WHERE user_id=? ORDER BY start_at').all(user.id),
    focus: data.prepare('SELECT * FROM focus_sessions WHERE user_id=? ORDER BY started_at DESC').all(user.id),
    habits: data.prepare('SELECT * FROM habits WHERE user_id=? ORDER BY created_at, id').all(user.id),
    habitLogs: data.prepare('SELECT l.* FROM habit_logs l JOIN habits h ON h.id=l.habit_id WHERE h.user_id=?').all(user.id),
    reviews: data.prepare('SELECT week_start,wins,improvements FROM weekly_reviews WHERE user_id=? ORDER BY week_start DESC').all(user.id),
  };
}
async function handle(request: NextRequest, context: {params: Promise<{path: string[]}>}) {
  try {
    const parts = (await context.params).path; const [resource,id,action] = parts;
    const method = request.method;
    if (method !== 'GET') {
      // Next may normalize request.url to localhost even when the browser uses 127.0.0.1.
      // Compare the browser Origin to the actual HTTP Host, never a forwarded header.
      const expectedOrigin = `${new URL(request.url).protocol}//${request.headers.get('host')}`;
      if (request.headers.get('origin') !== expectedOrigin) throw new ApiError('Nguồn yêu cầu không hợp lệ.',403);
      if (!request.headers.get('content-type')?.includes('application/json')) throw new ApiError('Yêu cầu cần ở dạng JSON.',415);
    }
    let body: Body = {};
    if (method !== 'GET') {
      const text = await request.text(); if (text.length > 20000) throw new ApiError('Dữ liệu quá lớn.',413);
      try { body = JSON.parse(text || '{}'); } catch { throw new ApiError('Dữ liệu JSON không hợp lệ.'); }
      if (!body || typeof body !== 'object' || Array.isArray(body)) throw new ApiError('Dữ liệu không hợp lệ.');
    }
    const now = new Date().toISOString();
    if (resource === 'auth' && method === 'POST') {
      if (id === 'logout') { await logout(); return NextResponse.json({ok:true}); }
      if (!['login','register'].includes(id)) throw new ApiError('Không tìm thấy.',404);
      const email = string(body,'email',254,true).toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ApiError('Email không hợp lệ.');
      const password = body.password;
      if (typeof password !== 'string' || password.length < 8 || password.length > 128) throw new ApiError('Mật khẩu cần từ 8 đến 128 ký tự.');
      const attempt = db().prepare('SELECT * FROM auth_attempts WHERE email=?').get(email) as {attempts:number;window_start:number}|undefined;
      if (attempt && Date.now()-attempt.window_start < 600000 && attempt.attempts>=10) throw new ApiError('Bạn thử quá nhiều lần. Vui lòng quay lại sau 10 phút.',429);
      if (!attempt || Date.now()-attempt.window_start>=600000) db().prepare('INSERT OR REPLACE INTO auth_attempts VALUES (?,1,?)').run(email,Date.now());
      else db().prepare('UPDATE auth_attempts SET attempts=attempts+1 WHERE email=?').run(email);
      let userId: string;
      if (id === 'register') {
        const name = string(body,'name',80,true);
        if (db().prepare('SELECT id FROM users WHERE email=?').get(email)) throw new ApiError('Email này đã được sử dụng. Hãy đăng nhập.',409);
        const passwordHash = await hashPassword(password); userId = randomUUID();
        transaction(() => {
          db().prepare('INSERT INTO users (id,name,email,password_hash) VALUES (?,?,?,?)').run(userId,name,email,passwordHash);
          if (body.sample === true) seedWorkspace(userId);
        });
      } else {
        const user = db().prepare('SELECT id,password_hash FROM users WHERE email=?').get(email) as {id:string;password_hash:string}|undefined;
        const valid = await verifyPassword(password,user?.password_hash ?? `${'0'.repeat(32)}:${'0'.repeat(128)}`);
        if (!user || !valid) throw new ApiError('Email hoặc mật khẩu chưa đúng.',401);
        userId = user.id;
      }
      db().prepare('DELETE FROM auth_attempts WHERE email=?').run(email);
      await createSession(userId,new URL(request.url).protocol === 'https:');
      return NextResponse.json({ok:true}, {status:id==='register'?201:200});
    }
    const user = await currentUser(); if (!user) throw new ApiError('Vui lòng đăng nhập để tiếp tục.',401);
    if (method === 'GET' && resource === 'data') return NextResponse.json(snapshot(user),{headers:{'Cache-Control':'no-store'}});
    if (method === 'GET' && resource === 'export') return new NextResponse(JSON.stringify({version:1,exported_at:now,...snapshot(user)},null,2),{headers:{'Content-Type':'application/json','Content-Disposition':'attachment; filename="student-os-backup.json"','Cache-Control':'no-store'}});
    if (resource === 'tasks' && ['POST','PATCH','DELETE'].includes(method)) {
      if (method !== 'POST') owned('tasks',id,user.id);
      if (method === 'DELETE') db().prepare('DELETE FROM tasks WHERE id=? AND user_id=?').run(id,user.id);
      else {
        const old = method === 'PATCH' ? owned('tasks',id,user.id) : {};
        const b = {...old,...body};
        const title=string(b,'title',120,true),notes=string(b,'notes',4000),status=choice(b,'status',['todo','doing','done']),priority=integer(b,'priority',1,4),category=choice(b,'category',categories),due=date(b,'due_date'),estimate=integer(b,'estimate',5,1440);
        const project=string(b,'project_id',80) || null; if(project) owned('projects',project,user.id);
        const completed=status==='done' ? (old.completed_at as string || now) : null;
        if(method==='POST') db().prepare('INSERT INTO tasks VALUES (?,?,?,?,?,?,?,?,?,?,?,?)').run(randomUUID(),user.id,project,title,notes,status,priority,category,due,estimate,completed,now);
        else db().prepare('UPDATE tasks SET project_id=?,title=?,notes=?,status=?,priority=?,category=?,due_date=?,estimate=?,completed_at=? WHERE id=? AND user_id=?').run(project,title,notes,status,priority,category,due,estimate,completed,id,user.id);
      }
    } else if (resource === 'projects' && ['POST','PATCH','DELETE'].includes(method)) {
      if(method!=='POST') owned('projects',id,user.id);
      if(method==='DELETE') db().prepare('DELETE FROM projects WHERE id=? AND user_id=?').run(id,user.id);
      else {
        const name=string(body,'name',120,true),description=string(body,'description',2000),color=choice(body,'color',['violet','blue','green','amber']),due=date(body,'due_date');
        if(method==='POST') db().prepare('INSERT INTO projects VALUES (?,?,?,?,?,?,?)').run(randomUUID(),user.id,name,description,color,due,now);
        else db().prepare('UPDATE projects SET name=?,description=?,color=?,due_date=? WHERE id=? AND user_id=?').run(name,description,color,due,id,user.id);
      }
    } else if (resource === 'events' && ['POST','PATCH','DELETE'].includes(method)) {
      if(method!=='POST') owned('events',id,user.id);
      if(method==='DELETE') db().prepare('DELETE FROM events WHERE id=? AND user_id=?').run(id,user.id);
      else {
        const title=string(body,'title',120,true),kind=choice(body,'kind',Object.keys(eventKinds)),location=string(body,'location',160),notes=string(body,'notes',2000);
        const start=Date.parse(string(body,'start_at',40,true)),end=Date.parse(string(body,'end_at',40,true));
        if(!Number.isFinite(start)||!Number.isFinite(end)||end<=start||end-start>86400000) throw new ApiError('Lịch cần có giờ kết thúc sau giờ bắt đầu, tối đa 24 giờ.');
        if(method==='POST') db().prepare('INSERT INTO events VALUES (?,?,?,?,?,?,?,?,?)').run(randomUUID(),user.id,title,kind,new Date(start).toISOString(),new Date(end).toISOString(),location,notes,now);
        else db().prepare('UPDATE events SET title=?,kind=?,start_at=?,end_at=?,location=?,notes=? WHERE id=? AND user_id=?').run(title,kind,new Date(start).toISOString(),new Date(end).toISOString(),location,notes,id,user.id);
      }
    } else if(resource==='habits' && ['POST','DELETE'].includes(method)) {
      if(method==='DELETE') { owned('habits',id,user.id); db().prepare('DELETE FROM habits WHERE id=? AND user_id=?').run(id,user.id); }
      else if(id && action==='toggle') {
        owned('habits',id,user.id); const day=date(body,'day',true)!;
        const exists=db().prepare('SELECT 1 FROM habit_logs WHERE habit_id=? AND day=?').get(id,day);
        if(exists) db().prepare('DELETE FROM habit_logs WHERE habit_id=? AND day=?').run(id,day);
        else db().prepare('INSERT INTO habit_logs VALUES (?,?)').run(id,day);
      } else if(!id) db().prepare('INSERT INTO habits VALUES (?,?,?,?)').run(randomUUID(),user.id,string(body,'title',120,true),now);
      else throw new ApiError('Không tìm thấy.',404);
    } else if(resource==='focus' && method==='POST') {
      const active=db().prepare("SELECT * FROM focus_sessions WHERE user_id=? AND status!='completed'").get(user.id) as FocusSession|undefined;
      if(id==='start') {
        if(active) throw new ApiError('Bạn đã có một phiên tập trung đang mở.',409);
        const minutes=integer(body,'minutes',1,180),task=string(body,'task_id',80)||null; if(task) owned('tasks',task,user.id);
        db().prepare('INSERT INTO focus_sessions VALUES (?,?,?,?,?,?,?,?,?)').run(randomUUID(),user.id,task,minutes,0,'running',now,now,null);
      } else {
        if(!active) throw new ApiError('Không có phiên tập trung đang mở.',409);
        const elapsed=Math.min(focusSeconds(active,Date.now()),active.planned_minutes*60);
        if(id==='pause' && active.status==='running') db().prepare("UPDATE focus_sessions SET elapsed_seconds=?,last_started_at=NULL,status='paused' WHERE id=?").run(elapsed,active.id);
        else if(id==='resume' && active.status==='paused') db().prepare("UPDATE focus_sessions SET last_started_at=?,status='running' WHERE id=?").run(now,active.id);
        else if(id==='finish') db().prepare("UPDATE focus_sessions SET elapsed_seconds=?,last_started_at=NULL,status='completed',finished_at=? WHERE id=?").run(elapsed,now,active.id);
        else if(id==='discard') db().prepare('DELETE FROM focus_sessions WHERE id=?').run(active.id);
        else throw new ApiError('Thao tác không phù hợp với trạng thái phiên.',409);
      }
    } else if(resource==='reviews' && method==='POST') {
      const week=date(body,'week_start',true)!;
      if(new Date(week+'T12:00:00Z').getUTCDay()!==1) throw new ApiError('Tuần cần bắt đầu từ thứ Hai.');
      db().prepare('INSERT INTO weekly_reviews VALUES (?,?,?,?,?) ON CONFLICT(user_id,week_start) DO UPDATE SET wins=excluded.wins,improvements=excluded.improvements,updated_at=excluded.updated_at').run(user.id,week,string(body,'wins',4000),string(body,'improvements',4000),now);
    } else throw new ApiError('Không tìm thấy chức năng.',404);
    return NextResponse.json(snapshot(user), {status:method==='POST'?201:200,headers:{'Cache-Control':'no-store'}});
  } catch(error) {
    if(error instanceof ApiError) return NextResponse.json({error:error.message},{status:error.status});
    console.error('Student OS API error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({error:'Chưa thể lưu dữ liệu. Vui lòng thử lại.'},{status:500});
  }
}
export { handle as GET, handle as POST, handle as PATCH, handle as DELETE };
