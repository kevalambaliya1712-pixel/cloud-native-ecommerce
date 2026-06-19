/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
  onQuickAdd: (product: Product) => void;
}

export function ProductCard({ product, onViewDetails, onQuickAdd }: ProductCardProps) {
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div
      id={`product-card-${product.id}`}
      className="card"
      onClick={() => onViewDetails(product)}
      style={{
        cursor: 'pointer', overflow: 'hidden', display: 'flex', flexDirection: 'column',
        transition: 'transform 0.2s ease, box-shadow 0.3s ease', position: 'relative'
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
    >
      {/* Badge */}
      {product.badge && (
        <span style={{
          position: 'absolute', left: 10, top: 10, zIndex: 2,
          padding: '3px 8px', borderRadius: 3, fontSize: 11, fontWeight: 700,
          color: 'white', letterSpacing: 0.3,
          background: product.badge.includes('OFF') ? 'var(--success)' : product.badge === 'BESTSELLER' ? '#ff6161' : 'var(--primary)'
        }}>
          {product.badge}
        </span>
      )}

      {/* Wishlist Button */}
      <button
        onClick={(e) => { e.stopPropagation(); }}
        style={{
          position: 'absolute', right: 10, top: 10, zIndex: 2,
          width: 32, height: 32, borderRadius: '50%', border: 'none',
          background: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'transform 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        <Heart size={16} color="#878787" />
      </button>

      {/* Product Image */}
      <div style={{
        aspectRatio: '1', overflow: 'hidden', background: '#f8f8f8',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
      }}>
        <img
          src={product.image}
          alt={product.name}
          referrerPolicy="no-referrer"
          style={{
            maxWidth: '85%', maxHeight: '85%', objectFit: 'contain',
            transition: 'transform 0.4s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        />
      </div>

      {/* Product Info */}
      <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {/* Brand */}
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.3 }}>
          {product.brand}
        </span>

        {/* Product Name */}
        <h3 style={{
          fontSize: 14, fontWeight: 500, color: 'var(--text-primary)',
          lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: 40
        }}>
          {product.name}
        </h3>

        {/* Rating */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="star-badge">
            {product.rating} <Star size={10} fill="white" />
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>
            ({product.ratingCount.toLocaleString()})
          </span>
        </div>

        {/* Pricing */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
          <span className="price-current">${product.price}</span>
          {product.originalPrice && (
            <>
              <span className="price-original">${product.originalPrice}</span>
              <span className="price-discount">{discount}% off</span>
            </>
          )}
        </div>

        {/* Seller */}
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
          Sold by: <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{product.sellerName}</span>
        </div>

        {/* Quick Add */}
        <button
          onClick={(e) => { e.stopPropagation(); onQuickAdd(product); }}
          className="btn btn-primary"
          style={{
            marginTop: 'auto', width: '100%', padding: '10px 16px',
            fontSize: 13, borderRadius: 6, gap: 6
          }}
        >
          <ShoppingCart size={15} />
          Add to Cart
        </button>
      </div>
    </div>
  );
}
