import crypto from 'crypto';
import { cookies } from 'next/headers';

const COOKIE = 'orderhub_session';
const secret = () => process.env.SESSION_SECRET || 'dev-secret-change-me';
const b64 = (s) => Buffer.from(s).toString('base64url');

export function getEnvUsers() {
  try { return JSON.parse(process.env.USERS_JSON || '[]'); } catch { return []; }
}

export function sessionUser(user) {
  return {
    id: String(user._id || user.id || ''),
    name: user.name || '',
    email: user.email || '',
    role: user.role || 'User',
    picture: user.picture || '',
    sheetName: user.sheetName || user.name || '',
    monthlyTarget: Number(user.monthlyTarget || 1100),
  };
}

export function signSession(user) {
  const data = sessionUser(user);
  const payload = b64(JSON.stringify({ ...data, exp: Date.now() + 1000 * 60 * 60 * 24 * 7 }));
  const sig = crypto.createHmac('sha256', secret()).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

export function verifySession(token) {
  if (!token || !token.includes('.')) return null;
  const [payload, sig] = token.split('.');
  const expected = crypto.createHmac('sha256', secret()).update(payload).digest('base64url');
  const a = Buffer.from(sig || '');
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return data.exp > Date.now() ? data : null;
  } catch { return null; }
}

export async function currentUser() {
  const store = await cookies();
  return verifySession(store.get(COOKIE)?.value);
}

export function isAdmin(user) {
  return String(user?.role || '').toLowerCase() === 'admin';
}

export const SESSION_COOKIE = COOKIE;
