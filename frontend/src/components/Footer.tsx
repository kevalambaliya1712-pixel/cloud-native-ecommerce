/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Server, ShieldCheck, RefreshCw, Send, CheckCircle2 } from 'lucide-react';

interface FooterProps {
  setActiveTab: (tab: string) => void;
  setFilterCategory: (category: string | null) => void;
}

export function Footer({ setActiveTab, setFilterCategory }: FooterProps) {
  const [emailSubscribed, setEmailSubscribed] = React.useState(false);
  const [subEmail, setSubEmail] = React.useState('');

  const handleSub = (e: React.FormEvent) => {
    e.preventDefault();
    if (subEmail.trim()) {
      setEmailSubscribed(true);
      setSubEmail('');
    }
  };

  const handleCategoryClick = (category: string | null) => {
    setFilterCategory(category);
    setActiveTab('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="main-footer" className="bg-slate-900 text-slate-400">
      
      {/* BRANDING VALUE PROPOSITION GRID */}
      <div id="footer-perks" className="border-b border-slate-800 py-10">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 sm:grid-cols-3 sm:px-6 lg:px-8">
          
          <div id="perk-1" className="flex items-start space-x-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-blue-400">
              <Server className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-sans text-sm font-semibold text-slate-100">Hybrid Azure Integration</h4>
              <p className="mt-1 text-xs text-slate-400">Dynamically compiling Bicep configurations & ARM Templates for every compute purchase.</p>
            </div>
          </div>

          <div id="perk-2" className="flex items-start space-x-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-sans text-sm font-semibold text-slate-100">Enterprise SLA Protection</h4>
              <p className="mt-1 text-xs text-slate-400">We guarantee 99.99% system availability for all premium hosted developer clusters.</p>
            </div>
          </div>

          <div id="perk-3" className="flex items-start space-x-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-indigo-400">
              <RefreshCw className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-sans text-sm font-semibold text-slate-100">Scalable Capacity Cycles</h4>
              <p className="mt-1 text-xs text-slate-400">Seamlessly scale up vCPUs or RAM instances mid-cycle inside your active billing profiles.</p>
            </div>
          </div>

        </div>
      </div>

      {/* CORE FOOTER LINKS SECTION */}
      <div id="footer-links-grid" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-4 md:grid-cols-2">
          
          {/* COLUMN 1: CORPORATE SUMMARY */}
          <div id="footer-col-summary">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-600 text-white font-bold">
                C
              </div>
              <span id="f-logo-text" className="font-sans text-base font-bold text-white tracking-tight">
                Cloud<span className="text-blue-500">Commerce</span>
              </span>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-slate-400">
              The premium, certified portal delivering high-end virtual cloud compute resources and coordinated developer accessories optimized for Azure Cloud architectures.
            </p>
            <div id="f-compliance-badges" className="mt-6 flex space-x-2">
              <span className="rounded bg-slate-800 px-2.5 py-1 text-[9px] font-mono font-semibold text-slate-300">HIPAA COMPLIANT</span>
              <span className="rounded bg-slate-800 px-2.5 py-1 text-[9px] font-mono font-semibold text-slate-300">SOC2 CERTIFIED</span>
            </div>
          </div>

          {/* COLUMN 2: ACTIVE ASSET CATEGORIES */}
          <div id="footer-col-categories">
            <h5 className="font-sans text-xs font-bold uppercase tracking-widest text-slate-200">Catalog Registry</h5>
            <ul className="mt-4 space-y-2.5 text-xs">
              <li>
                <button onClick={() => handleCategoryClick(null)} className="hover:text-blue-400 transition text-left">
                  Show All Products
                </button>
              </li>
              <li>
                <button onClick={() => handleCategoryClick('Compute & VM')} className="hover:text-blue-400 transition text-left">
                  Compute VMs & Networks
                </button>
              </li>
              <li>
                <button onClick={() => handleCategoryClick('Data & Storage')} className="hover:text-blue-400 transition text-left">
                  Cosmos Databases
                </button>
              </li>
              <li>
                <button onClick={() => handleCategoryClick('IoT DevKit')} className="hover:text-blue-400 transition text-left">
                  Premium Audio & IoT Pods
                </button>
              </li>
              <li>
                <button onClick={() => handleCategoryClick('Apparel & Gear')} className="hover:text-blue-400 transition text-left">
                  Certified Dev Apparel
                </button>
              </li>
            </ul>
          </div>

          {/* COLUMN 3: BLUEPRINT & DEVELOPER SYSTEM */}
          <div id="footer-col-resources">
            <h5 className="font-sans text-xs font-bold uppercase tracking-widest text-slate-200">Azure Developers</h5>
            <ul className="mt-4 space-y-2.5 text-xs">
              <li>
                <button onClick={() => { setActiveTab('advisor'); window.scrollTo(0,0); }} className="hover:text-amber-400 text-left transition flex items-center space-x-1 font-semibold text-slate-300">
                  <span>AI Architecture Architect</span>
                </button>
              </li>
              <li>
                <a href="https://learn.microsoft.com/en-us/azure/" target="_blank" rel="noreferrer" className="hover:text-blue-400 transition">
                  Official Azure Learn
                </a>
              </li>
              <li>
                <a href="https://azure.microsoft.com/en-us/pricing/calculator/" target="_blank" rel="noreferrer" className="hover:text-blue-400 transition">
                  Azure Cost Estimator
                </a>
              </li>
              <li>
                <span className="hover:text-blue-400 cursor-help transition" title="Bicep support included on all checkout blueprints">
                  Bicep Compiler SDK v2
                </span>
              </li>
            </ul>
          </div>

          {/* COLUMN 4: NEWSLETTER SIGNUP */}
          <div id="footer-col-newsletter">
            <h5 className="font-sans text-xs font-bold uppercase tracking-widest text-slate-200">Release Signals</h5>
            <p className="mt-3 text-xs leading-relaxed text-slate-400">
              Subscribe to capture periodic service upgrades, security telemetry updates and promotional discounts.
            </p>
            
            {emailSubscribed ? (
              <div id="f-sub-success" className="mt-4 flex items-center space-x-2 rounded bg-slate-800/80 p-3 text-xs text-emerald-400 border border-emerald-900/40">
                <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
                <span>Locked in! See you in the cloud.</span>
              </div>
            ) : (
              <form id="f-newsletter-form" onSubmit={handleSub} className="mt-4 flex">
                <input
                  id="f-newsletter-email"
                  type="email"
                  required
                  placeholder="azureuser@developer.com"
                  value={subEmail}
                  onChange={(e) => setSubEmail(e.target.value)}
                  className="w-full rounded-l bg-slate-800 px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 outline-none ring-offset-slate-900 transition focus:ring-1 focus:ring-blue-500"
                />
                <button
                  id="f-newsletter-submit"
                  type="submit"
                  className="rounded-r bg-blue-600 px-4 py-2.5 text-white hover:bg-blue-500 transition focus:outline-none"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>
            )}
          </div>

        </div>
      </div>

      {/* METRIC ACCREDITATIONS & LEGAL ROW */}
      <div id="footer-legal-bar" className="border-t border-slate-800 bg-slate-950 py-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between px-4 text-center text-xs md:flex-row sm:px-6 lg:px-8">
          <p id="f-copy-phrase">
            &copy; {new Date().getFullYear()} CloudCommerce Global Stores Inc. Independent partner, powered by Microsoft Azure Cloud Integration.
          </p>
          <div id="f-legal-links" className="mt-4 flex space-x-6 md:mt-0">
            <span className="hover:text-slate-300 transition cursor-pointer">Security Protocol</span>
            <span className="hover:text-slate-300 transition cursor-pointer">Billing Agreement</span>
            <span className="hover:text-slate-300 transition cursor-pointer">Status Dashboard</span>
          </div>
        </div>
      </div>

    </footer>
  );
}
