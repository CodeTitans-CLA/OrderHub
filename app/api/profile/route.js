import { NextResponse } from 'next/server';
import { currentUser, signSession, SESSION_COOKIE } from '@/lib/session';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
  const session = await currentUser();
  if (!session) return NextResponse.json({ error:'Unauthorized' }, { status:401 });
  if (!session.id) return NextResponse.json({ user:session });
  await dbConnect();
  const user = await User.findById(session.id).select('-passwordHash -resetTokenHash -verifyTokenHash').lean();
  return NextResponse.json({ user:user || session });
}

export async function PATCH(req) {
  const session = await currentUser();
  if (!session) return NextResponse.json({ error:'Unauthorized' }, { status:401 });
  if (!session.id) return NextResponse.json({ error:'Environment admin profile is managed in .env.local.' }, { status:400 });
  await dbConnect();
  const body = await req.json();
  const update = {};
  if (body.name !== undefined) update.name = String(body.name).trim();
  if (body.sheetName !== undefined) update.sheetName = String(body.sheetName).trim();
  const user = await User.findByIdAndUpdate(session.id, update, { new:true }).select('-passwordHash -resetTokenHash -verifyTokenHash');
  if (!user) return NextResponse.json({ error:'User not found' }, { status:404 });
  const res = NextResponse.json({ user });
  res.cookies.set(SESSION_COOKIE, signSession(user), { httpOnly:true, sameSite:'lax', secure:process.env.NODE_ENV==='production', path:'/', maxAge:60*60*24*7 });
  return res;
}
