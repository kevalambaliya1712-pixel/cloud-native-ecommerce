/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CheckCircle, Terminal, FileCode, Download, Copy, RefreshCw, ShoppingBag, ArrowRight } from 'lucide-react';
import { Order } from '../types';
import { generateArmTemplate, generateBicepCode, generateCliScript } from '../utils/azureTemplates';

interface OrderConfirmationViewProps {
  order: Order | null;
  onContinueShopping: () => void;
}

export function OrderConfirmationView({ order, onContinueShopping }: OrderConfirmationViewProps) {
  const [activeCodeTab, setActiveCodeTab] = React.useState<'arm' | 'bicep' | 'cli'>('arm');
  const [copiedId, setCopiedId] = React.useState(false);

  // Fallback defaults if order is null for previewing
  const displayOrder: Order = order || {
    id: 'AZ-739281-CC',
    items: [],
    subtotal: 74,
    shipping: 0,
    tax: 6.11,
    discount: 0,
    total: 80.11,
    date: new Date().toLocaleDateString(),
    email: 'cloud_dev@enterprise.com',
    shippingName: 'Stellar Cloud Ops',
    shippingAddress: '1208 Azure Way, Suite 400',
    shippingCity: 'Richmond',
    shippingZip: '23173',
    paymentMethod: 'Cloud Billing Profile Ending 9010'
  };

  // Compile scripts
  const armCode = generateArmTemplate(displayOrder.items);
  const bicepCode = generateBicepCode(displayOrder.items);
  const cliCode = generateCliScript(displayOrder.items);

  const activeCodeString = React.useMemo(() => {
    if (activeCodeTab === 'bicep') return bicepCode;
    if (activeCodeTab === 'cli') return cliCode;
    return armCode;
  }, [activeCodeTab, armCode, bicepCode, cliCode]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeCodeString);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleDownload = () => {
    const suffix = activeCodeTab === 'bicep' ? 'bicep' : activeCodeTab === 'cli' ? 'sh' : 'json';
    const blob = new Blob([activeCodeString], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `azure_deployment_${displayOrder.id}.${suffix}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div id="order-confirmed-view" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      
      {/* 1. SUCCESS BANNER BLOCK */}
      <div id="confirmed-hero" className="flex flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-inner">
          <CheckCircle className="h-10 w-10" />
        </div>
        <span className="mt-4 font-mono text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded">Activation Confirmed</span>
        <h2 id="confirmed-title" className="mt-4 font-sans text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">Azure Resources Prepared</h2>
        <p id="confirmed-subtitle" className="mt-2.5 max-w-xl text-xs text-slate-500 leading-relaxed font-semibold">
          Your payment profile has logged subscription limits for ID <span className="text-slate-900 font-bold font-mono">{displayOrder.id}</span>. Compilation profiles and resource descriptors have been loaded below.
        </p>
      </div>

      <div id="confirmed-grid" className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-12">
        
        {/* LEFT COLUMN: ACTIVE AZURE BLUEPRINTS CENTER (8 columns) */}
        <div id="blueprints-enclosure" className="lg:col-span-8">
          <div className="rounded-2xl border border-slate-900 bg-slate-950 text-slate-200 overflow-hidden shadow-2xl">
            
            {/* COMPILER CAP HEADER */}
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-5 py-4">
              <div className="flex items-center space-x-2">
                <Terminal className="h-5 w-5 text-sky-400" />
                <span className="font-sans text-xs font-black uppercase tracking-wider text-slate-100">Azure Automation Center</span>
              </div>
              <div className="flex space-x-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span className="flex h-2.5 w-2.5 rounded-full bg-sky-500" />
                <span className="flex h-2.5 w-2.5 rounded-full bg-amber-500" />
              </div>
            </div>

            {/* TAB SELECTORS ROAD */}
            <div className="flex border-b border-slate-850 bg-slate-900/40 text-xs font-mono">
              <button
                onClick={() => setActiveCodeTab('arm')}
                className={`flex items-center space-x-1.5 py-3.5 px-6 border-b-2 transition ${
                  activeCodeTab === 'arm' ? 'border-sky-500 bg-slate-900 text-sky-400' : 'border-transparent text-slate-400 hover:text-slate-250'
                }`}
              >
                <FileCode className="h-4 w-4" />
                <span>ARM Template.json</span>
              </button>
              <button
                onClick={() => setActiveCodeTab('bicep')}
                className={`flex items-center space-x-1.5 py-3.5 px-6 border-b-2 transition ${
                  activeCodeTab === 'bicep' ? 'border-sky-500 bg-slate-900 text-sky-400' : 'border-transparent text-slate-400 hover:text-slate-250'
                }`}
              >
                <FileCode className="h-4 w-4" />
                <span>main.bicep</span>
              </button>
              <button
                onClick={() => setActiveCodeTab('cli')}
                className={`flex items-center space-x-1.5 py-3.5 px-6 border-b-2 transition ${
                  activeCodeTab === 'cli' ? 'border-sky-500 bg-slate-900 text-sky-400' : 'border-transparent text-slate-400 hover:text-slate-250'
                }`}
              >
                <Terminal className="h-4 w-4" />
                <span>deploy.sh (CLI)</span>
              </button>
            </div>

            {/* CODE PRE MONITOR */}
            <div className="relative p-5">
              
              {/* CODE ACTIONS FLOATING */}
              <div className="absolute right-4 top-4 flex space-x-2 z-10 select-none">
                <button
                  onClick={handleCopyCode}
                  className="flex items-center space-x-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-[10px] font-bold text-slate-300 hover:text-white transition shadow border border-slate-700/40"
                  title="Copy Code"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>{copiedId ? 'Copied!' : 'Copy'}</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center space-x-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 px-3 py-1.5 text-[10px] font-bold text-white transition shadow shadow-sky-600/10"
                  title="Download File"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download</span>
                </button>
              </div>

              {/* LIVE COMPILER SCREEN */}
              <pre className="max-h-96 overflow-y-auto pr-2 text-xs leading-relaxed font-mono text-cyan-300">
                <code>
                  {activeCodeString}
                </code>
              </pre>

            </div>

            {/* BAR FOOTER CONTEXT */}
            <div className="border-t border-slate-850 bg-slate-900 px-5 py-3 text-[10px] font-mono text-slate-500 flex items-center justify-between">
              <span>Tenant Domain Registry: {displayOrder.email}</span>
              <span className="flex items-center space-x-1"><RefreshCw className="h-3 w-3 text-emerald-500 animate-spin" /><span className="text-emerald-500 font-bold">Compiled Successful</span></span>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: REVENUE / BILLING RECEIPT (4 columns) */}
        <aside id="receipt-sidebar" className="lg:col-span-4 select-none">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h3 className="font-sans text-sm font-bold text-slate-1000 border-b border-slate-50 pb-3 uppercase tracking-wider">Acquisition Ledger</h3>

            <div className="mt-5 space-y-4">
              <div className="text-xs">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Direct billing Profile</span>
                <span className="mt-1 block font-semibold text-slate-800">{displayOrder.paymentMethod}</span>
              </div>

              <div className="text-xs">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">AD Tenant Reference ID</span>
                <span className="mt-1 block font-mono text-slate-800 bg-slate-50 p-2 rounded block break-all font-semibold select-all border border-slate-100">
                  {displayOrder.id}
                </span>
              </div>

              <div className="text-xs">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Deployment Coordinates</span>
                <span className="mt-1 block leading-normal text-slate-700 font-semibold">
                  {displayOrder.shippingName}<br />
                  {displayOrder.shippingAddress}<br />
                  {displayOrder.shippingCity}, {displayOrder.shippingZip}
                </span>
              </div>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-5 space-y-3 text-xs text-slate-500 font-medium">
              <div className="flex justify-between">
                <span>Baseline Subtotal</span>
                <span className="font-mono text-slate-900 font-bold">${displayOrder.subtotal.toLocaleString(undefined,{minimumFractionDigits:2})}</span>
              </div>
              {displayOrder.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Authorized Discount</span>
                  <span className="font-mono">-${displayOrder.discount.toLocaleString(undefined,{minimumFractionDigits:2})}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Telemetry Bandwidth</span>
                <span className="font-mono text-slate-900 font-semibold">{displayOrder.shipping === 0 ? 'FREE' : `$${displayOrder.shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between">
                <span>Azure Ingress Tax</span>
                <span className="font-mono text-slate-900 font-semibold">${displayOrder.tax.toLocaleString(undefined,{minimumFractionDigits:2})}</span>
              </div>
              <div className="border-t border-slate-100 pt-3.5 flex justify-between text-sm font-bold font-sans text-slate-950">
                <span>Total Charge logged</span>
                <span className="font-mono font-black text-blue-600">${displayOrder.total.toLocaleString(undefined,{minimumFractionDigits:2})}</span>
              </div>
            </div>

            {/* REDEPLOY CTAS */}
            <button
              id="redeployment-shopping-cta"
              onClick={onContinueShopping}
              className="mt-6 flex w-full items-center justify-center space-x-1.5 rounded-lg bg-slate-950 py-3 text-xs font-bold text-white shadow hover:bg-slate-850 transition"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Redeploy / Configure Next Blueprint</span>
            </button>

          </div>
        </aside>

      </div>

    </div>
  );
}
