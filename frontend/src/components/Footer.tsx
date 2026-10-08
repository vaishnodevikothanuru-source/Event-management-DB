import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Globe, ShieldCheck, Zap } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#070A12] border-t border-slate-800/80 pt-16 pb-12 mt-20 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-pink-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">
                EVENT <span className="text-brand-400">SPHERE</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Next-generation event management & engagement ecosystem. Powered by Spring Boot microservices, Kafka event streaming, and Sphere AI RAG intelligence.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full w-fit border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              All Microservices Operational (99.99%)
            </div>
          </div>

          {/* Col 1 */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4 tracking-wider uppercase">Platform</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/events" className="hover:text-white transition-colors">Event Discovery</Link></li>
              <li><Link to="/agenda" className="hover:text-white transition-colors">Live Schedule & Agenda</Link></li>
              <li><Link to="/networking" className="hover:text-white transition-colors">AI Matchmaking</Link></li>
              <li><Link to="/organizer/dashboard" className="hover:text-white transition-colors">Organizer Portal</Link></li>
              <li><Link to="/admin/dashboard" className="hover:text-white transition-colors">Admin Console</Link></li>
            </ul>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4 tracking-wider uppercase">Technology</h4>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-brand-400" /> Spring Boot 3 / Java 21</li>
              <li className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-cyan-400" /> FastAPI + pgvector RAG</li>
              <li className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-purple-400" /> Apache Kafka Streams</li>
              <li className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-pink-400" /> Redis State Caching</li>
              <li className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-emerald-400" /> React 19 + TypeScript</li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4 tracking-wider uppercase">Security & Compliance</h4>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Multi-Tenant Isolation</li>
              <li className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> JWT + BCrypt Security</li>
              <li className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> GDPR & SOC2 Ready</li>
              <li className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Digital QR Validation</li>
            </ul>
          </div>

        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} Event Sphere Platform Inc. All rights reserved. <span className="text-slate-400 font-medium">"Connect. Engage. Experience."</span>
          </div>
          <div className="flex items-center gap-5">
            <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
            <span className="hover:text-white cursor-pointer transition-colors">API Docs</span>
            <span className="hover:text-white cursor-pointer transition-colors">Status</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
