import { NextResponse } from 'next/server';
import { getOrders, appendOrder } from '@/lib/googleSheets';
import { currentUser, isAdmin } from '@/lib/session';
import { filterOrdersForUser } from '@/lib/access';
import { addActivity } from '@/lib/activity';
export const dynamic='force-dynamic';

export async function GET(){
  const user = await currentUser();
  if(!user) return NextResponse.json({error:'Unauthorized'},{status:401});
  try {
    const all = await getOrders();
    const visible = filterOrdersForUser(all, user);
    return NextResponse.json({ orders:visible, totalSheetRows:all.length, syncedAt:new Date().toISOString(), access:isAdmin(user)?'admin':'personal' });
  } catch(e){ return NextResponse.json({error:e.message},{status:500}); }
}

export async function POST(req){
  const user=await currentUser();
  if(!user) return NextResponse.json({error:'Unauthorized'},{status:401});
  if(!isAdmin(user)) return NextResponse.json({error:'Only admins can add orders.'},{status:403});
  try{
    const order=await req.json();
    if(order.Price && !order['Delivery Amount']) order['Delivery Amount']=(Number(String(order.Price).replace(/[^0-9.]/g,''))*0.8).toFixed(2);
    const created=await appendOrder(order);
    await addActivity({actorName:user.name,actorEmail:user.email,role:user.role,orderId:order['Order ID']||order.ID||'',field:'Order',oldValue:'',newValue:'Created',action:'CREATE',source:'Web App'});
    return NextResponse.json({order:created});
  } catch(e){ return NextResponse.json({error:e.message},{status:500}); }
}
