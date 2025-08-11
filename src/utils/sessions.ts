import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { z } from "zod";

const SESSIONS_PATH = path.join(process.env.HOME || "", ".branchyard-sessions.json");

const SessionSchema = z.object({
  worktrees: z.array(z.string()),
  baseBranch: z.string(),
  editor: z.string()
});

function loadSessions() {
  if (!existsSync(SESSIONS_PATH)) return { sessions: {}, lastSession: null };
  try {
    const parsed = JSON.parse(readFileSync(SESSIONS_PATH, "utf-8"));
    for (const [name, session] of Object.entries(parsed.sessions || {})) {
      const result = SessionSchema.safeParse(session);
      if (!result.success) {
        console.error(`❌ Invalid session '${name}' in ~/.branchyard-sessions.json`);
        console.error(result.error.format());
        process.exit(1);
      }
    }
    return parsed;
  } catch {
    console.error("❌ Failed to read sessions file. Please fix or delete ~/.branchyard-sessions.json");
    process.exit(1);
  }
}

function saveSessions(data: any) {
  writeFileSync(SESSIONS_PATH, JSON.stringify(data, null, 2));
}

export function saveSession(name: string, data: any) {
  const store = loadSessions();
  store.sessions[name] = { ...data, savedAt: new Date().toISOString() };
  store.lastSession = name;
  saveSessions(store);
}

export function getSession(name: string) {
  const store = loadSessions();
  return store.sessions[name] || null;
}

export function listSessions() {
  return loadSessions().sessions;
}

export function deleteSession(name: string) {
  const store = loadSessions();
  delete store.sessions[name];
  if (store.lastSession === name) store.lastSession = null;
  saveSessions(store);
}

export function getLastSession() {
  const store = loadSessions();
  return store.lastSession ? store.sessions[store.lastSession] : null;
}