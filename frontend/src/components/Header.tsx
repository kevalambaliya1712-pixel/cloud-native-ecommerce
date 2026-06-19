/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShoppingCart, Search, User, ChevronDown, Menu, X, Store, Package, LayoutDashboard } from 'lucide-react';
import { CartItem } from '../types';
import { useAuth } from '../contexts/AuthContext.js';
import { AuthModal } from './AuthModal.js';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  cart: CartItem[];
  setFilterCategory: (category: string | null) => void;
  onSearchChange: (search: string) => void;
  searchQuery: string;
}

const categories = [
  { name: 'Electronics', icon: '📱' },
  { name: 'Fashion', icon: '👕' },
  { name: 'Home & Kitchen', icon: '🏠' },
  { name: 'Sports', icon: '⚽' },
  { name: 'Beauty', icon: '✨' },
  { name: 'Books', icon: '📚' },
  { name: 'Toys', icon: '🧸' },
  { name: 'Grocery', icon: '🛒' },
];

export function Header({
  activeTab,
  setActiveTab,
  cart,
  setFilterCategory,
  onSearchChange,
  searchQuery
}: HeaderProps) {
  const { user, logout } = useAuth();
  const [authModalOpen, setAuthModalOpen] = React.useState(false);
  const [showCategories, setShowCategories] = React.useState(false);
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const totalCartItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleCategoryClick = (category: string | null) => {
    setFilterCategory(category);
    setActiveTab('shop');
    setShowCategories(false);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header id="main-header" style={{
        position: 'sticky', top: 0, zIndex: 100, background: 'var(--primary)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.15)'
      }}>
        {/* Top Bar */}
        <div style={{
          maxWidth: 1400, margin: '0 auto', padding: '0 16px',
          display: 'flex', alignItems: 'center', height: 60, gap: 24
        }}>
          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'none', background: 'none', border: 'none', color: 'white',
              cursor: 'pointer', padding: 4
            }}
            className="mobile-menu-btn"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Logo */}
          <div
            id="logo-wrapper"
            onClick={() => { handleCategoryClick(null); onSearchChange(''); }}
            style={{ cursor: 'pointer', flexShrink: 0 }}
          >
            <div style={{ color: 'white', fontWeight: 800, fontSize: 22, letterSpacing: -0.5, lineHeight: 1 }}>
              Cloud<span style={{ color: '#ffe500' }}>Kart</span>
            </div>
            <div style={{
              fontSize: 10, color: 'rgba(255,255,255,0.7)', fontStyle: 'italic',
              display: 'flex', alignItems: 'center', gap: 4, marginTop: 1
            }}>
              <span style={{ color: '#ffe500', fontSize: 8 }}>★</span>
              Explore <span style={{ fontWeight: 600, color: '#ffe500' }}>Plus</span>
            </div>
          </div>

          {/* Search Bar */}
          <div id="header-search-box" style={{
            flex: 1, maxWidth: 600, position: 'relative'
          }}>
            <input
              id="header-search-input"
              type="text"
              placeholder="Search for products, brands and more"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => setActiveTab('shop')}
              style={{
                width: '100%', padding: '10px 44px 10px 16px', borderRadius: 4,
                border: 'none', fontSize: 14, fontFamily: 'inherit',
                outline: 'none', background: 'white'
              }}
            />
            <Search size={20} style={{
              position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
              color: 'var(--primary)'
            }} />
          </div>

          {/* Nav Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* User Auth */}
            {user ? (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6, background: 'none',
                    border: 'none', color: 'white', cursor: 'pointer', padding: '6px 12px',
                    fontFamily: 'inherit', fontSize: 14, fontWeight: 600
                  }}
                >
                  <User size={18} />
                  <span style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.name || user.email.split('@')[0]}
                  </span>
                  <ChevronDown size={14} />
                </button>

                {showUserMenu && (
                  <div style={{
                    position: 'absolute', top: '100%', right: 0, marginTop: 8,
                    background: 'white', borderRadius: 8, boxShadow: 'var(--shadow-lg)',
                    minWidth: 200, overflow: 'hidden', zIndex: 50, animation: 'fadeIn 0.2s ease'
                  }}>
                    <div style={{ padding: '14px 16px', borderBottom: '1px solid #f0f0f0' }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                        {user.name || user.email.split('@')[0]}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{user.email}</div>
                      <div style={{
                        marginTop: 4, fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                        color: user.role === 'seller' ? '#e65100' : 'var(--primary)',
                        background: user.role === 'seller' ? '#fff3e0' : 'var(--primary-light)',
                        display: 'inline-block', padding: '2px 8px', borderRadius: 4
                      }}>
                        {user.role}
                      </div>
                    </div>

                    {user.role === 'seller' && (
                      <button
                        onClick={() => { setActiveTab('seller-dashboard'); setShowUserMenu(false); }}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                          padding: '12px 16px', border: 'none', background: 'none',
                          cursor: 'pointer', fontSize: 13, color: 'var(--text-primary)',
                          fontFamily: 'inherit', textAlign: 'left',
                          borderBottom: '1px solid #f5f5f5'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#f5f5f5')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                      >
                        <LayoutDashboard size={16} color="var(--primary)" />
                        Seller Dashboard
                      </button>
                    )}

                    <button
                      onClick={() => { setActiveTab('orders'); setShowUserMenu(false); }}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                        padding: '12px 16px', border: 'none', background: 'none',
                        cursor: 'pointer', fontSize: 13, color: 'var(--text-primary)',
                        fontFamily: 'inherit', textAlign: 'left',
                        borderBottom: '1px solid #f5f5f5'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#f5f5f5')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                    >
                      <Package size={16} color="var(--primary)" />
                      My Orders
                    </button>

                    <button
                      onClick={() => { logout(); setShowUserMenu(false); }}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                        padding: '12px 16px', border: 'none', background: 'none',
                        cursor: 'pointer', fontSize: 13, color: 'var(--danger)',
                        fontFamily: 'inherit', textAlign: 'left'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#fef2f2')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                style={{
                  padding: '8px 32px', background: 'white', color: 'var(--primary)',
                  border: 'none', borderRadius: 2, fontSize: 14, fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'inherit', letterSpacing: 0.3
                }}
              >
                Login
              </button>
            )}

            {/* Become a Seller */}
            {user?.role !== 'seller' && (
              <button
                onClick={() => user ? undefined : setAuthModalOpen(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, background: 'none',
                  border: 'none', color: 'white', cursor: 'pointer', padding: '6px 12px',
                  fontFamily: 'inherit', fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap'
                }}
              >
                <Store size={16} />
                Become a Seller
              </button>
            )}

            {/* Cart */}
            <button
              id="header-cart-btn"
              onClick={() => setActiveTab('cart')}
              style={{
                position: 'relative', display: 'flex', alignItems: 'center', gap: 6,
                background: 'none', border: 'none', color: 'white', cursor: 'pointer',
                padding: '6px 12px', fontFamily: 'inherit', fontSize: 14, fontWeight: 700
              }}
            >
              <div style={{ position: 'relative' }}>
                <ShoppingCart size={20} />
                {totalCartItems > 0 && (
                  <span id="cart-counter-badge" style={{
                    position: 'absolute', top: -8, right: -10,
                    background: 'var(--danger)', color: 'white', fontSize: 10,
                    fontWeight: 800, minWidth: 18, height: 18, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '2px solid var(--primary)'
                  }}>
                    {totalCartItems}
                  </span>
                )}
              </div>
              <span>Cart</span>
            </button>
          </div>
        </div>

        {/* Category Navigation Bar */}
        <div style={{
          background: 'rgba(0,0,0,0.12)', borderTop: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{
            maxWidth: 1400, margin: '0 auto', padding: '0 16px',
            display: 'flex', alignItems: 'center', gap: 0, overflowX: 'auto'
          }}>
            <button
              onClick={() => handleCategoryClick(null)}
              style={{
                padding: '10px 20px', background: 'none', border: 'none',
                color: activeTab === 'shop' && !showCategories ? '#ffe500' : 'rgba(255,255,255,0.85)',
                cursor: 'pointer', fontSize: 13, fontWeight: 600,
                fontFamily: 'inherit', whiteSpace: 'nowrap',
                borderBottom: activeTab === 'shop' ? '2px solid #ffe500' : '2px solid transparent',
                transition: 'all 0.2s'
              }}
            >
              All Products
            </button>
            {categories.map(cat => (
              <button
                key={cat.name}
                onClick={() => handleCategoryClick(cat.name)}
                style={{
                  padding: '10px 16px', background: 'none', border: 'none',
                  color: 'rgba(255,255,255,0.85)', cursor: 'pointer',
                  fontSize: 13, fontWeight: 500, fontFamily: 'inherit',
                  whiteSpace: 'nowrap', transition: 'color 0.2s',
                  display: 'flex', alignItems: 'center', gap: 6,
                  borderBottom: '2px solid transparent'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#ffe500'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; }}
              >
                <span>{cat.icon}</span>
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </header>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      {/* Click outside handler for user menu */}
      {showUserMenu && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 49 }}
          onClick={() => setShowUserMenu(false)}
        />
      )}

      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn { display: block !important; }
          #header-search-box { display: ${mobileMenuOpen ? 'block' : 'none'} !important; }
        }
      `}</style>
    </>
  );
}
