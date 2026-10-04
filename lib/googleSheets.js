import { google } from 'googleapis';
import { getDemoOrders, addDemoOrder, updateDemoOrder as updateDemo, deleteDemoOrder, sheetHeaders } from './demoData';

const isDemo = () => process.env.DEMO_MODE !== 'false';
const tab = () => process.env.GOOGLE_SHEET_TAB || 'Orders';
const safeRange = (suffix='A:ZZ') => `'${tab().replace(/'/g,"''")}'!${suffix}`;

function authClient() {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return new google.auth.GoogleAuth({ keyFile:process.env.GOOGLE_APPLICATION_CREDENTIALS, scopes:['https://www.googleapis.com/auth/spreadsheets'] });
  }
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
  if (!email || !key || !process.env.GOOGLE_SHEET_ID) throw new Error('Google Sheet credentials are missing.');
  return new google.auth.JWT({ email, key, scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
}

function sheetsApi() { return google.sheets({ version:'v4', auth:authClient() }); }
function rowToObject(headers,row,rowNumber){ const obj={_rowNumber:rowNumber}; headers.forEach((h,i)=>{ const key=String(h||'').trim(); if(key) obj[key]=row[i]??''; }); return obj; }

export async function getOrders(){
  if(isDemo()) return getDemoOrders();
  const api=sheetsApi();
  const res=await api.spreadsheets.values.get({spreadsheetId:process.env.GOOGLE_SHEET_ID,range:safeRange('A:ZZ')});
  const rows=res.data.values||[];
  if(!rows.length) return [];
  const headers=rows[0];
  return rows.slice(1).filter(r=>r.some(v=>String(v||'').trim())).map((r,i)=>rowToObject(headers,r,i+2));
}

export async function appendOrder(order){
  if(isDemo()) return addDemoOrder(order);
  const api=sheetsApi(); const headers=await getHeaders(); const row=headers.map(h=>order[h]??'');
  await api.spreadsheets.values.append({spreadsheetId:process.env.GOOGLE_SHEET_ID,range:safeRange('A:ZZ'),valueInputOption:'USER_ENTERED',insertDataOption:'INSERT_ROWS',requestBody:{values:[row]}});
  return order;
}

export async function updateOrder(rowNumber,patch){
  if(isDemo()) return updateDemo(rowNumber,patch);
  const api=sheetsApi(); const headers=await getHeaders();
  const currentRes=await api.spreadsheets.values.get({spreadsheetId:process.env.GOOGLE_SHEET_ID,range:safeRange(`A${rowNumber}:ZZ${rowNumber}`)});
  const current=currentRes.data.values?.[0]||[];
  const next=headers.map((h,i)=>Object.prototype.hasOwnProperty.call(patch,h)?patch[h]:(current[i]??''));
  await api.spreadsheets.values.update({spreadsheetId:process.env.GOOGLE_SHEET_ID,range:safeRange(`A${rowNumber}:ZZ${rowNumber}`),valueInputOption:'USER_ENTERED',requestBody:{values:[next]}});
  return rowToObject(headers,next,Number(rowNumber));
}

export async function deleteOrder(rowNumber){
  if(isDemo()) return deleteDemoOrder(rowNumber);
  const api=sheetsApi();
  const meta=await api.spreadsheets.get({spreadsheetId:process.env.GOOGLE_SHEET_ID});
  const sheet=meta.data.sheets.find(s=>s.properties.title===tab());
  if(!sheet) throw new Error(`Sheet tab '${tab()}' was not found.`);
  await api.spreadsheets.batchUpdate({spreadsheetId:process.env.GOOGLE_SHEET_ID,requestBody:{requests:[{deleteDimension:{range:{sheetId:sheet.properties.sheetId,dimension:'ROWS',startIndex:Number(rowNumber)-1,endIndex:Number(rowNumber)}}}]}});
  return true;
}

export async function getHeaders(){
  if(isDemo()) return sheetHeaders;
  const api=sheetsApi();
  const res=await api.spreadsheets.values.get({spreadsheetId:process.env.GOOGLE_SHEET_ID,range:safeRange('1:1')});
  return res.data.values?.[0]||[];
}
