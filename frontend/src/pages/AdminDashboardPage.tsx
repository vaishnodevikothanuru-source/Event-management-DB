import React from 'react';
import { 
  Shield, Activity, Users, Building, DollarSign, 
  Calendar, Layers, CheckCircle2, AlertTriangle, 
  Lock, Server, Database 
} from 'lucide-react';
import { INITIAL_PLATFORM_STATS } from '../services/mockData';

export const AdminDashboardPage: React.FC = () => {
  const stats = INITIAL_PLATFORM_STATS;

  const auditLogs = [
    { id: '1', action: 'ORGANIZATION_CREATED', entity: 'Apex Innovation Group', actor: 'marcus@techcorp.io', time: '12 mins ago', status: 'SUCCESS' },
    { id: '2', action: 'EVENT_PUBLISHED', entity: 'Global AI Summit 2026', actor: 'marcus@techcorp.io', time: '28 mins ago', status: 'SUCCESS' },
    { id: '3', action: 'PAYMENT_CAPTURED', entity: 'TXN-9941 ($499.00)', actor: 'attendee@nexus.io', time: '42 mins ago', status: 'SUCCESS' },
    { id: '4', action: 'KAFKA_DISPATCH_RETRY', entity: 'topic:notification-events', actor: 'System Worker #2', time: '1 hr ago', status: 'RESOLVED' },
  ];

  const microservices = [
    { name: 'API Gateway (Spring Cloud)', status: 'HEALTHY', latency: '4ms', port: 8080 },
    { name: 'Auth & User Service', status: 'HEALTHY', latency: '8ms', port: 8081 },
    { name: 'Event & Agenda Service', status: 'HEALTHY', latency: '12ms', port: 8082 },
    { name: 'Ticket & Payment Service', status: 'HEALTHY', latency: '15ms', port: 8083 },
    { name: 'FastAPI AI RAG Service', status: 'HEALTHY', latency: '28ms', port: 8000 },
    { name: 'Kafka Cluster (3 Brokers)', status: 'OPERATIONAL', latency: '2ms', port: 9092 },
    { name: 'PostgreSQL + pgvector', status: 'HEALTHY', latency: '1ms', port: 5432 },
    { name: 'Redis Cache Cluster', status: 'HEALTHY', latency: '<1ms', port: 6379 },
  ];

  return (
    <div className="space-y-8 pb-12">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 glass-panel rounded-3xl border border-red-500/30 bg-slate-900/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-400">
            <Shield className="w-4 h-4" />
            <span>Platform Root Administration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            System Governance & Infrastructure Health
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Global multi-tenant platform metrics, distributed microservice health checks, and security audit log streams.
          </p>
        </div>
      </div>

      {/* Global Platform KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-2">
          <span className="text-xs text-slate-400 uppercase font-bold">Total Platform Users</span>
          <div className="text-2xl font-black text-white">{stats.totalUsers.toLocaleString()}</div>
          <div className="text-[11px] text-slate-400">184 Verified Organizations</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-2">
          <span className="text-xs text-slate-400 uppercase font-bold">Global Gross Revenue</span>
          <div className="text-2xl font-black text-emerald-400">${(stats.totalRevenue / 1000000).toFixed(2)}M</div>
          <div className="text-[11px] text-emerald-400 font-semibold">+18.2% MoM Platform Volume</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-2">
          <span className="text-xs text-slate-400 uppercase font-bold">Hosted Summits</span>
          <div className="text-2xl font-black text-red-400">{stats.totalEvents}</div>
          <div className="text-[11px] text-slate-400">{stats.activeEventsCount} Ongoing Active</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-2">
          <span className="text-xs text-slate-400 uppercase font-bold">Total Registrations</span>
          <div className="text-2xl font-black text-pink-400">{stats.totalRegistrations.toLocaleString()}</div>
          <div className="text-[11px] text-pink-400 font-semibold">{stats.platformEngagementRate}% Live Engagement</div>
        </div>
      </div>

      {/* Microservices Health Grid */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Server className="w-4 h-4 text-brand-400" />
            Distributed Microservices & Data Infrastructure Mesh
          </h3>
          <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            8 / 8 Services Healthy
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {microservices.map((srv, i) => (
            <div key={i} className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white truncate max-w-[150px]">{srv.name}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Port: :{srv.port}</span>
                <span className="font-mono text-emerald-400">{srv.latency}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security Audit Log Stream */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Lock className="w-4 h-4 text-red-400" />
          Real-Time Audit Logs & Security Telemetry
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="pb-3 font-semibold">Action</th>
                <th className="pb-3 font-semibold">Entity</th>
                <th className="pb-3 font-semibold">Actor / IP</th>
                <th className="pb-3 font-semibold">Timestamp</th>
                <th className="pb-3 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 font-bold text-slate-200">{log.action}</td>
                  <td className="py-3 text-slate-400">{log.entity}</td>
                  <td className="py-3 text-brand-300">{log.actor}</td>
                  <td className="py-3 text-slate-500">{log.time}</td>
                  <td className="py-3 text-right">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
