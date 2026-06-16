/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShoppingBag, Sparkles, Server, Cpu, Layers, Heart, Search } from 'lucide-react';
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
  const totalCartItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleCategoryNav = (category: string | null) => {
    setFilterCategory(category);
    setActiveTab('shop');
  };

  return (
    <header id="main-header" className="sticky top-0 z-40 w-full border-b border-slate-100 bg-white/80 backdrop-blur-md">
      <div id="header-container" className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* LOGO SECTION */}
        <div 
          id="logo-wrapper" 
          onClick={() => handleCategoryNav(null)} 
          className="flex cursor-pointer items-center space-x-2.5"
        >
          <div id="logo-icon-bg" className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md shadow-blue-200">
            <Server id="logo-icon" className="h-5 w-5" />
          </div>
          <div id="logo-text-block">
            <span id="logo-title" className="font-sans text-lg font-bold tracking-tight text-slate-950">
              Cloud<span className="text-blue-600">Commerce</span>
            </span>
            <span id="logo-subtitle" className="block text-[9px] font-mono font-medium tracking-wide text-slate-400 uppercase">
              Azure Partner
            </span>
          </div>
        </div>

        {/* NAVIGATION LINKS */}
        <nav id="header-nav" className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
          <button 
            id="nav-link-shop"
            onClick={() => handleCategoryNav(null)}
            className={`transition-colors hover:text-blue-600 ${
              activeTab === 'shop' ? 'text-blue-600 font-semibold' : ''
            }`}
          >
            Shop All
          </button>
          
          <button 
            id="nav-link-compute"
            onClick={() => handleCategoryNav('Compute & VM')}
            className="flex items-center space-x-1 transition-colors hover:text-blue-600"
          >
            <Cpu className="h-4 w-4 text-emerald-500" />
            <span>Compute & Databases</span>
          </button>

          <button 
            id="nav-link-accessories"
            onClick={() => handleCategoryNav('IoT DevKit')}
            className="flex items-center space-x-1 transition-colors hover:text-blue-600"
          >
            <Layers className="h-4 w-4 text-indigo-500" />
            <span>Developer Gear</span>
          </button>

          {/* DYNAMIC AI WORKSPACE ARCHITECT ADVOCATE BUTTON */}
          <button 
            id="nav-link-advisor"
            onClick={() => setActiveTab('advisor')}
            className={`flex items-center space-x-1.5 rounded-full bg-blue-50 px-3.5 py-1.5 text-xs text-blue-700 font-semibold shadow-sm transition-all hover:bg-blue-100 ${
              activeTab === 'advisor' ? 'ring-2 ring-blue-600 ring-offset-2' : ''
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
            <span>AI Azure Architect</span>
          </button>
        </nav>

        {/* SEARCH & ACTIONS */}
        <div id="header-actions" className="flex items-center space-x-4">
          
          {/* SEARCH BAR INPUT */}
          <div id="header-search-box" className="relative hidden sm:block w-48 md:w-64">
            <input
              id="header-search-input"
              type="text"
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full rounded-full border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-4 text-xs font-medium placeholder-slate-400 outline-none transition-colors focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
            />
            <Search id="header-search-icon" className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          </div>

          {/* WISHLIST BUTTON (Aesthetic) */}
          <button 
            id="header-wishlist-btn"
            onClick={() => handleCategoryNav('Apparel & Gear')}
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
            title="SaaS Merch Apparel"
          >
            <Heart className="h-5 w-5" />
          </button>

          {/* SHOPPING CART BUBBLE TOGGLE */}
          <button 
            id="header-cart-btn"
            onClick={() => setActiveTab('cart')}
            className="relative rounded-full p-2 text-slate-700 hover:bg-slate-100 transition mr-2"
          >
            <ShoppingBag className="h-5 w-5" />
            {totalCartItems > 0 && (
              <span id="cart-counter-badge" className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                {totalCartItems}
              </span>
            )}
          </button>

          {/* USER AUTH SYSTEM */}
          {user ? (
            <div className="flex items-center space-x-2">
              <span className="hidden lg:inline text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-full">
                Hi, {user.name || user.email.split('@')[0]}
              </span>
              <button 
                onClick={logout}
                className="rounded-full bg-slate-200 px-3.5 py-1.5 text-[10px] font-bold text-slate-700 hover:bg-slate-300 transition"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setAuthModalOpen(true)}
              className="rounded-full bg-blue-600 px-4 py-1.5 text-xs font-bold text-white shadow-md shadow-blue-200 hover:bg-blue-500 transition"
            >
              Sign In
            </button>
          )}

          <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
        </div>

      </div>
    </header>
  );
}
