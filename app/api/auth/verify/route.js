import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { tokenHash } from '@/lib/password';
export async function GET(req){
  const url=new URL(req.url);const token=url.searchParams.get('token');const origin=process.env.NEXT_PUBLIC_APP_URL||url.origin;
  try{await dbConnect();const user=await User.findOne({verifyTokenHash:tokenHash(token||''),verifyExpires:{$gt:new Date()}});if(!user)throw new Error('Verification link is invalid or expired.');user.emailVerified=true;user.verifyTokenHash='';user.verifyExpires=null;await user.save();return NextResponse.redirect(`${origin}/login?verified=1`)}catch(e){return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(e.message)}`)}}
