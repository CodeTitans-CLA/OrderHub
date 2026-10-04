import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/session';
import DashboardClient from '@/components/DashboardClient';
export const dynamic='force-dynamic';
export default async function Dashboard(){ const user=await currentUser(); if(!user) redirect('/login'); return <DashboardClient user={user}/>; }
