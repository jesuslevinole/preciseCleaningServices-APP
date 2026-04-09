import { useState } from 'react';
import { Mail, Lock, LogIn, ArrowRight, ShieldAlert } from 'lucide-react';

interface LoginViewProps { onLoginSuccess: () => void; }

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [view, setView] = useState<'login' | 'forgot'>('login');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => { setIsLoading(false); onLoginSuccess(); }, 1200);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', zIndex: 9999 }}>
      <div style={{ width: '100%', maxWidth: '400px', backgroundColor: '#ffffff', borderRadius: '20px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', padding: '40px 32px', border: '1px solid #e2e8f0' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: '56px', height: '56px', backgroundColor: '#1e40af', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
            <LogIn size={28} color="#ffffff" />
          </div>
          <h1 style={{ margin: 0, fontSize: '1.6rem', color: '#0f172a', fontWeight: 800 }}>{view === 'login' ? 'Welcome Back' : 'Reset Password'}</h1>
          <p style={{ margin: '8px 0 0 0', color: '#64748b', fontSize: '0.95rem' }}>{view === 'login' ? 'Access your cleaning dashboard' : 'Recover your account access'}</p>
        </div>

        {view === 'login' ? (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: '#334155', fontWeight: 700, marginBottom: '8px', display: 'block' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '12px' }} />
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '12px 14px 12px 42px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.95rem', backgroundColor: '#ffffff', color: '#0f172a' }} placeholder="name@company.com" />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ fontSize: '0.85rem', color: '#334155', fontWeight: 700 }}>Password</label>
                <button type="button" onClick={() => setView('forgot')} style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>Forgot password?</button>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '12px' }} />
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '12px 14px 12px 42px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.95rem', backgroundColor: '#ffffff', color: '#0f172a' }} placeholder="••••••••" />
              </div>
            </div>

            <button type="submit" disabled={isLoading} style={{ width: '100%', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '14px', borderRadius: '10px', fontWeight: 700, fontSize: '1rem', cursor: isLoading ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              {isLoading ? 'Signing in...' : 'Sign In'} <ArrowRight size={18} />
            </button>
            
            <button type="button" onClick={onLoginSuccess} style={{ marginTop: '8px', width: '100%', backgroundColor: '#fff7ed', color: '#c2410c', border: '1px solid #ffedd5', padding: '12px', borderRadius: '10px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <ShieldAlert size={16} /> Enter as Admin (Dev Mode)
            </button>
          </form>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#475569' }}>Please contact system admin to reset your password.</p>
            <button onClick={() => setView('login')} style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 600, cursor: 'pointer', marginTop: '16px' }}>Back to Login</button>
          </div>
        )}
      </div>
    </div>
  );
}