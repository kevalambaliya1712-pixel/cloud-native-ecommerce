/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, Terminal, Cpu, Database, BrainCircuit, PlayCircle, Loader2, ArrowRight, Server, MessageSquare } from 'lucide-react';
import { Product, CustomResourceConfig } from '../types.js';
import { optimizeArchitecture } from '../services/product.service.js';

interface RecommendedResourceItem {
  id: 'azure-vm' | 'azure-cosmos' | 'azure-cognitive';
  reasonText: string;
  config: {
    vCPUs: number;
    ramGB: number;
    storageGB: number;
    region: string;
    tier: 'Basic' | 'Standard' | 'Premium';
    monthlyRate: number;
  };
}

interface GeminiConsultResponse {
  architectureSummary: string;
  recommendedResources: RecommendedResourceItem[];
}

interface AzureConsultantProps {
  products: Product[];
  onInjectResources: (recommendations: { product: Product; quantity: number; config: CustomResourceConfig }[]) => void;
  setActiveTab: (tab: string) => void;
}

export function AzureConsultant({ products, onInjectResources, setActiveTab }: AzureConsultantProps) {
  const [promptInput, setPromptInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [apiError, setApiError] = React.useState('');
  const [consultResult, setConsultResult] = React.useState<GeminiConsultResponse | null>(null);

  const samplePrompts = [
    'I want to build a high-performance web app with global NoSQL storage, quick response search and heavy developer compute VM.',
    'Just looking for a cheap hosting space for staging APIs with minimal DB overhead.',
    'I need a high-scale heavy compute Linux cluster capable of high memory operations with continuous double backups.'
  ];

  const handleConsultSubmit = async (e?: React.FormEvent, manualPrompt?: string) => {
    if (e) e.preventDefault();
    const activePrompt = manualPrompt || promptInput;
    if (!activePrompt.trim()) return;

    setIsLoading(true);
    setApiError('');
    setConsultResult(null);

    try {
      const data = await optimizeArchitecture(activePrompt);
      setConsultResult(data);
    } catch (err: any) {
      console.error('Failed to trigger optimization consult:', err);
      setApiError(err.message || 'An unexpected networking error occurred. Make sure your GEMINI_API_KEY is configured.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInject = () => {
    if (!consultResult || !consultResult.recommendedResources) return;

    const itemsToInject = consultResult.recommendedResources.map((rec) => {
      const matchedProduct = products.find((p) => p.id === rec.id) || products[0];
      const customConfig: CustomResourceConfig = {
        vCPUs: rec.config.vCPUs,
        ramGB: rec.config.ramGB,
        storageGB: rec.config.storageGB,
        region: rec.config.region,
        tier: rec.config.tier,
        monthlyRate: rec.config.monthlyRate
      };

      return {
        product: matchedProduct,
        quantity: 1,
        config: customConfig
      };
    });

    onInjectResources(itemsToInject);
    setActiveTab('cart');
  };

  return (
    <div id="azure-consult-view" className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      
      {/* HEADER SECTION */}
      <div id="advisor-header" className="border-b border-slate-150 pb-6 text-center sm:text-left">
        <span className="inline-flex items-center space-x-1.5 rounded-full bg-blue-50 px-3.5 py-1.5 text-xs font-bold text-blue-800">
          <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
          <span>Azure Principal AI Solutions Architect</span>
        </span>
        <h2 id="advisor-title" className="mt-4 font-sans text-3xl font-black text-slate-950 tracking-tight">AI Cloud Architect &amp; Cost Optimizer</h2>
        <p id="advisor-subtitle" className="mt-2 text-xs text-slate-500 leading-relaxed font-semibold max-w-2xl">
          Describe your business logic or container workloads in plain English. Our deep reasoning engine will configure exact virtual slots, cores, DB replications, and compile a purchasable shopping cart package instantly.
        </p>
      </div>

      <div id="advisor-workspace-grid" className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
        
        {/* LEFT FORM CHANNELS (5 columns) */}
        <div id="advisor-prompt-channel" className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <h3 className="font-sans text-xs font-black uppercase tracking-wider text-slate-400">Describe Your Target System</h3>
            
            <form id="advisor-prompter-form" onSubmit={(e) => handleConsultSubmit(e)} className="mt-4">
              <textarea
                id="advisor-textarea"
                rows={5}
                required
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder="Example: I need to build a high-availability enterprise medical dashboard tracking real-time cardiac signals from IoT wearables with search capabilities."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs font-medium placeholder-slate-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
              />

              <button
                id="advisor-consult-sumbit"
                type="submit"
                disabled={isLoading}
                className="mt-4 flex w-full items-center justify-center space-x-1.5 rounded-lg bg-blue-600 py-3 text-xs font-bold text-white shadow-lg shadow-blue-100 hover:bg-blue-500 disabled:opacity-40 transition"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4.5 w-4.5 animate-spin" />
                    <span>Analyzing Architectural Vectors...</span>
                  </>
                ) : (
                  <>
                    <BrainCircuit className="h-4.5 w-4.5" />
                    <span>Generate Recommended Blueprint</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* QUICK PROMPTS CHIPS */}
          <div id="quick-prompt-chips" className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Structural Quick-Tests</h4>
            <div className="mt-3.5 space-y-2">
              {samplePrompts.map((p, idx) => (
                <button
                  key={`sample-${idx}`}
                  disabled={isLoading}
                  onClick={() => {
                    setPromptInput(p);
                    handleConsultSubmit(undefined, p);
                  }}
                  className="flex w-full items-start space-x-2 rounded-lg border border-slate-200/60 bg-white p-2.5 text-left text-[11px] font-medium text-slate-600 hover:border-blue-300 hover:bg-blue-50/20 transition hover:text-blue-700 disabled:opacity-50"
                >
                  <PlayCircle className="h-4 w-4 shrink-0 text-blue-500 mt-0.5" />
                  <span className="line-clamp-2">{p}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT AI RESPONSE MONITOR (7 columns) */}
        <div id="advisor-monitor-channel" className="lg:col-span-7">
          
          {/* LOADER PLACEHOLDER */}
          {isLoading && (
            <div id="advisor-loader-box" className="flex flex-col items-center justify-center rounded-2xl border border-slate-150 bg-white p-20 text-center min-h-[380px] shadow-sm animate-pulse">
              <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
              <h3 className="mt-6 text-sm font-bold text-slate-900">Calling Azure Architects</h3>
              <p className="mt-2.5 max-w-xs text-xs text-slate-400 leading-normal font-semibold">
                Applying Gemini deep reasoning models to match infrastructure metrics. Evaluating best fit vCPUs, SSD storage layers, region boundaries, and optimal cost calculations...
              </p>
            </div>
          )}

          {/* ERROR STATUS */}
          {apiError && (
            <div id="advisor-error-box" className="rounded-2xl border border-rose-100 bg-rose-50/50 p-8 text-center min-h-[380px] flex flex-col justify-center items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 border border-rose-200">
                <Terminal className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-sm font-extrabold text-rose-950">Architect Connection Stalled</h3>
              <p className="mt-2 text-xs font-bold text-rose-800 max-w-sm">
                Error log: {apiError}
              </p>
              <p className="mt-4 text-[10px] text-slate-500 max-w-xs leading-normal font-semibold">
                Please make sure you have loaded an API key into the Secrets panel of this applet container so server-side queries compile correctly.
              </p>
            </div>
          )}

          {/* EMPTY INITIAL STATE */}
          {!isLoading && !apiError && !consultResult && (
            <div id="advisor-empty-box" className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center min-h-[380px] shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-400 border border-slate-100">
                <BrainCircuit className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-sm font-extrabold text-slate-950">Architect Standby Mode</h3>
              <p className="mt-2 max-w-xs text-xs text-slate-400 leading-relaxed font-semibold">
                Input your deployment parameters or hit one of our structural quick-tests to witness server-side Gemini compile custom Azure blueprints!
              </p>
            </div>
          )}

          {/* LIVE SUCCESS BLUEPRINT CENTER */}
          {!isLoading && !apiError && consultResult && (
            <div id="advisor-result-box" className="rounded-2xl border border-slate-100 bg-white p-6 shadow-md transition-all">
              
              <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                <div className="flex items-center space-x-2">
                  <Terminal className="h-4.5 w-4.5 text-blue-600" />
                  <span className="font-sans text-xs font-bold uppercase tracking-wider text-slate-900">Custom Blueprint Response</span>
                </div>
                <span className="rounded bg-sky-50 px-2.5 py-0.5 text-[9px] font-mono font-bold text-sky-700">ARM SECURE</span>
              </div>

              {/* ARCHITECTURE SUMMARY */}
              <div id="advisor-markup" className="mt-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1">
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>Interactive Consultation Summary</span>
                </h4>
                <p className="mt-2.5 text-xs text-slate-600 leading-normal font-semibold p-4 rounded-xl bg-slate-50/50 border border-slate-100">
                  {consultResult.architectureSummary}
                </p>
              </div>

              {/* RECOMMENDED RESOURCES TABLE */}
              <div id="advisor-recs" className="mt-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1">
                  <Server className="h-3.5 w-3.5" />
                  <span>Sizing Calculations</span>
                </h4>
                
                <div className="mt-3 space-y-3">
                  {consultResult.recommendedResources && consultResult.recommendedResources.map((rec) => {
                    const isVM = rec.id === 'azure-vm';
                    const isCosmos = rec.id === 'azure-cosmos';
                    return (
                      <div key={rec.id} className="rounded-xl border border-slate-100/80 bg-white p-4 shadow-sm hover:border-blue-200 transition">
                        <div className="flex items-center justify-between text-xs font-extrabold text-slate-900">
                          <span className="capitalize">{rec.id.replace('-', ' ')}</span>
                          <span className="font-mono text-blue-600 font-black">${rec.config.monthlyRate}/mo estimated</span>
                        </div>
                        <p className="mt-1.5 text-[11px] text-slate-500 font-medium leading-relaxed italic">
                          " {rec.reasonText} "
                        </p>
                        
                        {/* RECOGNIZABLE CORE METRICS */}
                        <div className="mt-3 flex gap-1.5 font-mono text-[9px] text-emerald-800">
                          <span className="rounded bg-emerald-50 px-2.5 py-0.5 font-bold">{rec.config.vCPUs} Cores</span>
                          <span className="rounded bg-emerald-50 px-2.5 py-0.5 font-bold">{rec.config.ramGB}GB Memory</span>
                          <span className="rounded bg-emerald-50 px-2.5 py-0.5 font-bold">{rec.config.storageGB}GB Disk</span>
                          <span className="rounded bg-indigo-50 text-indigo-700 px-2.5 py-0.5 font-bold uppercase">{rec.config.region}</span>
                          <span className="rounded bg-sky-50 text-sky-700 px-2.5 py-0.5 font-bold">{rec.config.tier}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* MASTER AUTOMATOR TRIGGER */}
              <div id="advisor-master-box" className="mt-8 border-t border-slate-100 pt-5">
                <button
                  id="advisor-inject-cta"
                  onClick={handleInject}
                  className="flex w-full items-center justify-center space-x-2 rounded-xl bg-slate-950 py-3.5 text-xs font-bold text-white shadow-xl shadow-slate-200 hover:bg-slate-850 transition"
                >
                  <span>Inject specifications &amp; load into cart</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

            </div>
          )}

        </div>
      </div>

    </div>
  );
}
