/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SlidersHorizontal, Grid, Star, TrendingUp, Zap, Search } from 'lucide-react';
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

const allCategories = [
  { name: 'All', id: null, icon: '🛍️' },
  { name: 'Electronics', id: 'Electronics', icon: '📱' },
  { name: 'Fashion', id: 'Fashion', icon: '👕' },
  { name: 'Home & Kitchen', id: 'Home & Kitchen', icon: '🏠' },
  { name: 'Sports', id: 'Sports', icon: '⚽' },
  { name: 'Beauty', id: 'Beauty', icon: '✨' },
  { name: 'Books', id: 'Books', icon: '📚' },
  { name: 'Toys', id: 'Toys', icon: '🧸' },
  { name: 'Grocery', id: 'Grocery', icon: '🛒' },
];

export function ShopAllView({
  products, onViewProduct, onQuickAdd, filterCategory, setFilterCategory, searchQuery
}: ShopAllViewProps) {
  const [sortOption, setSortOption] = React.useState('featured');
  const [maxPrice, setMaxPrice] = React.useState(2000);
  const [showFilters, setShowFilters] = React.useState(true);

  const filteredProducts = React.useMemo(() => {
    return products.filter((prod) => {
      if (filterCategory && prod.category !== filterCategory) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!prod.name.toLowerCase().includes(q) && !prod.description.toLowerCase().includes(q) &&
            !prod.brand.toLowerCase().includes(q) && !prod.category.toLowerCase().includes(q)) return false;
      }
      if (prod.price > maxPrice) return false;
      return true;
    });
  }, [products, filterCategory, searchQuery, maxPrice]);

  const sortedProducts = React.useMemo(() => {
    const list = [...filteredProducts];
    if (sortOption === 'price-asc') list.sort((a, b) => a.price - b.price);
    else if (sortOption === 'price-desc') list.sort((a, b) => b.price - a.price);
    else if (sortOption === 'rating') list.sort((a, b) => b.rating - a.rating);
    else if (sortOption === 'newest') list.sort((a, b) => b.ratingCount - a.ratingCount);
    return list;
  }, [filteredProducts, sortOption]);

  // Get top deals for hero section
  const topDeals = products.filter(p => p.originalPrice && p.originalPrice > p.price).slice(0, 6);

  return (
    <div id="shop-all-view" style={{ background: 'var(--bg-primary)', minHeight: '100vh', paddingBottom: 40 }}>

      {/* Hero Banner */}
      {!filterCategory && !searchQuery && (
        <div className="animate-fadeIn" style={{
          background: 'linear-gradient(135deg, #1a237e 0%, #283593 30%, #3949ab 60%, #5c6bc0 100%)',
          padding: '48px 0', marginBottom: 24
        }}>
          <div className="container" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24
          }}>
            <div style={{ maxWidth: 560 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: '6px 14px',
                marginBottom: 16
              }}>
                <Zap size={14} color="#ffe500" />
                <span style={{ color: '#ffe500', fontSize: 12, fontWeight: 700 }}>MEGA SALE LIVE NOW</span>
              </div>
              <h1 style={{
                color: 'white', fontSize: 40, fontWeight: 800, lineHeight: 1.15,
                letterSpacing: -0.5, marginBottom: 12
              }}>
                Shop the Best Deals on <span style={{ color: '#ffe500' }}>CloudKart</span>
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, lineHeight: 1.6, marginBottom: 24 }}>
                Discover millions of products from verified sellers. Free delivery, easy returns, and the best prices guaranteed.
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button
                  onClick={() => setFilterCategory('Electronics')}
                  className="btn btn-accent"
                  style={{ padding: '12px 28px', borderRadius: 4, fontSize: 14 }}
                >
                  <TrendingUp size={16} /> Shop Electronics
                </button>
                <button
                  onClick={() => setFilterCategory('Fashion')}
                  className="btn"
                  style={{
                    padding: '12px 28px', borderRadius: 4, fontSize: 14,
                    background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)'
                  }}
                >
                  Trending Fashion
                </button>
              </div>
            </div>

            {/* Deal Cards Mini */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, maxWidth: 380
            }}>
              {topDeals.slice(0, 3).map(deal => (
                <div
                  key={deal.id}
                  onClick={() => onViewProduct(deal)}
                  style={{
                    background: 'rgba(255,255,255,0.1)', borderRadius: 8, padding: 12,
                    cursor: 'pointer', textAlign: 'center', backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.15)', transition: 'transform 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <img
                    src={deal.image} alt={deal.name} referrerPolicy="no-referrer"
                    style={{ width: 60, height: 60, objectFit: 'contain', marginBottom: 8 }}
                  />
                  <div style={{ color: '#ffe500', fontSize: 12, fontWeight: 700 }}>
                    {Math.round(((deal.originalPrice! - deal.price) / deal.originalPrice!) * 100)}% OFF
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10, marginTop: 2 }}>
                    From ${deal.price}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Category Strip */}
      {!searchQuery && (
        <div className="container" style={{ marginBottom: 20 }}>
          <div style={{
            display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4
          }}>
            {allCategories.map(cat => (
              <button
                key={cat.name}
                onClick={() => setFilterCategory(cat.id)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  padding: '12px 20px', borderRadius: 8, border: 'none',
                  background: filterCategory === cat.id ? 'var(--primary)' : 'white',
                  color: filterCategory === cat.id ? 'white' : 'var(--text-primary)',
                  cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 600,
                  minWidth: 90, boxShadow: 'var(--shadow-sm)', transition: 'all 0.2s',
                  flexShrink: 0
                }}
              >
                <span style={{ fontSize: 24 }}>{cat.icon}</span>
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Layout */}
      <div className="container">
        <div style={{ display: 'flex', gap: 20 }}>

          {/* Sidebar Filters */}
          <aside style={{
            width: 240, flexShrink: 0, display: showFilters ? 'block' : 'none'
          }}>
            <div className="card" style={{ padding: 20, position: 'sticky', top: 130 }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid #f0f0f0'
              }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <SlidersHorizontal size={16} color="var(--primary)" />
                  Filters
                </h3>
                {(filterCategory || maxPrice < 2000) && (
                  <button
                    onClick={() => { setFilterCategory(null); setMaxPrice(2000); }}
                    style={{
                      background: 'none', border: 'none', color: 'var(--primary)',
                      fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit'
                    }}
                  >
                    CLEAR ALL
                  </button>
                )}
              </div>

              {/* Price Range */}
              <div style={{ marginBottom: 24 }}>
                <h4 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 12 }}>
                  Price Range
                </h4>
                <input
                  type="range"
                  min="10"
                  max="2000"
                  step="10"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--primary)' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)', marginTop: 6 }}>
                  <span>$10</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Up to ${maxPrice}</span>
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <h4 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 12 }}>
                  Category
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {allCategories.map(cat => (
                    <button
                      key={cat.name}
                      onClick={() => setFilterCategory(cat.id)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '8px 10px', borderRadius: 6, border: 'none',
                        background: filterCategory === cat.id ? 'var(--primary-light)' : 'transparent',
                        color: filterCategory === cat.id ? 'var(--primary)' : 'var(--text-primary)',
                        fontWeight: filterCategory === cat.id ? 700 : 500,
                        cursor: 'pointer', fontFamily: 'inherit', fontSize: 13,
                        textAlign: 'left', transition: 'background 0.15s'
                      }}
                    >
                      <span>{cat.icon} {cat.name}</span>
                      {filterCategory === cat.id && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)' }} />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <main style={{ flex: 1 }}>
            {/* Toolbar */}
            <div className="card" style={{
              padding: '12px 20px', marginBottom: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>
                Showing <strong style={{ color: 'var(--text-primary)' }}>{sortedProducts.length}</strong> products
                {filterCategory && <> in <strong style={{ color: 'var(--primary)' }}>{filterCategory}</strong></>}
                {searchQuery && <> for "<strong style={{ color: 'var(--primary)' }}>{searchQuery}</strong>"</>}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>Sort by:</span>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="input"
                  style={{ width: 'auto', padding: '6px 12px', fontSize: 13 }}
                >
                  <option value="featured">Relevance</option>
                  <option value="price-asc">Price — Low to High</option>
                  <option value="price-desc">Price — High to Low</option>
                  <option value="rating">Customer Rating</option>
                  <option value="newest">Popularity</option>
                </select>
              </div>
            </div>

            {/* Product Grid */}
            {sortedProducts.length === 0 ? (
              <div className="card animate-fadeIn" style={{
                padding: 60, textAlign: 'center', display: 'flex',
                flexDirection: 'column', alignItems: 'center'
              }}>
                <div style={{
                  width: 64, height: 64, borderRadius: '50%', background: '#f5f5f5',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16
                }}>
                  <Search size={28} color="#b0b0b0" />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>No products found</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 320, marginBottom: 20 }}>
                  Try adjusting your filters or search query to find what you're looking for.
                </p>
                <button
                  onClick={() => { setFilterCategory(null); setMaxPrice(2000); }}
                  className="btn btn-primary"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
                gap: 16
              }}>
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
