import ResetPasswordClient from '@/components/ResetPasswordClient';
import { Suspense } from 'react';
export default function ResetPasswordPage(){return <Suspense fallback={<main className="loginPage"/>}><ResetPasswordClient/></Suspense>}
