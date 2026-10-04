import { NextResponse } from 'next/server';
import { currentUser, isAdmin } from '@/lib/session';
import { listUsers } from '@/lib/userService';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
  const user = await currentUser();
  if (!user || !isAdmin(user)) return NextResponse.json({ error:'Forbidden' }, { status:403 });
  return NextResponse.json({ users:await listUsers() });
}

export async function PATCH(req) {
  const admin = await currentUser();
  if (!admin || !isAdmin(admin)) return NextResponse.json({ error:'Forbidden' }, { status:403 });
  const { id, sheetName, monthlyTarget, role } = await req.json();
  await dbConnect();
  const update = {};
  if (sheetName !== undefined) update.sheetName = String(sheetName).trim();
  if (monthlyTarget !== undefined) update.monthlyTarget = Math.max(0, Number(monthlyTarget) || 0);
  if (role !== undefined && ['Admin','User'].includes(role)) update.role = role;
  const user = await User.findByIdAndUpdate(id, update, { new:true }).select('-passwordHash -resetTokenHash -verifyTokenHash');
  if (!user) return NextResponse.json({ error:'User not found' }, { status:404 });
  return NextResponse.json({ user });
}
