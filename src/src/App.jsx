import React, { useState } from 'react';
import { 
  User, Layers, HardDriveUpload, Settings, 
  Database, Radio, Play, Cpu, ShieldCheck, 
  Terminal, Search, Target, Calendar, Plus,
  ChevronRight, RefreshCw, Lock, MessageSquare, FileText, Link
} from 'lucide-react';

// --- SUB-COMPONENT: PERSONA BUILDER ---
const PersonaPanel = () => {
  const [personas] = useState([
    { name: 'Killian', role: 'Architect', voiceId: 'Kore' },
    { name: 'Katie', role: 'Analyst', voiceId: 'Aoede' },
    { name: 'Marcus', role: 'Fixer', voiceId: 'Fenrir' }
  ]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 bg-zinc-900/40 border border-zinc-800 p-8 rounded-xl">
        <h2 className="text-xl font-bold uppercase mb-8 flex items-center gap-3">
          <Plus size={20} className="text-[#00ffcc]" /> Create New Forensic Identity
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] text-zinc-500 uppercase font-bold">Identity Designation</label>
            <input className="w-full bg-black border border-zinc-800 p-4 rounded text-sm focus:border-[#00ffcc] outline-none" placeholder="e.g. SIOBHAN" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] text-zinc-500 uppercase font-bold">Operational Role</label>
            <select className="w-full bg-black border border-zinc-800 p-4 rounded text-sm focus:border-[#00ffcc] outline-none appearance-none">
              <option>Forensic Analyst</option>
              <option>Systems Architect</option>
              <option>Rogue Logic</option>
            </select>
          </div>
          <div className="lg:col-span-2 space-y-2">
            <label className="text-[10px] text-zinc-500 uppercase font-bold">Origin Trauma / Lore Seed</label>
            <textarea className="w-full bg-black border border-zinc-800 p-4 rounded text-sm focus:border-[#00ffcc] outline-none h-24" placeholder="The reason they audit the machine..." />
          </div>
        </div>
        <button className="mt-8 w-full bg-[#00ffcc] text-black font-black py-5 rounded uppercase tracking-tighter hover:bg-white transition-all shadow-[0_0_20px_rgba(0,255,204,0.2)]">
          Commit Identity to Vault
        </button>
      </div>

      <div className="bg-zinc-900/20 border border-zinc-800 p-6 rounded-xl h-fit">
        <h2 className="text-xs font-bold uppercase mb-6 flex items-center gap-2 text-zinc-400">
          <Database size={14} /> Identity_Vault
        </h2>
        <div className="space-y-4">
          {personas.map((p, i) => (
            <div key={i} className="p-4 border border-zinc-800 bg-black/40 rounded hover:border-[#00ffcc]/40 transition-all cursor-pointer group">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-bold uppercase group-hover:text-[#00ffcc]">{p.name}</span>
                <span className="text-[8px] px-2 py-0.5 border border-zinc-800 rounded text-zinc-500">{p.role}</span>
              </div>
              <div className="text-[10px] text-zinc-600 uppercase tracking-widest">{p.voiceId}_Link_Active</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- SUB-COMPONENT: SEASON ARCHITECT ---
const SeasonPanel = () => {
  const [topic, setTopic] = useState('');
  const episodes = [
    { id: 'S02E01', theme: 'The Lithium Bottleneck', target: 'Albemarle Corp', act: 1 },
    { id: 'S02E02', theme: 'Refinery Monopolies', target: 'Ganfeng Lithium', act: 1 },
    { id: 'S02E03', theme: 'The Solid State Mirage', target: 'QuantumScape', act: 2 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-zinc-900/40 border border-zinc-800 p-8 rounded-xl">
          <h2 className="text-sm font-bold uppercase mb-6 flex items-center gap-2">
            <Target size={16} className="text-[#00ffcc]" /> Macro_Seed
          </h2>
          <div className="space-y-6">
            <input 
              className="w-full bg-black border border-zinc-800 p-4 rounded text-sm focus:border-[#00ffcc] outline-none"
              placeholder="INPUT SEASON TOPIC..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
            <button className="w-full py-5 bg-[#00ffcc] text-black font-black rounded uppercase text-xs hover:shadow-[0_0_30px_rgba(0,255,204,0.3)] transition-all">
              Reconcile_Audit_Arc
            </button>
          </div>
        </div>
        <div className="p-6 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/10">
          <h3 className="text-[10px] text-zinc-600 font-bold uppercase mb-4">Forensic_Rule_Set</h3>
          <div className="space-y-3">
            <div className="text-[9px] flex items-center gap-2 text-zinc-500"><ChevronRight size={10} /> 3-Act Narrative Structure</div>
            <div className="text-[9px] flex items-center gap-2 text-zinc-500"><ChevronRight size={10} /> Cross-Persona Dialogue Logic</div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-8 bg-black/40 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-6 bg-zinc-900/20 border-b border-zinc-800 flex justify-between items-center">
          <h2 className="text-xs font-bold uppercase flex items-center gap-2"><Calendar size={14} /> Sequence_Timeline</h2>
          <span className="text-[9px] text-zinc-600 uppercase tracking-widest">Archive_Ready</span>
        </div>
        <div className="divide-y divide-zinc-900">
          {episodes.map((ep, i) => (
            <div key={i} className="p-6 flex items-center justify-between hover:bg-zinc-900/20 transition-colors">
              <div className="flex gap-6 items-center">
                <span className="text-[10px] font-bold text-zinc-700">{ep.id}</span>
                <div>
                  <div className="text-xs font-bold uppercase mb-1">{ep.theme}</div>
                  <div className="text-[9px] text-zinc-500 uppercase tracking-tighter">Target: {ep.target}</div>
                </div>
              </div>
              <div className="flex gap-1">
                {[1,2,3].map(a => <div key={a} className={`h-1 w-6 rounded-full ${a === ep.act ? 'bg-[#00ffcc]' : 'bg-zinc-800'}`} />)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- SUB-COMPONENT: SOURCE INJECTOR ---
const SourcePanel = () => {
  const sources = [
    { id: 'pdf', icon: FileText, label: 'Document', desc: 'SEC Filings, Memos' },
    { id: 'url', icon: Link, label: 'Signal Path', desc: 'Websites, News' },
    { id: 'raw', icon: MessageSquare, label: 'Raw Intel', desc: 'Transcripts' }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sources.map(s => (
          <div key={s.id} className="p-6 bg-zinc-900/20 border border-zinc-800 rounded-xl hover:border-[#00ffcc]/30 transition-all cursor-pointer">
            <s.icon size={20} className="text-[#00ffcc] mb-4" />
            <div className="text-sm font-bold uppercase mb-1">{s.label}</div>
            <div className="text-[10px] text-zinc-600">{s.desc}</div>
          </div>
        ))}
      </div>
      <div className="bg-zinc-950 border-2 border-dashed border-zinc-800 rounded-2xl p-20 flex flex-col items-center text-center group hover:border-[#00ffcc]/40 transition-all">
        <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
          <HardDriveUpload className="text-zinc-600 group-hover:text-[#00ffcc]" />
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tighter mb-4">Drop Data Fragment</h2>
        <p className="text-zinc-500 text-xs max-w-xs mb-8">N=1 Local Encryption Active. No logic leaves this terminal.</p>
        <button className="px-10 py-4 bg-[#00ffcc] text-black font-black rounded-lg uppercase text-xs shadow-[0_0_30px_rgba(0,255,204,0.1)]">Begin Ingestion</button>
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---
const App = () => {
  const [activeTab, setActiveTab] = useState('season');

  const navItems = [
    { id: 'season', icon: Layers, label: 'Season' },
    { id: 'persona', icon: User, label: 'Persona' },
    { id: 'source', icon: HardDriveUpload, label: 'Inject' },
    { id: 'settings', icon: Settings, label: 'Nodes' }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 font-mono flex">
      
      {/* Sidebar Nav */}
      <div className="w-20 md:w-64 border-r border-zinc-900 flex flex-col bg-black/50 backdrop-blur-xl">
        <div className="p-8 border-b border-zinc-900 flex items-center gap-4">
          <div className="w-8 h-8 bg-[#00ffcc] rounded flex items-center justify-center text-black font-black">C</div>
          <span className="hidden md:block text-xs font-black tracking-[0.4em] uppercase text-[#00ffcc]">Cassandra</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 mt-4">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-lg transition-all ${activeTab === item.id ? 'bg-[#00ffcc]/10 text-[#00ffcc]' : 'text-zinc-600 hover:text-zinc-400 hover:bg-zinc-900/40'}`}
            >
              <item.icon size={20} />
              <span className="hidden md:block text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-zinc-900">
          <div className="bg-zinc-900/40 p-4 rounded-lg hidden md:block">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-1.5 w-1.5 rounded-full bg-[#00ffcc] animate-pulse" />
              <span className="text-[8px] uppercase text-zinc-500 font-bold">Local Brain: Active</span>
            </div>
            <div className="text-[10px] text-zinc-400 font-bold">LLAMA-3B_INT8</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        <header className="mb-12 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase text-white mb-2">
              {activeTab}_Engine_v1.0
            </h1>
            <p className="text-[10px] text-zinc-500 tracking-[0.5em] uppercase">Status: Terminal_Safe // N=1_Personal_Media</p>
          </div>
          <div className="hidden lg:flex gap-4">
            <div className="px-4 py-2 border border-zinc-800 rounded bg-zinc-900/20 text-[9px] uppercase font-bold flex items-center gap-2">
              <ShieldCheck size={12} /> Privacy: AES-256
            </div>
            <div className="px-4 py-2 border border-zinc-800 rounded bg-zinc-900/20 text-[9px] uppercase font-bold flex items-center gap-2">
              <Cpu size={12} /> Savings: 84.2%
            </div>
          </div>
        </header>

        {activeTab === 'persona' && <PersonaPanel />}
        {activeTab === 'season' && <SeasonPanel />}
        {activeTab === 'source' && <SourcePanel />}
        
        {/* Simple Footer Diagnostics */}
        <footer className="mt-20 pt-8 border-t border-zinc-900 flex justify-between items-center opacity-30 grayscale hover:grayscale-0 transition-all cursor-default">
          <div className="flex gap-8 text-[9px] uppercase font-bold tracking-widest">
            <div className="flex items-center gap-2"><Radio size={12} /> Transmission_Stable</div>
            <div className="flex items-center gap-2"><Terminal size={12} /> Root_Access_Granted</div>
          </div>
          <div className="text-[9px] uppercase font-bold tracking-widest">©2026_Cassandra_Protocol</div>
        </footer>
      </main>
    </div>
  );
};

export default App;
