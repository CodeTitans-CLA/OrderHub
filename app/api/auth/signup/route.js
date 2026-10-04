import { NextResponse } from 'next/server';
import { createLocalUser } from '@/lib/userService';
import { randomToken, tokenHash } from '@/lib/password';
import User from '@/models/User';

async function sendEmail({to,subject,html}){
  if(!process.env.RESEND_API_KEY||!process.env.EMAIL_FROM)return false;
  const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${process.env.RESEND_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({from:process.env.EMAIL_FROM,to:[to],subject,html})});
  return r.ok;
}

export async function POST(req) {
  try {
    const body=await req.json();
    if(!String(body.name||'').trim())return NextResponse.json({error:'Name is required.'},{status:400});
    const user=await createLocalUser(body);
    const token=randomToken();
    user.verifyTokenHash=tokenHash(token); user.verifyExpires=new Date(Date.now()+60*60*1000); await user.save();
    const origin=process.env.NEXT_PUBLIC_APP_URL||new URL(req.url).origin;
    const verifyUrl=`${origin}/api/auth/verify?token=${token}`;
    const sent=await sendEmail({to:user.email,subject:'Verify your OrderHub account',html:`<p>Welcome to OrderHub.</p><p><a href="${verifyUrl}">Verify your Gmail</a></p><p>This link expires in 1 hour.</p>`});
    return NextResponse.json({ok:true,message:sent?'Verification link sent to your Gmail.':'Account created. Configure Resend to email verification automatically.',...(process.env.NODE_ENV!=='production'&&!sent?{devVerifyUrl:verifyUrl}:{})});
  } catch(e){return NextResponse.json({error:e.message},{status:400});}
}
