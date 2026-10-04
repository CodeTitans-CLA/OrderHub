import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { randomToken, tokenHash } from '@/lib/password';
import { normalizeEmail } from '@/lib/userService';

async function sendResetEmail({ to, resetUrl }) {
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) return false;
  const response = await fetch('https://api.resend.com/emails', {
    method:'POST',
    headers:{ 'Authorization':`Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type':'application/json' },
    body:JSON.stringify({
      from:process.env.EMAIL_FROM,
      to:[to],
      subject:'Reset your OrderHub password',
      html:`<p>You requested a password reset for OrderHub.</p><p><a href="${resetUrl}">Reset password</a></p><p>This link expires in 30 minutes.</p>`
    })
  });
  return response.ok;
}

export async function POST(req) {
  try {
    const { email } = await req.json();
    await dbConnect();
    const user = await User.findOne({ email:normalizeEmail(email) });
    if (!user) return NextResponse.json({ ok:true, message:'If an account exists, a reset link was created.' });
    const token = randomToken();
    user.resetTokenHash = tokenHash(token);
    user.resetExpires = new Date(Date.now() + 30 * 60 * 1000);
    await user.save();
    const origin = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;
    const resetUrl = `${origin}/reset-password?token=${token}`;
    const sent = await sendResetEmail({ to:user.email, resetUrl });
    return NextResponse.json({
      ok:true,
      message: sent ? 'Reset link sent to your email.' : 'Reset link created. Configure Resend to email it automatically.',
      ...(process.env.NODE_ENV !== 'production' && !sent ? { devResetUrl:resetUrl } : {})
    });
  } catch (e) {
    return NextResponse.json({ error:e.message }, { status:500 });
  }
}
