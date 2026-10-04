import { NextResponse } from 'next/server';
import { addActivity } from '@/lib/activity';
export async function POST(req){
  const secret=req.headers.get('x-orderhub-secret');
  if(!process.env.AUDIT_WEBHOOK_SECRET || secret!==process.env.AUDIT_WEBHOOK_SECRET) return NextResponse.json({error:'Forbidden'},{status:403});
  try{
    const body=await req.json();
    const log=await addActivity({actorName:body.actorName||body.actorEmail||'Unknown editor',actorEmail:body.actorEmail||'',role:'Sheet Editor',orderId:body.orderId||'',rowNumber:Number(body.rowNumber)||undefined,field:body.field||'',oldValue:String(body.oldValue??''),newValue:String(body.newValue??''),action:'UPDATE',source:'Google Sheet'});
    return NextResponse.json({ok:true,id:log?._id||null});
  }catch(e){return NextResponse.json({error:e.message},{status:500});}
}
