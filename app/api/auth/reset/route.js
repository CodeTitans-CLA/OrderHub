import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { tokenHash, hashPassword } from '@/lib/password';

export async function POST(req) {
  try {
    const { token, password } = await req.json();
    if (String(password || '').length < 8) return NextResponse.json({ error:'Password must be at least 8 characters.' }, { status:400 });
    await dbConnect();
    const user = await User.findOne({ resetTokenHash:tokenHash(token), resetExpires:{ $gt:new Date() } });
    if (!user) return NextResponse.json({ error:'Reset link is invalid or expired.' }, { status:400 });
    user.passwordHash = hashPassword(password);
    user.resetTokenHash = '';
    user.resetExpires = null;
    await user.save();
    return NextResponse.json({ ok:true });
  } catch (e) {
    return NextResponse.json({ error:e.message }, { status:500 });
  }
}
