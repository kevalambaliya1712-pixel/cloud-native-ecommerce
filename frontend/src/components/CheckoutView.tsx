/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CreditCard, ShieldCheck, Mail, MapPin, ArrowRight, ArrowLeft, User, Phone } from 'lucide-react';
import { CartItem } from '../types';

interface CheckoutViewProps {
  cart: CartItem[];
  discountPct: number;
  onBackToCart: () => void;
  onPlaceOrder: (metadata: {
    email: string;
    shippingName: string;
    shippingAddress: string;
    shippingCity: string;
    shippingZip: string;
    paymentMethod: string;
  }) => void;
}

export function CheckoutView({
  cart,
  discountPct,
  onBackToCart,
  onPlaceOrder
}: CheckoutViewProps) {
  // Discrete steps: 1 = Identity & Contact, 2 = Shipping Address, 3 = Payment Method
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form states with initial defaults
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');

  const [ccNumber, setCcNumber] = useState('');
  const [ccExpiry, setCcExpiry] = useState('');
  const [ccCvv, setCcCvv] = useState('');

  // Input validation warnings
  const [formErr, setFormErr] = useState('');

  const subtotal = React.useMemo(() => {
    return cart.reduce((sum, item) => {
      return sum + (item.product.price * item.quantity);
    }, 0);
  }, [cart]);

  const discountAmount = (subtotal * discountPct) / 100;
  const shippingCharge = subtotal > 150 || subtotal === 0 ? 0 : 15;
  const estimatedTax = (subtotal - discountAmount) * 0.0825;
  const grandTotal = subtotal - discountAmount + shippingCharge + estimatedTax;

  // Handle Forward progression validation
  const handleNext = () => {
    setFormErr('');
    if (step === 1) {
      if (!email.trim() || !email.includes('@')) {
        setFormErr('Error: Please specify a valid email address.');
        return;
      }
      if (!fullName.trim()) {
        setFormErr('Error: Recipient full name is required.');
        return;
      }
      if (!phone.trim() || phone.length < 8) {
        setFormErr('Error: Please enter a valid contact phone number.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!address.trim() || !city.trim() || !state.trim() || !zip.trim()) {
        setFormErr('Error: All address and location routing fields are required.');
        return;
      }
      setStep(3);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErr('');
    if (!ccNumber.trim() || ccNumber.replace(/\s/g, '').length < 16) {
      setFormErr('Error: Please enter a valid 16-digit card number.');
      return;
    }
    if (!ccExpiry.trim() || !ccExpiry.includes('/')) {
      setFormErr('Error: Card expiry date is required (MM/YY).');
      return;
    }
    if (!ccCvv.trim() || ccCvv.length < 3) {
      setFormErr('Error: Card CVV security code is required.');
      return;
    }
    
    // Success: fire billing trigger
    onPlaceOrder({
      email,
      shippingName: fullName,
      shippingAddress: `${address}, ${state}`,
      shippingCity: city,
      shippingZip: zip,
      paymentMethod: 'Credit Card ending in ' + ccNumber.trim().slice(-4)
    });
  };

  return (
    <div id="checkout-view" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div id="checkout-container" className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        
        {/* LEFT COLUMN: MULTI-STEP PROGRESSIVE FORM (8 columns) */}
        <div id="checkout-flow-panel" className="lg:col-span-8">
          
          {/* STEP HEADER TRACK */}
          <div id="step-indicators" className="flex items-center space-x-4 border-b border-slate-100 pb-5">
            <div className="flex items-center space-x-2">
              <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
              }`}>1</span>
              <span className={`text-xs font-bold ${step === 1 ? 'text-slate-900' : 'text-slate-400'}`}>Contact Info</span>
            </div>
            <span className="text-slate-200">/</span>
            <div className="flex items-center space-x-2">
              <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
              }`}>2</span>
              <span className={`text-xs font-bold ${step === 2 ? 'text-slate-900' : 'text-slate-400'}`}>Delivery Address</span>
            </div>
            <span className="text-slate-200">/</span>
            <div className="flex items-center space-x-2">
              <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                step >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
              }`}>3</span>
              <span className={`text-xs font-bold ${step === 3 ? 'text-slate-900' : 'text-slate-400'}`}>Payment Gateway</span>
            </div>
          </div>

          {/* DYNAMIC FORM VIEWS */}
          <div id="checkout-form-box" className="mt-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            
            {formErr && (
              <div id="form-error-banner" className="mb-6 flex items-center space-x-2.5 rounded-lg bg-rose-50 p-4 text-xs font-bold text-rose-700 border border-rose-100">
                <ShieldCheck className="h-4.5 w-4.5 shrink-0 rotate-180" />
                <span>{formErr}</span>
              </div>
            )}

            {/* STEP 1: CONTACT & Recipient Name */}
            {step === 1 && (
              <div id="step-1-fields" className="space-y-4">
                <h3 className="font-sans text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <span>Contact Details &amp; Buyer Identity</span>
                </h3>

                <div>
                  <label className="block text-xs font-bold text-slate-700">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="buyer@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-2 block w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
                  />
                  <span className="mt-1 block text-[10px] text-slate-400 font-semibold">Your invoices and delivery receipts will be sent to this email address.</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700">Recipient Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="mt-2 block w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700">Contact Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +1 555 123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-2 block w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    onClick={onBackToCart}
                    className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-700"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Return to Cart</span>
                  </button>
                  <button
                    onClick={handleNext}
                    className="flex items-center space-x-1.5 rounded-lg bg-slate-950 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition"
                  >
                    <span>Next: Shipping Location</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: SHIPPING ADDRESS */}
            {step === 2 && (
              <div id="step-2-fields" className="space-y-4">
                <h3 className="font-sans text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  <span>Delivery Address Details</span>
                </h3>

                <div>
                  <label className="block text-xs font-bold text-slate-700">Street Address</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 123 Main St, Apt 4B"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="mt-2 block w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-medium text-slate-800 outline-none transition focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700">City</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Richmond"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="mt-2 block h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-medium focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700">State / Region</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. VA"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="mt-2 block h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-medium focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700">ZIP / Postal Code</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 23173"
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      className="mt-2 block h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-medium focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    onClick={() => setStep(1)}
                    className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-700"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Back</span>
                  </button>
                  <button
                    onClick={handleNext}
                    className="flex items-center space-x-1.5 rounded-lg bg-slate-950 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition"
                  >
                    <span>Next: Payment Details</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: PAYMENT LEDGER */}
            {step === 3 && (
              <form id="step-3-form" onSubmit={handleSubmit} className="space-y-4">
                <h3 className="font-sans text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                  <CreditCard className="h-4 w-4 text-blue-600" />
                  <span>Secure Card Payment Details</span>
                </h3>

                <div>
                  <label className="block text-xs font-bold text-slate-700">Credit / Debit Card Number</label>
                  <input
                    type="text"
                    required
                    placeholder="4000 1234 5678 9010"
                    value={ccNumber}
                    onChange={(e) => setCcNumber(e.target.value)}
                    className="mt-2 block w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-mono font-medium tracking-wide text-slate-800 focus:border-blue-500 focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700">Expiration Date</label>
                    <input
                      type="text"
                      required
                      placeholder="MM / YY"
                      value={ccExpiry}
                      onChange={(e) => setCcExpiry(e.target.value)}
                      className="mt-2 block h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700">CVV Security Code</label>
                    <input
                      type="password"
                      required
                      placeholder="***"
                      value={ccCvv}
                      onChange={(e) => setCcCvv(e.target.value)}
                      className="mt-2 block h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="rounded-lg bg-blue-50 p-4 text-[11px] text-blue-800 leading-relaxed font-medium">
                  We use state-of-the-art PCI-DSS compliant encryption to secure your transaction. Your payment information is processed securely and is never stored in plain text.
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-700"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Back</span>
                  </button>
                  <button
                    type="submit"
                    className="flex items-center space-x-1.5 rounded-lg bg-blue-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-blue-500 transition shadow-lg shadow-blue-100"
                  >
                    <ShieldCheck className="h-4.5 w-4.5" />
                    <span>Authorize Payment &amp; Place Order</span>
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>

        {/* RIGHT COLUMN: CONFIGURATION ESTIMATE SIDEBAR (4 columns) */}
        <aside id="checkout-sidebar-panel" className="lg:col-span-4 select-none">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h3 className="font-sans text-sm font-bold text-slate-900 border-b border-slate-50 pb-3 uppercase tracking-wider">Order Summary</h3>

            <div className="mt-5 max-h-60 overflow-y-auto space-y-4 pr-1">
              {cart.map((item) => {
                return (
                  <div key={item.id} className="flex space-x-3.5 text-xs">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      referrerPolicy="no-referrer"
                      className="h-11 w-11 rounded-lg object-cover bg-slate-50 border border-slate-100 shrink-0"
                    />
                    <div className="flex-1">
                      <h4 className="font-sans font-bold text-slate-900 line-clamp-1">{item.product.name}</h4>
                      <span className="block text-[10px] text-slate-400 font-semibold">Qty: {item.quantity}</span>
                    </div>
                    <span className="font-mono font-bold text-slate-800">${(item.product.price * item.quantity).toLocaleString()}</span>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 border-t border-slate-50 pt-5 space-y-3 text-xs text-slate-500 font-medium">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-mono text-slate-900 font-bold">${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              {discountPct > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Promo discount ({discountPct}%)</span>
                  <span className="font-mono">-${discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping Charges</span>
                <span className="font-mono text-slate-900 font-semibold">{shippingCharge === 0 ? 'FREE' : `$${shippingCharge.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Tax (8.25%)</span>
                <span className="font-mono text-slate-900 font-semibold">${estimatedTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="border-t border-slate-100 pt-3.5 flex justify-between text-sm font-bold font-sans text-slate-950">
                <span>Grand Total</span>
                <span className="font-mono font-black text-blue-600">${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>

          </div>
        </aside>

      </div>
    </div>
  );
}
