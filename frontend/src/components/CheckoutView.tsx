/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CreditCard, ShieldCheck, Mail, Building, MapPin, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
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
  // Discrete steps: 1 = Identity, 2 = Deployment region routing, 3 = Payment method
  const [step, setStep] = React.useState<1 | 2 | 3>(1);

  // Form states with initial defaults
  const [email, setEmail] = React.useState('');
  const [tenantId, setTenantId] = React.useState('');
  const [fullName, setFullName] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [city, setCity] = React.useState('');
  const [zip, setZip] = React.useState('');

  const [ccNumber, setCcNumber] = React.useState('');
  const [ccExpiry, setCcExpiry] = React.useState('');
  const [ccCvv, setCcCvv] = React.useState('');

  // Input validation warnings
  const [formErr, setFormErr] = React.useState('');

  const subtotal = React.useMemo(() => {
    return cart.reduce((sum, item) => {
      const price = item.customConfig ? item.customConfig.monthlyRate : item.product.price;
      return sum + (price * item.quantity);
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
        setFormErr('Error: Please specify a valid Developer Email reference.');
        return;
      }
      if (!tenantId.trim()) {
        setFormErr('Error: Azure Active Directory Tenant/Org ID is required.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!fullName.trim() || !address.trim() || !city.trim() || !zip.trim()) {
        setFormErr('Error: All subscription/transport address fields are required.');
        return;
      }
      setStep(3);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErr('');
    if (!ccNumber.trim() || !ccExpiry.trim() || !ccCvv.trim()) {
      setFormErr('Error: Payment and billing credentials must be populated.');
      return;
    }
    // Success: fire billing trigger
    onPlaceOrder({
      email,
      shippingName: fullName,
      shippingAddress: address,
      shippingCity: city,
      shippingZip: zip,
      paymentMethod: 'Cloud Billing Profile ending ' + ccNumber.trim().slice(-4)
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
              <span className={`text-xs font-bold ${step === 1 ? 'text-slate-900' : 'text-slate-400'}`}>Identity &amp; Tenant</span>
            </div>
            <span className="text-slate-200">/</span>
            <div className="flex items-center space-x-2">
              <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
              }`}>2</span>
              <span className={`text-xs font-bold ${step === 2 ? 'text-slate-900' : 'text-slate-400'}`}>Cloud Address</span>
            </div>
            <span className="text-slate-200">/</span>
            <div className="flex items-center space-x-2">
              <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                step >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
              }`}>3</span>
              <span className={`text-xs font-bold ${step === 3 ? 'text-slate-900' : 'text-slate-400'}`}>Billing Ledger</span>
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

            {/* STEP 1: IDENTITY */}
            {step === 1 && (
              <div id="step-1-fields" className="space-y-4">
                <h3 className="font-sans text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <span>Developer Identity &amp; Directory Tenant</span>
                </h3>

                <div>
                  <label className="block text-xs font-bold text-slate-700">Client Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="architect@enterprise.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-2 block w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
                  />
                  <span className="mt-1 block text-[10px] text-slate-400 font-semibold">Your dynamic ARM deployments and compiled certificates will be routed here.</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700">Azure Active Directory Domain/Tenant ID</label>
                  <input
                    type="text"
                    required
                    placeholder="e853ca8a-8c90-4c17-bfd2-7634f18db9e5"
                    value={tenantId}
                    onChange={(e) => setTenantId(e.target.value)}
                    className="mt-2 block w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-mono text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
                  />
                  <span className="mt-1 block text-[10px] text-slate-400 font-semibold">Unique subscription ID linking resources to corporate Azure profiles.</span>
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    onClick={onBackToCart}
                    className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-700"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Return to Configurator</span>
                  </button>
                  <button
                    onClick={handleNext}
                    className="flex items-center space-x-1.5 rounded-lg bg-slate-950 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition"
                  >
                    <span>Next: Deployment Region</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: CLOUD ADDRESS */}
            {step === 2 && (
              <div id="step-2-fields" className="space-y-4">
                <h3 className="font-sans text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  <span>Deployment Location &amp; Subscription address</span>
                </h3>

                <div>
                  <label className="block text-xs font-bold text-slate-700">Subscription Full Name / Org Primary Officer</label>
                  <input
                    type="text"
                    required
                    placeholder="Stellar Cloud Ops Division"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="mt-2 block w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-medium text-slate-800 outline-none transition focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700">Street Coordinates (Physical Hub or HQ)</label>
                  <input
                    type="text"
                    required
                    placeholder="1208 Azure Way, Suite 400"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="mt-2 block w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-medium text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700">City Datacenter</label>
                    <input
                      type="text"
                      required
                      placeholder="Richmond"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="mt-2 block h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-medium focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700">ZIP / Region Routing Code</label>
                    <input
                      type="text"
                      required
                      placeholder="23173"
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
                    <span>Next: Billing ledger</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: BILLING LEDGER */}
            {step === 3 && (
              <form id="step-3-form" onSubmit={handleSubmit} className="space-y-4">
                <h3 className="font-sans text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                  <CreditCard className="h-4 w-4 text-blue-600" />
                  <span>Active Azure Cloud Billing Profile</span>
                </h3>

                <div>
                  <label className="block text-xs font-bold text-slate-700">Cloud Billing Account / Visa Number</label>
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
                    <label className="block text-xs font-bold text-slate-700">Expiration date expiry</label>
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
                    <label className="block text-xs font-bold text-slate-700">Billing Verification Code CVV</label>
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
                  We use state-of-the-art PCI compliant ledger mechanisms verified directly by Microsoft Azure Key Vault. Your details are safe.
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
                    <span>Compile Blueprint &amp; Place Order</span>
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>

        {/* RIGHT COLUMN: CONFIGURATION ESTIMATE SIDEBAR (4 columns) */}
        <aside id="checkout-sidebar-panel" className="lg:col-span-4 select-none">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h3 className="font-sans text-sm font-bold text-slate-900 border-b border-slate-50 pb-3 uppercase tracking-wider">Loaded Configurations</h3>

            <div className="mt-5 max-h-60 overflow-y-auto space-y-4 pr-1">
              {cart.map((item) => {
                const isAzure = item.product.isAzureResource;
                const price = item.customConfig ? item.customConfig.monthlyRate : item.product.price;
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
                    <span className="font-mono font-bold text-slate-800">${(price * item.quantity).toLocaleString()}</span>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 border-t border-slate-50 pt-5 space-y-3 text-xs text-slate-500 font-medium">
              <div className="flex justify-between">
                <span>Total baseline Subtotal</span>
                <span className="font-mono text-slate-900 font-bold">${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              {discountPct > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Promo discount ({discountPct}%)</span>
                  <span className="font-mono">-${discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Transport &amp; Data Transfers</span>
                <span className="font-mono text-slate-900 font-semibold">{shippingCharge === 0 ? 'FREE' : `$${shippingCharge.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Azure Taxes</span>
                <span className="font-mono text-slate-900 font-semibold">${estimatedTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="border-t border-slate-100 pt-3.5 flex justify-between text-sm font-bold font-sans text-slate-950">
                <span>Total Budget Charge</span>
                <span className="font-mono font-black text-blue-600">${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>

          </div>
        </aside>

      </div>

    </div>
  );
}
