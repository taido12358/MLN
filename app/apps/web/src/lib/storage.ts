/** Student identity persisted per room so a page refresh/reconnect resumes the same participant
 * instead of creating a new one. Previously copy-pasted (not shared) between the join page and the
 * play page. */
export interface StoredIdentity {
  participantId: string;
  nickname: string;
}

export function readStoredIdentity(roomCode: string): StoredIdentity | null {
  try {
    const raw = localStorage.getItem(`mln:identity:${roomCode}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function writeStoredIdentity(roomCode: string, identity: StoredIdentity): void {
  try {
    localStorage.setItem(`mln:identity:${roomCode}`, JSON.stringify(identity));
  } catch {
    /* ignore — worst case the student re-joins as a new participant next time */
  }
}

const ADMIN_TOKEN_KEY = "mln:adminToken";

export function readAdminToken(): string | null {
  try {
    return localStorage.getItem(ADMIN_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function writeAdminToken(token: string): void {
  try {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
  } catch {
    /* ignore */
  }
}
