import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { cookies } from 'next/headers';
import { upsertGoogleUser } from '@/lib/userService';
import { signSession, SESSION_COOKIE } from '@/lib/session';

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const store = await cookies();
    const expectedState = store.get('orderhub_oauth_state')?.value;
    if (!code || !state || state !== expectedState) throw new Error('Invalid Google sign-in state.');

    const origin = process.env.NEXT_PUBLIC_APP_URL || url.origin;
    const oauth = new google.auth.OAuth2(
      process.env.GOOGLE_OAUTH_CLIENT_ID,
      process.env.GOOGLE_OAUTH_CLIENT_SECRET,
      `${origin}/api/auth/google/callback`
    );
    const { tokens } = await oauth.getToken(code);
    oauth.setCredentials(tokens);
    const oauth2 = google.oauth2({ version:'v2', auth:oauth });
    const profileRes = await oauth2.userinfo.get();
    const user = await upsertGoogleUser(profileRes.data);

    const res = NextResponse.redirect(`${origin}/dashboard`);
    res.cookies.set(SESSION_COOKIE, signSession(user), { httpOnly:true, sameSite:'lax', secure:process.env.NODE_ENV==='production', path:'/', maxAge:60*60*24*7 });
    res.cookies.set('orderhub_oauth_state', '', { httpOnly:true, path:'/', maxAge:0 });
    return res;
  } catch (e) {
    const origin = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(e.message)}`);
  }
}
