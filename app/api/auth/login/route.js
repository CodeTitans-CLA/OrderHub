import { NextResponse } from 'next/server';
import { getEnvUsers, signSession, SESSION_COOKIE } from '@/lib/session';
import { authenticateDbUser } from '@/lib/userService';

export async function POST(req) {
  try {
    const { email, password, mode = 'user' } = await req.json();
    const normalized = String(email || '').trim().toLowerCase();
    let user = null;

    if (mode === 'admin') {
      user = getEnvUsers().find(u =>
        String(u.role || '').toLowerCase() === 'admin' &&
        String(u.email || '').toLowerCase() === normalized &&
        u.password === password
      ) || null;
      if (!user) {
        const dbUser = await authenticateDbUser(normalized, password);
        if (dbUser && String(dbUser.role).toLowerCase() === 'admin') user = dbUser;
      }
    } else {
      user = await authenticateDbUser(normalized, password);
      if (user && String(user.role).toLowerCase() === 'admin') user = null;
    }

    if (!user) return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });

    const res = NextResponse.json({ user: {
      name: user.name, email: user.email, role: user.role,
      picture: user.picture || '', sheetName: user.sheetName || user.name || '',
      monthlyTarget: Number(user.monthlyTarget || 1100)
    }});
    res.cookies.set(SESSION_COOKIE, signSession(user), {
      httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production',
      path: '/', maxAge: 60 * 60 * 24 * 7
    });
    return res;
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
