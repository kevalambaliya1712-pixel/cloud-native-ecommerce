/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShoppingBag, ArrowRight, Trash2, Cpu, Tag, Server, Check, ArrowLeft } from 'lucide-react';
import { CartItem } from '../types';

interface CartViewProps {
  cart: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onContinueShopping: () => void;
  onProceedToCheckout: (discountPct: number) => void;
}

export function CartView({
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onContinueShopping,
  onProceedToCheckout
}: CartViewProps) {
  const [promoCode, setPromoCode] = React.useState('');
  const [discountPct, setDiscountPct] = React.useState(0);
  const [promoFeedback, setPromoFeedback] = React.useState('');

  const subtotal = React.useMemo(() => {
    return cart.reduce((sum, item) => {
      const price = item.customConfig ? item.customConfig.monthlyRate : item.product.price;
      return sum + (price * item.quantity);
    }, 0);
  }, [cart]);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = promoCode.trim().toUpperCase();
    if (clean === 'AZURE50') {
      setDiscountPct(50);
      setPromoFeedback('Promo valid: 50% Developer Discount Applied!');
    } else if (clean === 'CLOUDCOMMERCE' || clean === 'CLOUD20') {
      setDiscountPct(20);
      setPromoFeedback('Promo valid: 20% Retail Discount Applied!');
    } else {
      setPromoFeedback('Error: This code is invalid or has expired.');
      setDiscountPct(0);
    }
  };

  const discountAmount = (subtotal * discountPct) / 100;
  const shippingCharge = subtotal > 150 || subtotal === 0 ? 0 : 15;
  const estimatedTax = (subtotal - discountAmount) * 0.0825; // 8.25% standard cloud server tax
  const grandTotal = subtotal - discountAmount + shippingCharge + estimatedTax;

  if (cart.length === 0) {
    return (
      <div id="cart-empty-state" className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-slate-50 text-slate-400 border border-slate-100">
          <ShoppingBag className="h-8 w-8" />
        </div>
        <h2 className="mt-6 text-xl font-extrabold text-slate-950">Draft empty</h2>
        <p className="mt-2 text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
          You haven't customized any Azure architectures or developer gadgets yet! Load up the specifications panel of any resource to get started.
        </p>
        <button
          id="cart-empty-back-cta"
          onClick={onContinueShopping}
          className="mt-8 inline-flex items-center space-x-2 rounded-full bg-blue-600 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-500 hover:shadow-blue-100 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Launch Spec Sheets Catalog</span>
        </button>
      </div>
    );
  }

  return (
    <div id="cart-view" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      
      <h2 id="cart-title" className="font-sans text-2xl font-black text-slate-950">Active Cart Configurations</h2>
      <p id="cart-subtitle" className="text-xs text-slate-400 font-semibold">{cart.length} configuration packages loaded.</p>

      {/* TWO COLUMN GRID FOR CART ITEMS & ESTIMATES */}
      <div id="cart-grid" className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-12">
        
        {/* LEFT COMPACT LIST (8 columns) */}
        <div id="cart-items-panel" className="lg:col-span-8 space-y-4">
          {cart.map((item) => {
            const isAzure = item.product.isAzureResource;
            const price = item.customConfig ? item.customConfig.monthlyRate : item.product.price;

            return (
              <div 
                key={item.id}
                id={`cart-item-${item.id}`}
                className="flex flex-col sm:flex-row items-center sm:justify-between rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md hover:shadow-slate-50 transition"
              >
                {/* Product spec block */}
                <div id={`item-spec-${item.id}`} className="flex flex-1 items-center space-x-4">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-50 border border-slate-100">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                  <div>
                    <h4 className="font-sans text-xs sm:text-sm font-bold text-slate-900 line-clamp-1">{item.product.name}</h4>
                    
                    {isAzure && item.customConfig ? (
                      /* AZURE DYNAMIC LABELS */
                      <div className="mt-1 flex flex-wrap gap-1.5 font-mono text-[9px] text-blue-700">
                        <span className="rounded bg-blue-50 px-2 py-0.5 font-bold flex items-center space-x-0.5"><Cpu className="h-2.5 w-2.5" /><span>{item.customConfig.vCPUs} vCPUs</span></span>
                        <span className="rounded bg-blue-50 px-2 py-0.5 font-bold">{item.customConfig.ramGB}GB RAM</span>
                        <span className="rounded bg-blue-50 px-2 py-0.5 font-bold">{item.customConfig.storageGB}GB SSD</span>
                        <span className="rounded bg-blue-50 px-2 py-0.5 font-bold uppercase">{item.customConfig.region}</span>
                        <span className="rounded bg-indigo-50 text-indigo-700 px-2 py-0.5 font-bold">{item.customConfig.tier} SLA</span>
                      </div>
                    ) : (
                      /* PHYSICAL GEAR SWATCH LABELS */
                      <p className="mt-1 text-[10px] font-bold text-slate-400">Swatch: <span className="text-slate-600">{item.selectedColor}</span></p>
                    )}

                    <span className="mt-2 block font-mono text-xs font-semibold text-slate-500">
                      ${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} each
                    </span>
                  </div>
                </div>

                {/* Adjusters and Actions */}
                <div id={`item-actions-${item.id}`} className="mt-4 sm:mt-0 flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                  
                  {/* QUANTITY TUNER */}
                  <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-1">
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      className="flex h-7 w-7 items-center justify-center rounded text-slate-400 hover:bg-white hover:text-slate-800 transition"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-mono text-xs font-bold text-slate-800">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className="flex h-7 w-7 items-center justify-center rounded text-slate-400 hover:bg-white hover:text-slate-800 transition"
                    >
                      +
                    </button>
                  </div>

                  {/* PRICE SUM TOTAL MULTIPLIER */}
                  <div className="text-right">
                    <span className="block font-mono text-sm font-black text-slate-950">
                      ${(price * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  {/* RESTORE TRASH REMOVAL */}
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="rounded-lg p-2 text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition"
                    title="Remove from Cart"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>

                </div>
              </div>
            );
          })}

          <div id="continue-shopping" className="flex justify-between pt-4">
            <button
              onClick={onContinueShopping}
              className="group flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 hover:text-blue-500 transition"
            >
              <ArrowLeft className="h-4 w-4 transform transition-transform group-hover:-translate-x-0.5" />
              <span>Back to Registry</span>
            </button>
          </div>
        </div>

        {/* RIGHT ESTIMATES BILLING COLUMN (4 columns) */}
        <aside id="cart-summary-sidebar" className="lg:col-span-4 select-none">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h3 className="font-sans text-sm font-bold text-slate-900 border-b border-slate-50 pb-3 uppercase tracking-wider">Configuration Estimates</h3>

            <div className="mt-5 space-y-3.5 text-xs font-medium text-slate-500">
              <div className="flex justify-between">
                <span>Baseline Subtotal</span>
                <span className="font-mono text-slate-900 font-bold">${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>

              {discountPct > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span className="flex items-center space-x-1"><Tag className="h-3.5 w-3.5" /><span>Promo Discount ({discountPct}%)</span></span>
                  <span className="font-mono">-${discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Telemetry Transport</span>
                <span className="font-mono text-slate-900 font-semibold">
                  {shippingCharge === 0 ? 'FREE' : `$${shippingCharge.toFixed(2)}`}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Estimated Azure Taxes (8.25%)</span>
                <span className="font-mono text-slate-900 font-semibold">${estimatedTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>

              <div className="border-t border-slate-100 pt-3.5 flex justify-between text-sm font-bold font-sans text-slate-950">
                <span>Total Budget Charge</span>
                <span className="font-mono font-black text-blue-600">${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* PROMO INPUT PANEL */}
            <form id="promo-form" onSubmit={handleApplyPromo} className="mt-6 border-t border-slate-100 pt-5">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Developer Promo Offer</label>
              <div className="mt-2.5 flex">
                <input
                  type="text"
                  placeholder="AZURE50 or CLOUD20"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="w-full rounded-l-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold uppercase text-slate-700 outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="rounded-r-lg bg-slate-900 px-4 text-xs font-bold text-white hover:bg-slate-800 transition"
                >
                  Apply
                </button>
              </div>
              {promoFeedback && (
                <div className={`mt-2 flex items-center space-x-1 text-[10px] font-bold ${promoFeedback.includes('Applied') ? 'text-emerald-600' : 'text-rose-500'}`}>
                  <Check className="h-3.5 w-3.5 shrink-0" />
                  <span>{promoFeedback}</span>
                </div>
              )}
            </form>

            {/* GRAND SUBMIT CHECKOUT CTAS */}
            <button
              id="proceed-checkout-btn"
              onClick={() => onProceedToCheckout(discountPct)}
              className="mt-6 flex w-full items-center justify-center space-x-2 rounded-lg bg-blue-600 py-3 text-xs font-bold text-white shadow-xl shadow-blue-100 hover:bg-blue-500 transition"
            >
              <span>Compile Deployment &amp; Checkout</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>

            <span id="guarantees-sub" className="mt-3 block text-center text-[10px] text-slate-400 font-semibold leading-normal">
              Prices estimated. Tax and compute SLA calculations generated active in Virginia Data Centers.
            </span>
          </div>
        </aside>

      </div>

    </div>
  );
}
