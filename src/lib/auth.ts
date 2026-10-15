import { randomBytes, createHash, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { cookies } from 'next/headers';
import { db } from './db';
import type { User } from './types';
const scrypt = promisify(scryptCallback);
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const derived = await scrypt(password,salt,64) as Buffer;
  return `${salt}:${derived.toString('hex')}`;
}
export async function verifyPassword(password: string, stored: string) {
  const [salt,hash] = stored.split(':');
  const derived = await scrypt(password,salt,64) as Buffer;
  return timingSafeEqual(derived,Buffer.from(hash,'hex'));
}
const digest = (token: string) => createHash('sha256').update(token).digest('hex');
export async function currentUser(): Promise<User | null> {
  const token = (await cookies()).get('student-session')?.value;
  if (!token) return null;
  return db().prepare('SELECT u.id,u.name,u.email FROM users u JOIN sessions s ON s.user_id=u.id WHERE s.token_hash=? AND s.expires_at>?').get(digest(token),Date.now()) as User | undefined || null;
}
export async function createSession(userId: string, secure: boolean) {
  const token = randomBytes(32).toString('hex');
  db().prepare('DELETE FROM sessions WHERE expires_at <= ?').run(Date.now());
  db().prepare('INSERT INTO sessions VALUES (?,?,?)').run(digest(token),userId,Date.now()+7*86400000);
  (await cookies()).set('student-session', token, { httpOnly: true, sameSite: 'lax', secure, path: '/', maxAge: 7*86400 });
}
export async function logout() {
  const jar = await cookies(); const token = jar.get('student-session')?.value;
  if (token) db().prepare('DELETE FROM sessions WHERE token_hash=?').run(digest(token));
  jar.delete('student-session');
}
