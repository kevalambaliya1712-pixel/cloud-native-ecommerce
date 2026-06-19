import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.js';
import { X, LogIn, UserPlus, Store } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [isSeller, setIsSeller] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password, name, isSeller ? 'seller' : 'customer', storeName, phone);
      }
      onClose();
      setEmail(''); setPassword(''); setName(''); setStoreName(''); setPhone('');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', padding: 16
    }}>
      <div className="animate-fadeIn" style={{
        width: '100%', maxWidth: 420, background: 'white',
        borderRadius: 8, overflow: 'hidden', boxShadow: 'var(--shadow-lg)'
      }}>
        {/* Header Section */}
        <div style={{
          background: 'var(--primary)', padding: '32px 28px',
          position: 'relative'
        }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute', right: 12, top: 12,
              background: 'rgba(255,255,255,0.15)', border: 'none',
              borderRadius: '50%', width: 32, height: 32,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>

          <h2 style={{ color: 'white', fontSize: 24, fontWeight: 700, marginBottom: 6 }}>
            {isLogin ? 'Welcome Back!' : isSeller ? 'Become a Seller' : 'Create Account'}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13 }}>
            {isLogin
              ? 'Sign in to access your orders and cart'
              : isSeller
              ? 'Register your store and start selling'
              : 'Join CloudKart for the best shopping experience'}
          </p>
        </div>

        {/* Form Section */}
        <div style={{ padding: '24px 28px' }}>
          {error && (
            <div style={{
              marginBottom: 16, padding: 12, borderRadius: 6,
              background: '#fef2f2', border: '1px solid #fecaca',
              fontSize: 13, fontWeight: 500, color: 'var(--danger)'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="input"
                  />
                </div>

                {/* Role Toggle */}
                <div style={{
                  marginBottom: 14, display: 'flex', gap: 8
                }}>
                  <button
                    type="button"
                    onClick={() => setIsSeller(false)}
                    style={{
                      flex: 1, padding: '10px 12px', borderRadius: 6,
                      border: `2px solid ${!isSeller ? 'var(--primary)' : 'var(--border)'}`,
                      background: !isSeller ? 'var(--primary-light)' : 'white',
                      color: !isSeller ? 'var(--primary)' : 'var(--text-secondary)',
                      fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                    }}
                  >
                    <UserPlus size={16} />
                    Buyer
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSeller(true)}
                    style={{
                      flex: 1, padding: '10px 12px', borderRadius: 6,
                      border: `2px solid ${isSeller ? '#e65100' : 'var(--border)'}`,
                      background: isSeller ? '#fff3e0' : 'white',
                      color: isSeller ? '#e65100' : 'var(--text-secondary)',
                      fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                    }}
                  >
                    <Store size={16} />
                    Seller
                  </button>
                </div>

                {isSeller && (
                  <>
                    <div style={{ marginBottom: 14 }}>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                        Store Name
                      </label>
                      <input
                        type="text"
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        placeholder="My Awesome Store"
                        className="input"
                        required
                      />
                    </div>
                    <div style={{ marginBottom: 14 }}>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 234 567 8900"
                        className="input"
                      />
                    </div>
                  </>
                )}
              </>
            )}

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input"
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input"
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{
                width: '100%', padding: '14px 24px', fontSize: 15,
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? 'Please wait...' : isLogin ? 'Sign In' : isSeller ? 'Register as Seller' : 'Create Account'}
            </button>
          </form>

          {/* Footer toggle */}
          <div style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: 'var(--text-secondary)' }}>
            {isLogin ? (
              <>
                New to CloudKart?{' '}
                <button
                  onClick={() => setIsLogin(false)}
                  style={{
                    background: 'none', border: 'none', color: 'var(--primary)',
                    fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13
                  }}
                >
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => { setIsLogin(true); setIsSeller(false); }}
                  style={{
                    background: 'none', border: 'none', color: 'var(--primary)',
                    fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13
                  }}
                >
                  Sign In
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
