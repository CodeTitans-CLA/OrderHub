import { NextResponse } from 'next/server';
import { getActivities } from '@/lib/activity';
import { currentUser, isAdmin } from '@/lib/session';
export const dynamic='force-dynamic';
export async function GET(){
  const user=await currentUser();
  if(!user) return NextResponse.json({error:'Unauthorized'},{status:401});
  try{
    const activities=await getActivities(80);
    const visible=isAdmin(user)?activities:activities.filter(a=>String(a.actorEmail||'').toLowerCase()===String(user.email||'').toLowerCase());
    return NextResponse.json({activities:visible});
  }catch(e){return NextResponse.json({activities:[],error:e.message});}
}
