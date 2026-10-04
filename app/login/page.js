import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/session';
import LoginClient from '@/components/LoginClient';
import { Suspense } from 'react';
export default async function Login(){ const user=await currentUser(); if(user) redirect('/dashboard'); return <Suspense fallback={<main className="loginPage"/>}><LoginClient/></Suspense>; }
