import { NextResponse } from 'next/server';
export async function GET(){ return NextResponse.json({
  ok:true,
  demo:process.env.DEMO_MODE!=='false',
  googleSheetConfigured:Boolean(process.env.GOOGLE_SHEET_ID&&(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL||process.env.GOOGLE_APPLICATION_CREDENTIALS)),
  googleLoginConfigured:Boolean(process.env.GOOGLE_OAUTH_CLIENT_ID&&process.env.GOOGLE_OAUTH_CLIENT_SECRET),
  mongoConfigured:Boolean(process.env.MONGODB_URI),
  emailResetConfigured:Boolean(process.env.RESEND_API_KEY&&process.env.EMAIL_FROM)
}); }
