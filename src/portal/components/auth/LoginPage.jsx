/**
 * LoginPage.jsx — Multi-step auth for kS2
 *
 * t-1 / t-2 flow:  Email+Password → TOTP code (or first-time QR setup)
 * t-3 flow:        Email → OTP sent to inbox → Enter OTP
 */
import { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, LogIn, Mail, ShieldCheck, Smartphone, AlertCircle, RefreshCw, Copy, Check } from 'lucide-react';
import useAuth from '../../store/useAuth';
import logoSrc from '../../../public-site/image/logo/logoSWTransparent.png';

// ── QR Code renderer using otpauth URI ────────────────────────────────────────
function QrCode({ uri }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!uri || !ref.current) return;
    import('qrcode').then((QRCode) => {
      QRCode.default.toCanvas(ref.current, uri, { width: 200, margin: 2 });
    }).catch(() => {});
  }, [uri]);
  return <canvas ref={ref} className="rounded-xl mx-auto" />;
}

// ── Shared UI ─────────────────────────────────────────────────────────────────
function Card({ children }) {
  return (
    <div className="rounded-2xl border p-8 space-y-5"
      style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
      {children}
    </div>
  );
}

function ErrorBanner({ msg }) {
  if (!msg) return null;
  return (
    <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm"
      style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
      <AlertCircle size={14} className="shrink-0" />
      {msg}
    </div>
  );
}

function SubmitBtn({ loading, label, icon: Icon }) {
  return (
    <button type="submit" disabled={loading}
      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      style={{ background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)', boxShadow: '0 2px 10px rgba(6,182,212,0.3)' }}>
      {loading ? (
        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      ) : <Icon size={15} />}
      {loading ? 'Please wait…' : label}
    </button>
  );
}

function OtpInput({ value, onChange, length = 6 }) {
  const ref0 = useRef(null);
  const ref1 = useRef(null);
  const ref2 = useRef(null);
  const ref3 = useRef(null);
  const ref4 = useRef(null);
  const ref5 = useRef(null);
  const refs = [ref0, ref1, ref2, ref3, ref4, ref5].slice(0, length);
  const vals = value.padEnd(length, '').split('').slice(0, length);

  const handle = (i, e) => {
    const v = e.target.value.replace(/\D/g, '').slice(-1);
    const next = [...vals];
    next[i] = v;
    onChange(next.join(''));
    if (v && i < length - 1) refs[i + 1].current?.focus();
  };

  const handleKey = (i, e) => {
    if (e.key === 'Backspace') {
      if (!vals[i] && i > 0) {
        refs[i - 1].current?.focus();
      } else {
        const next = [...vals];
        next[i] = '';
        onChange(next.join(''));
      }
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (pasted) {
      onChange(pasted.padEnd(length, '').slice(0, length));
      refs[Math.min(pasted.length, length - 1)].current?.focus();
    }
    e.preventDefault();
  };

  return (
    <div className="flex justify-center gap-2">
      {Array.from({ length }, (_, i) => (
        <input
          key={i} ref={refs[i]}
          type="text" inputMode="numeric" maxLength={1}
          value={vals[i] || ''}
          onChange={(e) => handle(i, e)}
          onKeyDown={(e) => handleKey(i, e)}
          onPaste={handlePaste}
          className="w-11 h-12 text-center text-lg font-bold rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
          style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
        />
      ))}
    </div>
  );
}

// ── Step: Choose login type ───────────────────────────────────────────────────
function StepChooseType({ onStaff, onClient }) {
  return (
    <Card>
      <div>
        <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Sign in</h2>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>Choose how you access the portal</p>
      </div>
      <div className="space-y-3">
        <button onClick={onStaff}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border text-left transition-colors"
          style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-border)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; }}>
          <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(6,182,212,0.1)' }}>
            <Smartphone size={18} style={{ color: 'var(--accent)' }} />
          </div>
          <div>
            <p className="text-sm font-medium">Staff login</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>Email, password + Authenticator app</p>
          </div>
        </button>
        <button onClick={onClient}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border text-left transition-colors"
          style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-border)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; }}>
          <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(6,182,212,0.1)' }}>
            <Mail size={18} style={{ color: 'var(--accent)' }} />
          </div>
          <div>
            <p className="text-sm font-medium">Client login</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>Email access code sent to your inbox</p>
          </div>
        </button>
      </div>
    </Card>
  );
}

// ── Step: Staff password ───────────────────────────────────────────────────────
function StepPassword({ onBack }) {
  const { loginPassword, error, clearError, status } = useAuth();
  const loading = status === 'loading';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    clearError();
    if (!email || !password) return;
    loginPassword(email.trim().toLowerCase(), password);
  };

  return (
    <Card>
      <div>
        <button onClick={onBack} className="text-xs mb-3 flex items-center gap-1"
          style={{ color: 'var(--text-faint)' }}>← Back</button>
        <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Staff login</h2>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>Enter your company email and password</p>
      </div>
      <form onSubmit={submit} noValidate className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="you@sewingcircle.io" required autoComplete="email"
            className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
            style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }} />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Password</label>
          <div className="relative">
            <input type={show ? 'text' : 'password'} value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" required autoComplete="current-password"
              className="w-full px-3 py-2.5 pr-10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }} />
            <button type="button" onClick={() => setShow(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-faint)' }}>
              {show ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>
        <ErrorBanner msg={error} />
        <SubmitBtn loading={loading} label="Continue" icon={LogIn} />
      </form>
    </Card>
  );
}

// ── Step: TOTP first-time setup ───────────────────────────────────────────────
function StepSetupTotp() {
  const { totpSetupData, confirmTotpSetup, error, clearError, status } = useAuth();
  const loading = status === 'loading';
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);

  const copySecret = () => {
    navigator.clipboard.writeText(totpSetupData?.secret || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const submit = (e) => {
    e.preventDefault();
    if (code.length !== 6) return;
    clearError();
    confirmTotpSetup(code);
  };

  return (
    <Card>
      <div>
        <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Set up Authenticator</h2>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>
          Scan with Microsoft Authenticator or any TOTP app. This is a one-time setup.
        </p>
      </div>

      {totpSetupData?.otpauthUri && (
        <div className="space-y-3">
          <QrCode uri={totpSetupData.otpauthUri} />
          <div className="flex items-center justify-between px-3 py-2 rounded-lg text-xs"
            style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
            <span className="font-mono truncate flex-1 pr-2">{totpSetupData.secret}</span>
            <button type="button" onClick={copySecret} className="flex items-center gap-1 text-xs flex-shrink-0"
              style={{ color: 'var(--accent)' }}>
              {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
            </button>
          </div>
          <p className="text-xs text-center" style={{ color: 'var(--text-faint)' }}>
            Can't scan? Enter the key manually in your app.
          </p>
        </div>
      )}

      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-center" style={{ color: 'var(--text-secondary)' }}>
            Enter the 6-digit code from your app
          </p>
          <OtpInput value={code} onChange={setCode} />
        </div>
        <ErrorBanner msg={error} />
        <SubmitBtn loading={loading} label="Confirm & Sign In" icon={ShieldCheck} />
      </form>
    </Card>
  );
}

// ── Step: TOTP verify ─────────────────────────────────────────────────────────
function StepVerifyTotp({ onBack }) {
  const { verifyTotp, error, clearError, status } = useAuth();
  const loading = status === 'loading';
  const [code, setCode] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (code.length !== 6) return;
    clearError();
    verifyTotp(code);
  };

  return (
    <Card>
      <div>
        <button onClick={onBack} className="text-xs mb-3 flex items-center gap-1"
          style={{ color: 'var(--text-faint)' }}>← Back</button>
        <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Authenticator code</h2>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>
          Open Microsoft Authenticator and enter the 6-digit code for Sewing Circle Portal.
        </p>
      </div>
      <form onSubmit={submit} className="space-y-4">
        <OtpInput value={code} onChange={setCode} />
        <ErrorBanner msg={error} />
        <SubmitBtn loading={loading} label="Sign In" icon={ShieldCheck} />
      </form>
    </Card>
  );
}

// ── Step: Client email ────────────────────────────────────────────────────────
function StepClientEmail({ onBack }) {
  const { requestOtp, error, clearError, status } = useAuth();
  const loading = status === 'loading';
  const [email, setEmail] = useState('');

  const submit = (e) => {
    e.preventDefault();
    clearError();
    if (!email) return;
    requestOtp(email.trim().toLowerCase());
  };

  return (
    <Card>
      <div>
        <button onClick={onBack} className="text-xs mb-3 flex items-center gap-1"
          style={{ color: 'var(--text-faint)' }}>← Back</button>
        <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Client access</h2>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>
          Enter the email address you were invited with. We'll send a one-time code.
        </p>
      </div>
      <form onSubmit={submit} noValidate className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Email address</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="you@company.com" required autoComplete="email"
            className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
            style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }} />
        </div>
        <ErrorBanner msg={error} />
        <SubmitBtn loading={loading} label="Send Code" icon={Mail} />
      </form>
    </Card>
  );
}

// ── Step: Client OTP verify ───────────────────────────────────────────────────
function StepClientOtp({ onResend }) {
  const { verifyOtp, mfaToken: email, error, clearError, status } = useAuth();
  const loading = status === 'loading';
  const [code, setCode] = useState('');
  const [resent, setResent] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (code.length !== 6) return;
    clearError();
    verifyOtp(code);
  };

  const handleResend = () => {
    onResend();
    setResent(true);
    setTimeout(() => setResent(false), 30000);
  };

  return (
    <Card>
      <div>
        <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Check your email</h2>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>
          A 6-digit code was sent to <strong style={{ color: 'var(--text-secondary)' }}>{email}</strong>.
          It expires in 10 minutes.
        </p>
      </div>
      <form onSubmit={submit} className="space-y-4">
        <OtpInput value={code} onChange={setCode} />
        <ErrorBanner msg={error} />
        <SubmitBtn loading={loading} label="Verify & Sign In" icon={ShieldCheck} />
      </form>
      <div className="text-center">
        <button type="button" onClick={handleResend} disabled={resent || loading}
          className="text-xs flex items-center justify-center gap-1 mx-auto disabled:opacity-50"
          style={{ color: resent ? 'var(--text-ghost)' : 'var(--accent)' }}>
          <RefreshCw size={12} />
          {resent ? 'Code sent' : 'Resend code'}
        </button>
      </div>
    </Card>
  );
}

// ── Main LoginPage ─────────────────────────────────────────────────────────────
export function LoginPage() {
  const { status, clearError } = useAuth();

  // loginType: null | 'staff' | 'client'
  // Stored in sessionStorage so it survives the status transitions
  const [loginType, setLoginType] = useState(() => sessionStorage.getItem('sc_login_type'));

  const setType = (t) => { sessionStorage.setItem('sc_login_type', t); setLoginType(t); };
  const resetType = () => { sessionStorage.removeItem('sc_login_type'); setLoginType(null); clearError(); };

  const isStaff  = loginType === 'staff';
  const isClient = loginType === 'client';
  const isIdle   = status === 'unauthenticated' || status === 'idle';
  const isStep2  = status === 'step1_done';
  const isSetup  = status === 'setup_totp';

  // Clean up type key on successful auth
  useEffect(() => {
    if (status === 'authenticated') sessionStorage.removeItem('sc_login_type');
  }, [status]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: 'var(--bg-base)' }}>
      <div className="w-full max-w-sm space-y-8">

        {/* Branding */}
        <div className="flex flex-col items-center gap-4">
          <img src={logoSrc} alt="Sewing Circle" className="w-20 h-20 object-contain"
            draggable={false} onContextMenu={e => e.preventDefault()} />
          <div className="text-center">
            <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Staff Portal
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-faint)' }}>
              Sewing Circle · IT Recruitment Suite
            </p>
          </div>
        </div>

        {/* Steps */}
        {isIdle && !loginType && (
          <StepChooseType
            onStaff={() => setType('staff')}
            onClient={() => setType('client')}
          />
        )}

        {isIdle && isStaff  && <StepPassword onBack={resetType} />}
        {isIdle && isClient && <StepClientEmail onBack={resetType} />}

        {isSetup && <StepSetupTotp />}

        {isStep2 && isStaff && <StepVerifyTotp onBack={resetType} />}

        {isStep2 && isClient && (
          <StepClientOtp
            onResend={() => {
              const email = useAuth.getState().mfaToken;
              if (email) useAuth.getState().requestOtp(email);
            }}
          />
        )}

        {/* Back to public site */}
        <p className="text-center text-xs">
          <a href="/" style={{ color: 'var(--text-faint)' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent-light)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-faint)'; }}>
            ← Back to Sewing Circle website
          </a>
        </p>
      </div>
    </div>
  );
}
