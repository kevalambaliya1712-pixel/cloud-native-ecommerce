/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SlidersHorizontal, Grid, List, Sparkles, Server, Search, HelpCircle, HardDrive } from 'lucide-react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';
interface ShopAllViewProps {
  products: Product[];
  onViewProduct: (product: Product) => void;
  onQuickAdd: (product: Product) => void;
  filterCategory: string | null;
  setFilterCategory: (category: string | null) => void;
  searchQuery: string;
}

export function ShopAllView({
  products,
  onViewProduct,
  onQuickAdd,
  filterCategory,
  setFilterCategory,
  searchQuery
}: ShopAllViewProps) {
  const [sortOption, setSortOption] = React.useState('featured');
  const [maxPrice, setMaxPrice] = React.useState(500);
  const [showOnlyAzure, setShowOnlyAzure] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');

  // Available categories
  const categories = [
    { name: 'All Resources', id: null },
    { name: 'Compute & VM', id: 'Compute & VM' },
    { name: 'Data & Storage', id: 'Data & Storage' },
    { name: 'IoT DevKit', id: 'IoT DevKit' },
    { name: 'Apparel & Gear', id: 'Apparel & Gear' },
    { name: 'Smart Workspace', id: 'Smart Workspace' }
  ];

  // Filtering products
  const filteredProducts = React.useMemo(() => {
    return products.filter((prod) => {
      // 1. Category Filter
      if (filterCategory && prod.category !== filterCategory) return false;
      // 2. Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const nameMatch = prod.name.toLowerCase().includes(query);
        const descMatch = prod.description.toLowerCase().includes(query);
        const skuMatch = prod.sku.toLowerCase().includes(query);
        const catMatch = prod.category.toLowerCase().includes(query);
        if (!nameMatch && !descMatch && !skuMatch && !catMatch) return false;
      }
      // 3. Price Filter (VM configurations can exceed 500, let's keep VM price filtering flexible)
      if (prod.price > maxPrice) return false;
      // 4. Azure filter
      if (showOnlyAzure && !prod.isAzureResource) return false;

      return true;
    });
  }, [filterCategory, searchQuery, maxPrice, showOnlyAzure]);

  // Sorting products
  const sortedProducts = React.useMemo(() => {
    const list = [...filteredProducts];
    if (sortOption === 'price-asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'price-desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortOption === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } // 'featured' keeps original ordering
    return list;
  }, [filteredProducts, sortOption]);

  return (
    <div id="shop-all-view" className="bg-slate-50/50 pb-20">
      
      {/* 1. HERO BANNER RECREATION */}
      <div id="shop-hero-banner" className="relative mx-auto mt-6 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 px-8 py-16 text-white sm:px-16 lg:py-20 shadow-xl shadow-slate-900/10">
          
          {/* Accent circles and grid */}
          <div className="absolute right-0 top-0 h-full w-1/2 opacity-20 bg-[linear-gradient(to_right,#3b82f6_1px,transparent_1px),linear-gradient(to_bottom,#3b82f6_1px,transparent_1px)] bg-[size:32px_32px]" />
          <div className="absolute right-10 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-blue-500/20 blur-3xl" />
          
          <div className="relative z-10 max-w-xl">
            <span id="hero-badge" className="inline-flex items-center space-x-1 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-300">
              <Sparkles className="h-3 text-amber-400" />
              <span>Fall Deployment Collection '26</span>
            </span>
            <h1 id="hero-title" className="mt-4 font-sans text-3xl font-extrabold tracking-tight sm:text-5xl">
              Azure Architecture &amp; Workspace Gear.
            </h1>
            <p id="hero-subtitle" className="mt-4 text-sm text-slate-300 leading-relaxed sm:text-base">
              Elevate your cloud operations. Purchase certified high-fidelity virtual machine clusters, cosmos configurations, or hand-crafted workspace physical apparel optimized for telemetry.
            </p>
            <div id="hero-actions" className="mt-8 flex flex-wrap gap-4">
              <button 
                id="hero-primary-cta"
                onClick={() => setFilterCategory('Compute & VM')}
                className="rounded-full bg-blue-600 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-500 hover:shadow-blue-500/30"
              >
                Provision Compute Nodes
              </button>
              <button 
                id="hero-secondary-cta"
                onClick={() => setFilterCategory('IoT DevKit')}
                className="rounded-full bg-slate-800/80 px-6 py-3 text-xs font-bold text-slate-100 border border-slate-700/60 transition hover:bg-slate-700"
              >
                Assemble IoT Bundles
              </button>
            </div>
          </div>
          
          {/* FLOATING RETRO IMAGE (Chair mockup or representation) */}
          <div className="absolute bottom-[-40px] right-8 hidden lg:block w-[360px] h-[360px] max-w-sm pointer-events-none">
            <div className="relative flex h-full w-full items-center justify-center">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAUIrT68Vdcc6J13lbQ02tL1jGBve83YknLAgQIeA7SiG0k_WB7YmU5_69zvk2GZxPQD2lIAlLYRNdNwuHzH5PWg5B6GBrTzzztSnP3-GBZ4PkUa6RfySEDvICjGlatEKtBNCGkurGcmMBeWHtv6f0B1_X501NW6UT5ja9bdZ6AvaEHheEV-x5RCWRxrQi4lhBvVv6lugpHmSPUN-ID28Zxm3s0zU0ZK5UFzda-bwP4D03V3GVm3-qUvkj8Hm6X8tY_z4yELzkEzlpY"
                alt="Azure Minimal Chair Mockup"
                referrerPolicy="no-referrer"
                className="h-72 w-72 rounded-full object-cover border-4 border-slate-800/80 shadow-2xl drop-shadow-xl animate-bounce-slow"
                style={{ animationDuration: '6s' }}
              />
            </div>
          </div>

        </div>
      </div>

      {/* 2. MAIN GRID AND FILTERS SECTION */}
      <div id="shop-catalog-section" className="mx-auto mt-12 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:gap-8">
          
          {/* LEFT FILTER SIDEBAR */}
          <aside id="shop-filter-sidebar" className="w-full shrink-0 lg:w-64">
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="flex items-center space-x-2 text-sm font-bold text-slate-900">
                  <SlidersHorizontal className="h-4 w-4 text-blue-600" />
                  <span>Interactive Refiners</span>
                </h3>
                {(filterCategory || searchQuery || maxPrice < 500 || showOnlyAzure) && (
                  <button
                    id="clear-all-filters-btn"
                    onClick={() => {
                      setFilterCategory(null);
                      setMaxPrice(500);
                      setShowOnlyAzure(false);
                    }}
                    className="text-[10px] font-bold uppercase text-rose-500 hover:underline"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* REFINER: CATEGORIES */}
              <div className="mt-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Class Service</h4>
                <div className="mt-3.5 space-y-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.name}
                      onClick={() => setFilterCategory(cat.id)}
                      className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium transition ${
                        filterCategory === cat.id
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                      }`}
                    >
                      <span>{cat.name}</span>
                      {filterCategory === cat.id && <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* REFINER: AZURE SPECIFIC INSTANCES (SWITCH) */}
              <div className="mt-8 border-t border-slate-100 pt-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Deployable Logic</h4>
                <label className="mt-4 flex cursor-pointer items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">Only Azure Resources</span>
                  <input
                    type="checkbox"
                    checked={showOnlyAzure}
                    onChange={(e) => setShowOnlyAzure(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </label>
              </div>

              {/* REFINER: MAX PRICE RANGE SLIDER */}
              <div className="mt-8 border-t border-slate-100 pt-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Price ceiling limit</h4>
                <div className="mt-4">
                  <input
                    type="range"
                    min="10"
                    max="500"
                    step="10"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-blue-600"
                  />
                  <div className="mt-2.5 flex items-center justify-between font-mono text-[10px] text-slate-500">
                    <span>Min: $10</span>
                    <span className="font-bold text-slate-900">Max: ${maxPrice}</span>
                  </div>
                </div>
              </div>

            </div>
          </aside>

          {/* MAIN PRODUCT LIST GRID */}
          <main id="shop-products-main" className="flex-1 mt-8 lg:mt-0">
            
            {/* GRID CONTROLS HEADER */}
            <div id="shop-grid-controls" className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5">
              <div id="results-count">
                <p className="text-xs font-semibold text-slate-500">
                  Showing <span className="text-slate-900">{sortedProducts.length}</span> assets matching parameters
                </p>
              </div>

              <div id="controls-panel" className="flex items-center justify-between sm:justify-end gap-4">
                
                {/* SORT METHOD SELECTOR */}
                <div id="sort-sel-box" className="flex items-center space-x-2">
                  <span className="text-xs font-semibold text-slate-400">Sort:</span>
                  <select
                    id="sort-select"
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 outline-none transition focus:border-blue-500"
                  >
                    <option value="featured">Featured Registry</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="rating">Top Customer Rated</option>
                  </select>
                </div>

                {/* LAYOUT SWAPPERS (Aesthetic decoration) */}
                <div id="view-mode-toggles" className="hidden sm:flex items-center rounded-lg border border-slate-200 bg-white p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`rounded p-1 transition ${
                      viewMode === 'grid' ? 'bg-slate-100 text-blue-600' : 'text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`rounded p-1 transition ${
                      viewMode === 'list' ? 'bg-slate-100 text-blue-600' : 'text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>

              </div>
            </div>

            {/* DYNAMIC PRODUCTS FEED */}
            {sortedProducts.length === 0 ? (
              <div id="empty-state-card" className="mt-12 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-400">
                  <Search className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-sm font-bold text-slate-950">No blueprints registered</h3>
                <p className="mt-1 max-w-xs text-xs text-slate-500 leading-normal">
                  No products or virtual architectures match your filter limits. Try clearing your search parameters or reducing refiner parameters!
                </p>
                <button
                  id="reset-filters-cta"
                  onClick={() => {
                    setFilterCategory(null);
                    setMaxPrice(500);
                    setShowOnlyAzure(false);
                  }}
                  className="mt-6 rounded-full bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-blue-500"
                >
                  Show All Assets
                </button>
              </div>
            ) : (
              <div id="catalog-grid" className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {sortedProducts.map((prod) => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    onViewDetails={onViewProduct}
                    onQuickAdd={onQuickAdd}
                  />
                ))}
              </div>
            )}

          </main>

        </div>
      </div>

    </div>
  );
}
