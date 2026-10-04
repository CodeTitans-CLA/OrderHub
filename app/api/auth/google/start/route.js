import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(req) {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  if (!clientId) return NextResponse.json({ error:'GOOGLE_OAUTH_CLIENT_ID is missing.' }, { status:500 });
  const origin = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;
  const redirectUri = `${origin}/api/auth/google/callback`;
  const state = crypto.randomBytes(18).toString('hex');
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', 'openid email profile');
  url.searchParams.set('access_type', 'offline');
  url.searchParams.set('prompt', 'select_account');
  url.searchParams.set('state', state);
  const res = NextResponse.redirect(url);
  res.cookies.set('orderhub_oauth_state', state, { httpOnly:true, sameSite:'lax', secure:process.env.NODE_ENV==='production', path:'/', maxAge:600 });
  return res;
}
