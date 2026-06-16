/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Star, Eye, ShoppingCart, Settings, ArrowRight } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  key?: string;
  product: Product;
  onViewDetails: (product: Product) => void;
  onQuickAdd: (product: Product) => void;
}

export function ProductCard({ product, onViewDetails, onQuickAdd }: ProductCardProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div
      id={`product-card-${product.id}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md hover:shadow-slate-100"
    >
      {/* BADGE ON TOP-LEFT */}
      {product.badge && (
        <span
          id={`badge-${product.id}`}
          className={`absolute left-3 top-3 z-10 rounded px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-white shadow-sm ${
            product.badge.includes('OFF') 
              ? 'bg-rose-500' 
              : product.badge.includes('SCALABLE') || product.badge.includes('AI')
              ? 'bg-emerald-600'
              : 'bg-blue-600'
          }`}
        >
          {product.badge}
        </span>
      )}

      {/* REACTION SYSTEM (isAzureResource indicators) */}
      <span
        id={`resource-tag-${product.id}`}
        className="absolute right-3 top-3 z-10 flex items-center space-x-1 rounded-full bg-slate-900/75 px-2.5 py-1 text-[9px] font-semibold text-slate-100 backdrop-blur"
      >
        <span className={`h-1.5 w-1.5 rounded-full ${product.isAzureResource ? 'bg-sky-400' : 'bg-amber-400'}`} />
        <span>{product.isAzureResource ? 'Azure' : 'Gear'}</span>
      </span>

      {/* IMAGE COMPONENT CONTAINER WITH HOVER OVERLAY */}
      <div 
        id={`img-container-${product.id}`} 
        className="relative aspect-square w-full cursor-pointer overflow-hidden bg-slate-50"
        onClick={() => onViewDetails(product)}
      >
        <img
          id={`img-element-${product.id}`}
          src={product.image}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {/* GLASSMORPHIC SLIDE-UP OVERLAY FOR ACTIONS */}
        <div
          id={`overlay-${product.id}`}
          className={`absolute inset-x-0 bottom-0 flex justify-center gap-3 bg-gradient-to-t from-slate-900/60 to-transparent py-4 transition-all duration-300 ${
            isHovered ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'
          }`}
        >
          <button
            id={`view-btn-${product.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(product);
            }}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-800 shadow-lg hover:bg-slate-100 hover:text-blue-600 transition"
            title="View Specifications"
          >
            <Eye className="h-4.5 w-4.5" />
          </button>
          
          <button
            id={`action-btn-${product.id}`}
            onClick={(e) => {
              e.stopPropagation();
              if (product.isAzureResource) {
                onViewDetails(product); // VM configuration happens in DetailView
              } else {
                onQuickAdd(product);
              }
            }}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition"
            title={product.isAzureResource ? 'Configure Stack' : 'Quick Add to Cart'}
          >
            {product.isAzureResource ? <Settings className="h-4.5 w-4.5" /> : <ShoppingCart className="h-4.5 w-4.5" />}
          </button>
        </div>
      </div>

      {/* PRODUCT TRANSCRIPTION / INFORMATIONAL BODY */}
      <div id={`info-wrapper-${product.id}`} className="flex flex-1 flex-col p-4">
        
        {/* CATEGORY & STAR RATINGS */}
        <div id={`scroller-row-${product.id}`} className="flex items-center justify-between">
          <span id={`cat-label-${product.id}`} className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {product.category}
          </span>
          <div id={`star-rating-${product.id}`} className="flex items-center space-x-1">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span id={`rating-val-${product.id}`} className="text-xs font-semibold text-slate-700">{product.rating}</span>
            <span id={`rating-cnt-${product.id}`} className="text-[10px] text-slate-400">({product.ratingCount})</span>
          </div>
        </div>

        {/* PRODUCT NAME */}
        <h3 
          id={`title-heading-${product.id}`}
          onClick={() => onViewDetails(product)}
          className="mt-2 cursor-pointer font-sans text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition duration-150 line-clamp-1"
        >
          {product.name}
        </h3>

        {/* PRICING BLOCK */}
        <div id={`pricing-wrapper-${product.id}`} className="mt-2.5 flex items-baseline space-x-2">
          <span id={`active-price-${product.id}`} className="text-sm font-bold text-slate-950">
            ${product.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            {product.isAzureResource && <span className="text-[10px] font-normal text-slate-500 font-sans"> /mo baseline</span>}
          </span>
          {product.originalPrice && (
            <span id={`original-price-${product.id}`} className="text-xs text-slate-400 line-through">
              ${product.originalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          )}
        </div>

        {/* HOVER CTAS FOR GENERAL ACCESS */}
        <div id={`card-cta-panel-${product.id}`} className="mt-4 border-t border-slate-50 pt-3">
          <button
            id={`checkout-trigger-${product.id}`}
            onClick={() => onViewDetails(product)}
            className="flex w-full items-center justify-center space-x-1.5 rounded-lg border border-slate-100 bg-slate-50 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
          >
            <span>{product.isAzureResource ? 'Configure Blueprint' : 'Inspect Gear'}</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

      </div>
    </div>
  );
}
