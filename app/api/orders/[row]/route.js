import { NextResponse } from 'next/server';
import { getOrders, updateOrder, deleteOrder } from '@/lib/googleSheets';
import { currentUser, isAdmin } from '@/lib/session';
import { addActivity } from '@/lib/activity';

export async function PATCH(req,{params}){
  const user=await currentUser();
  if(!user) return NextResponse.json({error:'Unauthorized'},{status:401});
  if(!isAdmin(user)) return NextResponse.json({error:'Only admins can edit orders.'},{status:403});
  try{
    const {row}=await params; const patch=await req.json();
    if(Object.prototype.hasOwnProperty.call(patch,'Price') && !Object.prototype.hasOwnProperty.call(patch,'Delivery Amount')) patch['Delivery Amount']=(Number(String(patch.Price).replace(/[^0-9.]/g,''))*0.8).toFixed(2);
    const orders=await getOrders(); const current=orders.find(o=>String(o._rowNumber)===String(row))||{};
    const updated=await updateOrder(row,patch);
    for(const [field,newValue] of Object.entries(patch)){
      const oldValue=current[field]??'';
      if(String(oldValue)!==String(newValue)) await addActivity({actorName:user.name,actorEmail:user.email,role:user.role,orderId:patch['Order ID']||current['Order ID']||current.ID||'',rowNumber:Number(row),field,oldValue:String(oldValue),newValue:String(newValue??''),action:'UPDATE',source:'Web App'});
    }
    return NextResponse.json({order:updated});
  }catch(e){return NextResponse.json({error:e.message},{status:500});}
}

export async function DELETE(req,{params}){
  const user=await currentUser();
  if(!user) return NextResponse.json({error:'Unauthorized'},{status:401});
  if(!isAdmin(user)) return NextResponse.json({error:'Only admins can delete orders.'},{status:403});
  try{ const {row}=await params; const orders=await getOrders(); const current=orders.find(o=>String(o._rowNumber)===String(row))||{}; await deleteOrder(row); await addActivity({actorName:user.name,actorEmail:user.email,role:user.role,orderId:current['Order ID']||current.ID||'',rowNumber:Number(row),field:'Order',oldValue:'Existing',newValue:'Deleted',action:'DELETE',source:'Web App'}); return NextResponse.json({ok:true}); }
  catch(e){return NextResponse.json({error:e.message},{status:500});}
}
