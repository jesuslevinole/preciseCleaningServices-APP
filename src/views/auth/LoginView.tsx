import { useState } from 'react';
import { Mail, Lock, LogIn, ArrowRight, ShieldAlert } from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: () => void;
}

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [view, setView] = useState<'login' | 'forgot'>('login');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess();
    }, 1500);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert("Password reset link sent to your email.");
      setView('login');
    }, 1500);
  };

  return (
    // CORRECCIÓN: Posicionamiento fijo para que cubra toda la pantalla y se centre perfectamente
    <div style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', zIndex: 9999, fontFamily: 'inherit' }}>
      
      <div style={{ width: '100%', maxWidth: '400px', backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.05), 0 4px 6px rgba(0, 0, 0, 0.02)', padding: '40px 30px', border: '1px solid #e2e8f0', margin: '20px', boxSizing: 'border-box' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: '48px', height: '48px', backgroundColor: '#1e40af', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', boxShadow: '0 4px 6px rgba(30, 64, 175, 0.2)' }}>
            <LogIn size={24} color="#ffffff" />
          </div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#0f172a', fontWeight: 700 }}>
            {view === 'login' ? 'Welcome Back' : 'Reset Password'}
          </h1>
          <p style={{ margin: '8px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>
            {view === 'login' ? 'Enter your credentials to access the system.' : 'Enter your email to receive a reset link.'}
          </p>
        </div>

        {view === 'login' ? (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: '#334155', fontWeight: 600, marginBottom: '8px', display: 'block' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '12px' }} />
                {/* CORRECCIÓN: Fondo explícitamente blanco y texto oscuro */}
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '12px 14px 12px 42px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.95rem', backgroundColor: '#ffffff', color: '#0f172a' }} 
                  placeholder="name@company.com" 
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ fontSize: '0.85rem', color: '#334155', fontWeight: 600 }}>Password</label>
                <button type="button" onClick={() => setView('forgot')} style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}>Forgot password?</button>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '12px' }} />
                {/* CORRECCIÓN: Fondo explícitamente blanco y texto oscuro */}
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '12px 14px 12px 42px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.95rem', backgroundColor: '#ffffff', color: '#0f172a' }} 
                  placeholder="••••••••" 
                />
              </div>
            </div>

            <button type="submit" disabled={isLoading} style={{ width: '100%', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '14px', borderRadius: '8px', fontWeight: 600, fontSize: '0.95rem', cursor: isLoading ? 'not-allowed' : 'pointer', transition: 'background-color 0.2s', marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: isLoading ? 0.8 : 1 }}>
              {isLoading ? 'Authenticating...' : 'Sign In'} <ArrowRight size={18} />
            </button>
            
            {/* BOTÓN TEMPORAL DEV/ADMIN BYPASS */}
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px dashed #e2e8f0' }}>
              <button 
                type="button" 
                onClick={onLoginSuccess} 
                style={{ width: '100%', backgroundColor: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', padding: '12px', borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <ShieldAlert size={16} color="#d97706" /> Enter as Admin (Dev Mode)
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: '#334155', fontWeight: 600, marginBottom: '8px', display: 'block' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '12px' }} />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '12px 14px 12px 42px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.95rem', backgroundColor: '#ffffff', color: '#0f172a' }} 
                  placeholder="name@company.com" 
                />
              </div>
            </div>
            
            <button type="submit" disabled={isLoading} style={{ width: '100%', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '14px', borderRadius: '8px', fontWeight: 600, fontSize: '0.95rem', cursor: isLoading ? 'not-allowed' : 'pointer', transition: 'background-color 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: isLoading ? 0.8 : 1 }}>
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
            <button type="button" onClick={() => setView('login')} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', padding: 0, marginTop: '8px' }}>
              Back to Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
}