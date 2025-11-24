-- Migration: Add user_id to todos table
ALTER TABLE todos ADD COLUMN user_id TEXT;

CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todos(user_id);
