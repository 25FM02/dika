import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wallet, Mail, Lock, AlertCircle } from 'lucide-react';
import { AUTH_ERRORS } from '../services/auth/constant';

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError(AUTH_ERRORS.EMAIL_REQUIRED);
      return;
    }

    try {
      setError(null);
      setSubmitting(true);
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card glass-card fade-in">
        <div className="auth-brand">
          <div className="brand-logo">
            <Wallet size={32} />
          </div>
          <h2>Chào mừng quay trở lại</h2>
          <p>Quản lý tài chính cá nhân của bạn thông minh hơn</p>
        </div>

        {error && (
          <div className="auth-error">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                id="email"
                className="form-input"
                placeholder="example@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={submitting}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Mật khẩu</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                id="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={submitting}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary auth-submit-btn" 
            disabled={submitting}
          >
            {submitting ? 'Đang xác thực...' : 'Đăng nhập'}
          </button>
        </form>

        <div className="auth-footer">
          Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
        </div>
      </div>

      <style>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.15) 0%, var(--bg-primary) 70%);
          padding: 1.5rem;
        }
        .auth-card {
          width: 100%;
          max-width: 440px;
          padding: 2.5rem !important;
        }
        .auth-brand {
          text-align: center;
          margin-bottom: 2rem;
        }
        .brand-logo {
          width: 64px;
          height: 64px;
          border-radius: var(--radius-md);
          background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
          color: white;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
          box-shadow: var(--shadow-accent);
          animation: pulse-glow 3s infinite;
        }
        .auth-brand h2 {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
        }
        .auth-brand p {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }
        .auth-error {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background-color: var(--color-danger-bg);
          color: var(--color-danger);
          padding: 0.8rem 1rem;
          border-radius: var(--radius-sm);
          font-size: 0.85rem;
          margin-bottom: 1.5rem;
          border: 1px solid rgba(239, 68, 68, 0.2);
          font-weight: 500;
        }
        .input-with-icon {
          position: relative;
        }
        .input-with-icon .form-input {
          padding-left: 2.75rem;
        }
        .input-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          pointer-events: none;
        }
        .auth-submit-btn {
          width: 100%;
          margin-top: 1rem;
          padding: 0.9rem !important;
        }
        .auth-footer {
          margin-top: 2rem;
          text-align: center;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }
        .auth-footer a {
          color: var(--accent-primary);
          text-decoration: none;
          font-weight: 600;
        }
        .auth-footer a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default Login;
