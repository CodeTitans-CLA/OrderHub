"use client";
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginClient(){
  const router=useRouter(); const params=useSearchParams();
  const [portal,setPortal]=useState('user'); const [mode,setMode]=useState('login');
  const [name,setName]=useState(''); const [sheetName,setSheetName]=useState('');
  const [email,setEmail]=useState(''); const [password,setPassword]=useState('');
  const [error,setError]=useState(''); const [message,setMessage]=useState(''); const [loading,setLoading]=useState(false);
  useEffect(()=>{ const e=params.get('error'); if(e)setError(e); if(params.get('verified'))setMessage('Gmail verified. You can sign in now.'); },[params]);

  async function login(e){ e.preventDefault(); setLoading(true);setError('');setMessage('');
    const res=await fetch('/api/auth/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email,password,mode:portal})});
    const d=await res.json(); setLoading(false); if(!res.ok)return setError(d.error||'Login failed'); router.push('/dashboard');router.refresh();
  }
  async function signup(e){e.preventDefault();setLoading(true);setError('');
    const res=await fetch('/api/auth/signup',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name,email,password,sheetName:sheetName||name})});
    const d=await res.json();setLoading(false);if(!res.ok)return setError(d.error||'Signup failed');setMessage(d.devVerifyUrl?`${d.message} ${d.devVerifyUrl}`:d.message);setMode('login');}
  async function forgot(e){e.preventDefault();setLoading(true);setError('');setMessage('');
    const res=await fetch('/api/auth/forgot',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email})});const d=await res.json();setLoading(false);if(!res.ok)return setError(d.error||'Could not create reset link');setMessage(d.devResetUrl?`${d.message} ${d.devResetUrl}`:d.message);}

  return <main className="loginPage"><section className="loginCard authCard">
    <div className="brandMark"><span className="cube">◆</span><div><b>OrderHub</b><small>Work. Track. Deliver.</small></div></div>
    <div className="portalTabs"><button className={portal==='user'?'active':''} onClick={()=>{setPortal('user');setMode('login');setError('')}}>User Login</button><button className={portal==='admin'?'active':''} onClick={()=>{setPortal('admin');setMode('login');setError('')}}>Admin Login</button></div>
    <h1>{portal==='admin'?'Admin access':mode==='signup'?'Create your account':mode==='forgot'?'Reset password':'Welcome back'}</h1>
    <p>{portal==='admin'?'Full dashboard and order management.':'Your personal orders, delivery performance and target progress.'}</p>

    {portal==='user' && mode==='login' && <a className="googleBtn" href="/api/auth/google/start"><span>G</span> Continue with Google</a>}
    {portal==='user' && mode==='login' && <div className="authDivider"><span>or use email</span></div>}

    <form onSubmit={mode==='signup'?signup:mode==='forgot'?forgot:login}>
      {mode==='signup' && <><label>Full name<input value={name} onChange={e=>setName(e.target.value)} required/></label><label>Name used in Google Sheet<input value={sheetName} onChange={e=>setSheetName(e.target.value)} placeholder="Example: Ibrahim"/><small className="fieldHint">This links your account to Employee Name / Assign Person.</small></label></>}
      <label>{portal==='admin'?'Admin email':'Gmail address'}<input value={email} onChange={e=>setEmail(e.target.value)} type="email" required/></label>
      {mode!=='forgot' && <label>Password<input value={password} onChange={e=>setPassword(e.target.value)} type="password" minLength="8" required/></label>}
      {error&&<div className="errorBox">{error}</div>}{message&&<div className="successBox">{message}</div>}
      <button className="primaryBtn wide" disabled={loading}>{loading?'Please wait...':mode==='signup'?'Create account':mode==='forgot'?'Send reset link':'Sign in'}</button>
    </form>

    {portal==='user' && <div className="authLinks">{mode==='login'&&<><button onClick={()=>setMode('signup')}>Create account</button><button onClick={()=>setMode('forgot')}>Forgot password?</button></>}{mode!=='login'&&<button onClick={()=>setMode('login')}>← Back to sign in</button>}</div>}
    {portal==='admin' && <div className="demoHint">Admin credentials are configured in <code>USERS_JSON</code>.</div>}
  </section></main>
}
