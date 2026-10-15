PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;
PRAGMA busy_timeout = 5000;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL CHECK(length(name) BETWEEN 1 AND 80),
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS auth_attempts (
  email TEXT PRIMARY KEY,
  attempts INTEGER NOT NULL,
  window_start INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK(length(trim(name)) BETWEEN 1 AND 120),
  description TEXT NOT NULL DEFAULT '',
  color TEXT NOT NULL DEFAULT 'violet' CHECK(color IN ('violet','blue','green','amber')),
  due_date TEXT,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  title TEXT NOT NULL CHECK(length(trim(title)) BETWEEN 1 AND 120),
  notes TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'todo' CHECK(status IN ('todo','doing','done')),
  priority INTEGER NOT NULL DEFAULT 3 CHECK(priority BETWEEN 1 AND 4),
  category TEXT NOT NULL DEFAULT 'Học tập',
  due_date TEXT,
  estimate INTEGER NOT NULL DEFAULT 30 CHECK(estimate BETWEEN 5 AND 1440),
  completed_at TEXT,
  created_at TEXT NOT NULL,
  CHECK((status = 'done' AND completed_at IS NOT NULL) OR (status != 'done' AND completed_at IS NULL))
);
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK(length(trim(title)) BETWEEN 1 AND 120),
  kind TEXT NOT NULL CHECK(kind IN ('class','study','exam','personal','break')),
  start_at TEXT NOT NULL,
  end_at TEXT NOT NULL CHECK(end_at > start_at),
  location TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS focus_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  task_id TEXT REFERENCES tasks(id) ON DELETE SET NULL,
  planned_minutes INTEGER NOT NULL CHECK(planned_minutes BETWEEN 1 AND 180),
  elapsed_seconds INTEGER NOT NULL DEFAULT 0 CHECK(elapsed_seconds >= 0),
  status TEXT NOT NULL CHECK(status IN ('running','paused','completed')),
  started_at TEXT NOT NULL,
  last_started_at TEXT,
  finished_at TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS one_active_focus ON focus_sessions(user_id) WHERE status != 'completed';
CREATE TABLE IF NOT EXISTS habits (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK(length(trim(title)) BETWEEN 1 AND 120),
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS habit_logs (
  habit_id TEXT NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  day TEXT NOT NULL,
  PRIMARY KEY(habit_id, day)
);
CREATE TABLE IF NOT EXISTS weekly_reviews (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  week_start TEXT NOT NULL,
  wins TEXT NOT NULL DEFAULT '',
  improvements TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL,
  PRIMARY KEY(user_id, week_start)
);
CREATE INDEX IF NOT EXISTS tasks_user_due ON tasks(user_id, status, due_date);
CREATE INDEX IF NOT EXISTS tasks_project ON tasks(project_id);
CREATE INDEX IF NOT EXISTS events_user_start ON events(user_id, start_at);
CREATE INDEX IF NOT EXISTS focus_user_start ON focus_sessions(user_id, started_at);
CREATE INDEX IF NOT EXISTS projects_user ON projects(user_id);
CREATE INDEX IF NOT EXISTS habits_user ON habits(user_id);
CREATE INDEX IF NOT EXISTS sessions_user ON sessions(user_id);
PRAGMA user_version = 1;
