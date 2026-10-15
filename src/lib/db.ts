import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

const globalDb = globalThis as unknown as { studentDb?: DatabaseSync };
export function db() {
  if (!globalDb.studentDb) {
    const file = process.env.STUDENT_DB_PATH || path.join(process.cwd(), 'data', 'student-os.sqlite');
    mkdirSync(path.dirname(file), { recursive: true });
    const connection = new DatabaseSync(file);
    connection.exec(readFileSync(path.join(process.cwd(), 'database', 'schema.sql'), 'utf8'));
    globalDb.studentDb = connection;
  }
  return globalDb.studentDb;
}
export function transaction<T>(fn: () => T): T {
  const connection = db();
  connection.exec('BEGIN IMMEDIATE');
  try { const result = fn(); connection.exec('COMMIT'); return result; }
  catch (error) { connection.exec('ROLLBACK'); throw error; }
}
export function seedWorkspace(userId: string) {
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date());
  const date = (offset: number) => { const d = new Date(today + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + offset); return d.toISOString().slice(0,10); };
  const now = new Date().toISOString();
  const projects = [randomUUID(),randomUUID(),randomUUID()];
  const projectRows = [ ['Student OS · Đồ án web', 'Một không gian giúp việc học nhẹ nhàng hơn.', 'violet', date(14)], ['Hành trình tiếng Anh', 'Mỗi ngày một chút, tự tin hơn mỗi tuần.', 'green', date(30)], ['Thiết kế trải nghiệm', 'Quan sát, thấu hiểu và tạo ra điều hữu ích.', 'blue', date(7)] ];
  projectRows.forEach((p,i) => db().prepare('INSERT INTO projects VALUES (?,?,?,?,?,?,?)').run(projects[i],userId,...p,now));
  const tasks = [
    ['Phác thảo luồng trải nghiệm người dùng','Bắt đầu từ hành trình tạo công việc → lên lịch → tập trung.','doing',1,'Dự án',date(0),45,projects[0]],
    ['Hoàn thiện sơ đồ cơ sở dữ liệu','Xác định quan hệ giữa người dùng, công việc và dự án.','todo',2,'Dự án',date(0),60,projects[0]],
    ['Luyện nghe tiếng Anh 20 phút','Nghe một đoạn ngắn và ghi lại 5 cụm từ mới.','todo',3,'Ngoại ngữ',date(0),20,projects[1]],
    ['Đọc chương 3 · Thiết kế lấy người dùng làm trung tâm','','todo',3,'Học tập',date(1),30,projects[2]],
    ['Chuẩn bị nội dung buổi thảo luận nhóm','','todo',2,'Học tập',date(2),45,projects[2]],
    ['Đi bộ và nghỉ ngơi một chút','','todo',4,'Cá nhân',date(0),20,null],
    ['Xác định mục tiêu cho đồ án','Đã thống nhất phạm vi đầu tiên.','done',2,'Dự án',date(-1),30,projects[0]],
  ];
  for (const t of tasks) db().prepare('INSERT INTO tasks (id,user_id,title,notes,status,priority,category,due_date,estimate,project_id,completed_at,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)').run(randomUUID(),userId,...t,t[2]==='done'?now:null,now);
  for (const [title,kind,hour,duration,location] of [ ['Thiết kế & phát triển web','class',8,90,'Phòng C205'], ['Một khoảng tập trung cho đồ án','study',14,60,'Góc học tập'], ['Đi bộ, nạp lại năng lượng','break',17,30,'Ngoài trời'] ] as const) {
    const start = new Date(`${today}T${String(hour).padStart(2,'0')}:00:00+07:00`);
    db().prepare('INSERT INTO events VALUES (?,?,?,?,?,?,?,?,?)').run(randomUUID(),userId,title,kind,start.toISOString(),new Date(start.getTime()+duration*60000).toISOString(),location,'',now);
  }
  for (const title of ['Đọc sách 15 phút','Học ngoại ngữ','Vận động mỗi ngày']) db().prepare('INSERT INTO habits VALUES (?,?,?,?)').run(randomUUID(),userId,title,now);
}
