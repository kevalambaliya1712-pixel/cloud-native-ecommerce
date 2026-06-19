/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CheckCircle, ShoppingBag, ArrowRight, Truck, Clock, ShieldCheck, MapPin } from 'lucide-react';
import { Order } from '../types';

interface OrderConfirmationViewProps {
  order: Order | null;
  onContinueShopping: () => void;
}

export function OrderConfirmationView({ order, onContinueShopping }: OrderConfirmationViewProps) {
  // Fallback defaults if order is null for previewing
  const displayOrder: Order = order || {
    id: 'CK-739281-MP',
    items: [],
    subtotal: 74,
    shipping: 0,
    tax: 6.11,
    discount: 0,
    total: 80.11,
    status: 'confirmed',
    date: new Date().toLocaleDateString(),
    email: 'customer@example.com',
    shippingName: 'John Doe',
    shippingAddress: '123 Main St, VA',
    shippingCity: 'Richmond',
    shippingZip: '23173',
    paymentMethod: 'Credit Card ending in 9010'
  };

  // Determine active steps for tracking bar
  const getStepStatus = (step: 'pending' | 'confirmed' | 'shipped' | 'delivered') => {
    const statuses = ['pending', 'confirmed', 'shipped', 'delivered'];
    const currentIdx = statuses.indexOf(displayOrder.status);
    const stepIdx = statuses.indexOf(step);

    if (displayOrder.status === 'cancelled') {
      return 'cancelled';
    }

    if (currentIdx >= stepIdx) {
      return 'completed';
    } else if (currentIdx === stepIdx - 1) {
      return 'active';
    }
    return 'upcoming';
  };

  const steps = [
    { key: 'pending', label: 'Order Placed', desc: 'Awaiting seller verification' },
    { key: 'confirmed', label: 'Confirmed', desc: 'Seller verified, preparing item' },
    { key: 'shipped', label: 'Shipped', desc: 'Item is in transit' },
    { key: 'delivered', label: 'Delivered', desc: 'Parcel arrived at destination' }
  ];

  return (
    <div id="order-confirmed-view" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      
      {/* 1. SUCCESS HERO BLOCK */}
      <div id="confirmed-hero" className="flex flex-col items-center text-center mb-10">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-inner">
          <CheckCircle className="h-10 w-10" />
        </div>
        <span className="mt-4 font-mono text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded">
          {displayOrder.status === 'cancelled' ? 'Order Cancelled' : 'Order Placed Successfully'}
        </span>
        <h2 id="confirmed-title" className="mt-4 font-sans text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
          {displayOrder.status === 'cancelled' ? 'Your order was cancelled' : 'Thank You for Your Purchase!'}
        </h2>
        <p id="confirmed-subtitle" className="mt-2.5 max-w-xl text-xs text-slate-500 leading-relaxed font-semibold">
          Your order ID is <span className="text-slate-900 font-bold font-mono">{displayOrder.id}</span>. We have sent a confirmation email to <span className="text-slate-900 font-bold">{displayOrder.email}</span>.
        </p>
      </div>

      {/* 2. ORDER PROGRESS TIMELINE */}
      {displayOrder.status !== 'cancelled' && (
        <div className="mx-auto max-w-4xl bg-white border border-slate-100 rounded-2xl p-6 shadow-sm mb-10">
          <h3 className="text-sm font-bold text-slate-900 mb-6 font-sans uppercase tracking-wider flex items-center space-x-1.5">
            <Clock className="h-4.5 w-4.5 text-blue-600" />
            <span>Delivery Tracking Timeline</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {steps.map((st, idx) => {
              const status = getStepStatus(st.key as any);
              return (
                <div key={st.key} className="flex flex-row md:flex-col items-center text-left md:text-center relative">
                  
                  {/* Circle Pin */}
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs z-10 ${
                    status === 'completed' 
                      ? 'bg-blue-600 text-white' 
                      : status === 'active'
                      ? 'bg-blue-150 text-blue-700 border-2 border-blue-600 animate-pulse'
                      : 'bg-slate-100 text-slate-400'
                  }`}>
                    {idx + 1}
                  </div>

                  <div className="ml-4 md:ml-0 md:mt-3">
                    <h4 className={`text-xs font-bold ${
                      status === 'completed' || status === 'active' ? 'text-slate-900' : 'text-slate-400'
                    }`}>
                      {st.label}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5 max-w-[150px] mx-auto leading-normal">
                      {st.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. ORDER SUMMARY & DETAILS */}
      <div id="confirmed-grid" className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        
        {/* LEFT COLUMN: ITEM DETAILS (8 columns) */}
        <div id="blueprints-enclosure" className="lg:col-span-8">
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-4">
              <span className="font-sans text-xs font-black uppercase tracking-wider text-slate-800">Purchased Items</span>
            </div>

            <div className="divide-y divide-slate-100">
              {displayOrder.items.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 font-medium">
                  No items listed in receipt.
                </div>
              ) : (
                displayOrder.items.map((item) => (
                  <div key={item.id} className="p-4 flex items-center justify-between text-xs font-medium">
                    <div className="flex items-center space-x-3.5">
                      <img
                        src={item.productImage || item.product?.image}
                        alt={item.productName || item.product?.name}
                        className="h-14 w-14 rounded-lg object-cover bg-slate-50 border border-slate-100"
                      />
                      <div>
                        <h4 className="font-bold text-slate-900 line-clamp-1">{item.productName || item.product?.name}</h4>
                        <span className="block text-[10px] text-slate-400 font-semibold mt-0.5">
                          Qty: {item.quantity} | Brand: {item.brand || item.product?.brand || 'CloudKart'}
                        </span>
                        <span className="block text-[10px] text-blue-600 font-semibold mt-0.5">
                          Sold by: {item.sellerName || item.product?.sellerName || 'CloudKart'}
                        </span>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-slate-800">
                      ${((item.productPrice || item.product?.price || 0) * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="bg-slate-50/50 px-5 py-4 text-[10px] text-slate-500 font-mono flex items-center justify-between border-t border-slate-100">
              <span>Fulfillment Date: {displayOrder.date}</span>
              <span className="flex items-center space-x-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-emerald-600 font-bold font-sans">Payment Verified</span>
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: RECEIPT (4 columns) */}
        <aside id="receipt-sidebar" className="lg:col-span-4 select-none">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="font-sans text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 uppercase tracking-wider">Acquisition Invoice</h3>

            <div className="mt-5 space-y-4">
              <div className="text-xs">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Settlement Mode</span>
                <span className="mt-1 block font-semibold text-slate-850">{displayOrder.paymentMethod}</span>
              </div>

              <div className="text-xs">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Invoice Reference ID</span>
                <span className="mt-1 block font-mono text-slate-800 bg-slate-50 p-2.5 rounded break-all font-semibold select-all border border-slate-100">
                  {displayOrder.id}
                </span>
              </div>

              <div className="text-xs">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Delivery Coordinates</span>
                <span className="mt-1 block leading-normal text-slate-700 font-semibold">
                  {displayOrder.shippingName}<br />
                  {displayOrder.shippingAddress}<br />
                  {displayOrder.shippingCity}, {displayOrder.shippingZip}
                </span>
              </div>
            </div>

            <div className="mt-6 border-t border-slate-150 pt-5 space-y-3 text-xs text-slate-500 font-medium">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-mono text-slate-900 font-bold">${displayOrder.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              {displayOrder.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Promo Coupon Discount</span>
                  <span className="font-mono">-${displayOrder.discount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Logistics / Shipping</span>
                <span className="font-mono text-slate-900 font-semibold">{displayOrder.shipping === 0 ? 'FREE' : `$${displayOrder.shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes &amp; Local Levies</span>
                <span className="font-mono text-slate-900 font-semibold">${displayOrder.tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="border-t border-slate-100 pt-3.5 flex justify-between text-sm font-bold font-sans text-slate-950">
                <span>Grand Total Settled</span>
                <span className="font-mono font-black text-blue-600">${displayOrder.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <button
              id="redeployment-shopping-cta"
              onClick={onContinueShopping}
              className="mt-6 flex w-full items-center justify-center space-x-1.5 rounded-lg bg-blue-600 py-3 text-xs font-bold text-white shadow hover:bg-blue-500 transition font-sans uppercase tracking-wider"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Continue Shopping</span>
            </button>

          </div>
        </aside>

      </div>

    </div>
  );
}
