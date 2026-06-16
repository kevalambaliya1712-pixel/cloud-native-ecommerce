/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Star, ShieldAlert, ArrowLeft, Plus, Minus, Server, HardDrive, Cpu, Compass, ShoppingCart, CheckCircle2, MessageSquare } from 'lucide-react';
import { Product, CustomResourceConfig } from '../types';

interface ProductDetailViewProps {
  product: Product;
  onBackToShop: () => void;
  onAddToCart: (product: Product, quantity: number, color?: string, config?: CustomResourceConfig) => void;
}

export function ProductDetailView({ product, onBackToShop, onAddToCart }: ProductDetailViewProps) {
  // Image carousel thumbnail selection
  const [activeImage, setActiveImage] = React.useState(product.image);

  // Specifications Accordion state
  const [activeTab, setActiveTab] = React.useState<'specs' | 'reviews' | 'sla'>('specs');

  // Interactive Options swatches
  const colors = ['Premium Corporate Blue', 'Matte Obsidian Black', 'Alpine Glacier White'];
  const [selectedColor, setSelectedColor] = React.useState(colors[0]);

  // Quantity control
  const [quantity, setQuantity] = React.useState(1);

  // Success indicator
  const [addedSuccess, setAddedSuccess] = React.useState(false);

  // Azure Custom Configurations (Only for isAzureResource: true)
  const [vCPUs, setVcpus] = React.useState<number>(4);
  const [ramGB, setRamGb] = React.useState<number>(16);
  const [storageGB, setStorageGb] = React.useState<number>(128);
  const [region, setRegion] = React.useState<string>('eastus');
  const [tier, setTier] = React.useState<'Basic' | 'Standard' | 'Premium'>('Standard');

  // Keep main display synchronized when product shifts
  React.useEffect(() => {
    setActiveImage(product.image);
    setQuantity(1);
    setAddedSuccess(false);
  }, [product]);

  // Calculate dynamic Azure monthly baseline pricing if custom resource
  const dynamicPrice = React.useMemo(() => {
    if (!product.isAzureResource) return product.price;

    let total = 40; // baseline compute charge
    // vCPU scaling
    total += (vCPUs - 2) * 12;
    // RAM scaling
    total += (ramGB - 4) * 3;
    // Storage scaling
    total += (storageGB - 32) * 0.15;
    // Tier multipliers
    if (tier === 'Basic') total *= 0.8;
    if (tier === 'Premium') total *= 1.45;

    return Math.round(total);
  }, [product, vCPUs, ramGB, storageGB, tier]);

  const handleAddToCart = () => {
    let customConfig: CustomResourceConfig | undefined;
    
    if (product.isAzureResource) {
      customConfig = {
        vCPUs,
        ramGB,
        storageGB,
        region,
        tier,
        monthlyRate: dynamicPrice
      };
    }

    onAddToCart(product, quantity, product.isAzureResource ? undefined : selectedColor, customConfig);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2500);
  };

  // Mock Reviews statistics breakdown
  const starBreakdown = [
    { stars: 5, percentage: 82, count: 247 },
    { stars: 4, percentage: 12, count: 36 },
    { stars: 3, percentage: 4, count: 12 },
    { stars: 2, percentage: 1, count: 3 },
    { stars: 1, percentage: 1, count: 3 }
  ];

  return (
    <div id="product-detail-view" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      
      {/* 1. JUMP-BACK NAVIGATION TRACK */}
      <button
        id="detail-back-btn"
        onClick={onBackToShop}
        className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 transition"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Return to Blueprints Registry</span>
      </button>

      {/* 2. CORE SPECIFICATIONS & CONVENTIONAL LAYOUT */}
      <div id="detail-two-col-grid" className="mt-8 grid grid-cols-1 gap-12 lg:grid-cols-2">
        
        {/* LEFT COLUMN: INTERACTIVE MEDIA GRAPH & IMAGES */}
        <div id="detail-media-gallery" className="flex flex-col space-y-4">
          
          {/* MAIN ENLARGED VIEW */}
          <div id="main-active-media-box" className="aspect-square overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
            <img
              id="main-active-img"
              src={activeImage}
              alt={product.name}
              referrerPolicy="referrer"
              className="h-full w-full object-cover object-center transition-all duration-300"
            />
          </div>

          {/* DYNAMIC THUMBNAILS CAROUSEL */}
          {product.thumbnails && product.thumbnails.length > 0 && (
            <div id="detail-thumbnails-row" className="flex items-center gap-3 overflow-x-auto pb-2">
              {product.thumbnails.map((thumb, idx) => (
                <button
                  key={`${product.id}-thumb-${idx}`}
                  id={`thumb-btn-${idx}`}
                  onClick={() => setActiveImage(thumb)}
                  className={`relative aspect-square w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-slate-50 transition hover:opacity-90 ${
                    activeImage === thumb ? 'border-blue-600 ring-2 ring-blue-100' : 'border-slate-100'
                  }`}
                >
                  <img
                    id={`thumb-img-${idx}`}
                    src={thumb}
                    alt={`${product.name} thumb ${idx}`}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover object-center"
                  />
                </button>
              ))}
            </div>
          )}

          {/* RATING SCORECARD & GRAPH */}
          <div id="star-rating-scorecard" className="mt-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h4 className="font-sans text-sm font-bold text-slate-900">Buyer Rating Analysis</h4>
            <div className="mt-4 flex items-center space-x-6">
              <div id="scorecard-total" className="text-center">
                <span className="font-sans text-4xl font-extrabold text-slate-900">{product.rating}</span>
                <div className="mt-1 flex items-center justify-center space-x-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`h-3 w-3 ${
                        s <= Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="mt-1 block text-[10px] text-slate-500 font-semibold">{product.ratingCount} Verification Marks</span>
              </div>
              
              {/* STAR DISTRIBUTION PROGRESS BARS */}
              <div id="scorecard-distribution" className="flex-1 space-y-2">
                {starBreakdown.map((row) => (
                  <div key={row.stars} className="flex items-center space-x-2 text-xs font-semibold text-slate-600">
                    <span className="w-3">{row.stars}</span>
                    <Star className="h-3 w-3 fill-slate-300 text-slate-300" />
                    <div className="h-2 flex-1 rounded bg-slate-100 overflow-hidden">
                      <div className="h-full rounded bg-amber-400" style={{ width: `${row.percentage}%` }} />
                    </div>
                    <span className="w-8 text-right font-mono text-[10px] text-slate-400">{row.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: REFINERS, COLOR SELECTORS, AZURE SLIDERS & CART */}
        <div id="detail-specs-controls" className="flex flex-col">
          
          {/* HEADING BLOCK */}
          <div id="detail-headers">
            <span id="detail-sku" className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest">SKU: {product.sku}</span>
            <h2 id="detail-title" className="mt-2 font-sans text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">{product.name}</h2>
            
            <div className="mt-4 flex items-center space-x-4">
              <span id="detail-price-tag" className="font-mono text-xl font-extrabold text-blue-600">
                ${dynamicPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                {product.isAzureResource && <span className="text-xs font-normal text-slate-500 font-sans"> / month baseline</span>}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-slate-400 line-through">
                  ${product.originalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              )}
            </div>
          </div>

          <p id="detail-desc" className="mt-6 text-sm text-slate-600 leading-relaxed">{product.description}</p>

          {/* DYNAMIC PATHWAY SEEPAGE: IF AZURE CONFIGURABLE RESOURCE */}
          {product.isAzureResource ? (
            <div id="azure-config-enclosure" className="mt-8 rounded-2xl border-2 border-dashed border-blue-100 bg-blue-50/20 p-6 shadow-sm">
              <div className="flex items-center space-x-2 border-b border-blue-50 pb-3">
                <Server className="h-5 w-5 text-blue-600" />
                <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-blue-800">Azure Resource Configurator</h4>
              </div>

              {/* SLIDER: vCPUs */}
              <div className="mt-5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center space-x-1"><Cpu className="h-3.5 w-3.5 text-blue-500" /><span>vCPU Allocations</span></span>
                  <span className="font-mono text-blue-600">{vCPUs} Core{vCPUs > 1 ? 's' : ''}</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="32"
                  step="2"
                  value={vCPUs}
                  onChange={(e) => setVcpus(Number(e.target.value))}
                  className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-100 accent-blue-600"
                />
                <span className="mt-1 block text-[10px] text-slate-400 font-semibold">Scaling limits: 2 to 32 parallel cores.</span>
              </div>

              {/* SLIDER: RAM GB */}
              <div className="mt-5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center space-x-1"><Plus className="h-3.5 w-3.5 rotate-45 text-blue-500" /><span>VM RAM Allocation</span></span>
                  <span className="font-mono text-blue-600">{ramGB} GB Memory</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="128"
                  step="4"
                  value={ramGB}
                  onChange={(e) => setRamGb(Number(e.target.value))}
                  className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-100 accent-blue-600"
                />
              </div>

              {/* SLIDER: HARD DISK SSD STORAGE */}
              <div className="mt-5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center space-x-1"><HardDrive className="h-3.5 w-3.5 text-blue-500" /><span>SSD Local Storage</span></span>
                  <span className="font-mono text-blue-600">{storageGB} GB Storage</span>
                </div>
                <input
                  type="range"
                  min="32"
                  max="2048"
                  step="32"
                  value={storageGB}
                  onChange={(e) => setStorageGb(Number(e.target.value))}
                  className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-100 accent-blue-600"
                />
              </div>

              {/* DROPDOWN: CLOUD REGIONS */}
              <div className="mt-5">
                <label className="flex items-center space-x-1 text-xs font-bold text-slate-700">
                  <Compass className="h-3.5 w-3.5 text-blue-500" />
                  <span>Deployment Regional Grid</span>
                </label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="mt-2 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-blue-500"
                >
                  <option value="eastus">East US (Virginia - High Speed Core)</option>
                  <option value="westus3">West US 3 (Phoenix - Sustainable/Eco)</option>
                  <option value="westeurope">West Europe (Amsterdam - GDPR compliant)</option>
                  <option value="eastasia">East Asia (Hong Kong - High density)</option>
                  <option value="southeastasia">Southeast Asia (Singapore - Ultra low latency)</option>
                </select>
              </div>

              {/* OPTIONS: TIER SWATCH SELECTORS */}
              <div className="mt-5">
                <span className="block text-xs font-bold text-slate-700">Enterprise Service Tier tier</span>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {(['Basic', 'Standard', 'Premium'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTier(t)}
                      className={`rounded-lg py-2.5 text-center text-xs font-bold transition border ${
                        tier === t
                          ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <span className="mt-1.5 block text-[10px] text-slate-400 font-semibold">
                  {tier === 'Basic' && 'Optimized for unmanaged staging, no zone redundancy.'}
                  {tier === 'Standard' && 'General business production, standard SLA backup protection.'}
                  {tier === 'Premium' && 'Premium cluster topology with automated multi-zone replication.'}
                </span>
              </div>

            </div>
          ) : (
            /* PHYSICAL MERCH COLOR SWATCHES */
            <div id="color-swatches-box" className="mt-8">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Selected Coat Swatch</span>
              <div className="mt-3.5 flex items-center space-x-3">
                {colors.map((col) => (
                  <button
                    key={col}
                    onClick={() => setSelectedColor(col)}
                    className={`relative rounded-full px-4 py-2 text-xs font-bold border transition ${
                      selectedColor === col
                        ? 'border-slate-900 bg-slate-950 text-white shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {col.split(' ')[1] || col}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* QUANTITY CONSTRAINTS AND ACTION BAR */}
          <div id="detail-action-bar" className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center border-t border-slate-100 pt-6">
            
            {/* INCREMENTAL SPAN */}
            <div className="flex h-11 items-center rounded-lg border border-slate-200 bg-white p-1">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="flex h-9 w-9 items-center justify-center rounded text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-12 text-center font-mono text-sm font-bold text-slate-800">{quantity}</span>
              <button
                onClick={() => setQuantity(q => q + 1)}
                className="flex h-9 w-9 items-center justify-center rounded text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {/* MAIN ADD TO BAG CTA */}
            <button
              id="detail-add-cart-btn"
              onClick={handleAddToCart}
              className={`flex h-11 flex-1 items-center justify-center space-x-2 rounded-lg text-sm font-bold text-white shadow-lg transition-all ${
                addedSuccess 
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-200'
                  : 'bg-blue-600 hover:bg-blue-500 shadow-blue-200'
              }`}
            >
              {addedSuccess ? (
                <>
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Config Pack Added!</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="h-5 w-5" />
                  <span>{product.isAzureResource ? 'Load Configuration into Cart' : 'Load item into Cart'}</span>
                </>
              )}
            </button>

          </div>

          {/* 3. MULTI-TAB ACCORDION FOR SPECS / SLA PROTOCOL */}
          <div id="detail-tabs-enclosure" className="mt-12 border-t border-slate-100 pt-8">
            <div id="tabs-headers-row" className="flex border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
              <button
                onClick={() => setActiveTab('specs')}
                className={`py-3.5 pr-8 border-b-2 transition ${
                  activeTab === 'specs' ? 'border-blue-600 text-slate-900' : 'border-transparent hover:text-slate-800'
                }`}
              >
                Detailed Specifications
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`py-3.5 px-4 border-b-2 transition ${
                  activeTab === 'reviews' ? 'border-blue-600 text-slate-900' : 'border-transparent hover:text-slate-800'
                }`}
              >
                Verified Reviews ({starBreakdown.reduce((s, r)=> s+r.count,0)})
              </button>
              <button
                onClick={() => setActiveTab('sla')}
                className={`py-3.5 pl-8 border-b-2 transition ${
                  activeTab === 'sla' ? 'border-blue-600 text-slate-900' : 'border-transparent hover:text-slate-800'
                }`}
              >
                Azure SLA Warranties
              </button>
            </div>

            {/* TAB CONTENT: SPECS */}
            {activeTab === 'specs' && (
              <div id="tab-content-specs" className="mt-6 text-xs text-slate-600">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                  {Object.entries(product.specs).map(([key, val]) => (
                    <div key={key} className="border-b border-slate-50 pb-2">
                      <dt className="font-sans font-bold text-slate-400">{key}</dt>
                      <dd className="mt-1 font-semibold text-slate-800">{val}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {/* TAB CONTENT: REVIEWS */}
            {activeTab === 'reviews' && (
              <div id="tab-content-reviews" className="mt-6 space-y-6">
                
                <div className="flex border-b border-slate-50 pb-4 justify-between items-center bg-slate-50/50 p-4 rounded-xl">
                  <div className="flex items-center space-x-2.5">
                    <MessageSquare className="h-4.5 w-4.5 text-blue-600" />
                    <span className="text-xs font-bold text-slate-700">Customer feedback verified by Azure Active Directory.</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">Average: {product.rating} / 5 Stars</span>
                </div>

                <div className="space-y-4 max-h-72 overflow-y-auto pr-2">
                  <div className="border-b border-slate-150 pb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-extrabold text-slate-900">azureuser_91</span>
                      <span className="rounded bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700">Verified Client</span>
                    </div>
                    <div className="mt-1.5 flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="h-3 w-3 fill-amber-400 text-amber-400" />
                      ))}
                      <span className="ml-1 text-[10px] text-slate-400">June 14, 2026</span>
                    </div>
                    <p className="mt-2 text-xs font-bold text-slate-800">Perfect integration for our multi-tiered dev pipelines</p>
                    <p className="mt-1 text-xs text-slate-600">
                      Provisioned three general VMs from here. The downloadable ARM scripts were absolutely flawless and allowed instant launch via Azure command shells. Highly recommend!
                    </p>
                  </div>

                  <div className="border-b border-slate-100 pb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-extrabold text-slate-900">cloud_architect_hq</span>
                      <span className="rounded bg-sky-50 px-2 py-0.5 text-[9px] font-bold text-sky-700">Enterprise Tenant</span>
                    </div>
                    <div className="mt-1.5 flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`h-3 w-3 ${s <= 4 ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-200'}`} />
                      ))}
                      <span className="ml-1 text-[10px] text-slate-400">May 21, 2026</span>
                    </div>
                    <p className="mt-2 text-xs font-bold text-slate-800">Impeccable performance profiles</p>
                    <p className="mt-1 text-xs text-slate-600">
                      The active nodes deliver outstanding IOPS statistics. Solid memory clock speeds and robust virtualization supports let us run parallel unit testing workloads easily. Excellent purchase.
                    </p>
                  </div>
                </div>

              </div>
            )}

            {/* TAB CONTENT: SLA */}
            {activeTab === 'sla' && (
              <div id="tab-content-sla" className="mt-6 text-xs text-slate-600 space-y-4">
                <p className="font-semibold text-slate-800 leading-normal">
                  Our CloudCommerce Azure partnership includes pre-negotiated, enterprise-grade Service Level Agreements (SLAs) with Microsoft Azure infrastructure engineers:
                </p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="rounded-lg bg-slate-50 p-4 border border-slate-100">
                    <span className="font-sans text-xl font-black text-blue-600">99.99%</span>
                    <span className="mt-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Compute SLA</span>
                    <p className="mt-1.5 text-[11px] text-slate-500 leading-normal">Guaranteed VM connection consistency with failover configurations active.</p>
                  </div>

                  <div className="rounded-lg bg-slate-50 p-4 border border-slate-100">
                    <span className="font-sans text-xl font-black text-emerald-600">99.999%</span>
                    <span className="mt-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Data SLA</span>
                    <p className="mt-1.5 text-[11px] text-slate-500 leading-normal">Cosmos database latency guarantees with multi-region active writes enabled.</p>
                  </div>

                  <div className="rounded-lg bg-slate-50 p-4 border border-slate-100">
                    <span className="font-sans text-xl font-black text-indigo-600">&lt; 10ms</span>
                    <span className="mt-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Telemetry SLA</span>
                    <p className="mt-1.5 text-[11px] text-slate-500 leading-normal">Real-time IoT pods signal replication response times bounded globally.</p>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
