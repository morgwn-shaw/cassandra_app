import React, { useState, useEffect } from 'react';
import { 
  User, Layers, HardDriveUpload, Settings, 
  Database, Radio, Play, Cpu, ShieldCheck, 
  Terminal, Search, Target, Calendar, Plus,
  ChevronRight, RefreshCw, Lock, MessageSquare, FileText, Link
} from 'lucide-react';

// --- CONFIGURATION ---
// The forensic bridge to your PythonAnywhere Node
const API_BASE = "https://cassandrafiles.pythonanywhere.com/api";

// --- SUB-COMPONENT: PERSONA BUILDER ---
const PersonaPanel = () => {
  const [personas, setPersonas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({ name: '', role: 'Forensic Analyst', trauma: '', voiceId: 'Kore' });

  const fetchPersonas = () => {
    setLoading(true);
    fetch(`${API_BASE}/persona/list`)
      .then(res => res.json())
      .then(data => {
        setPersonas(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchPersonas(); }, []);

  const handleCommit = async () => {
    if (!formData.name) return;
    setIsSaving(true);
    try {
      const res = await fetch(`${API_BASE}/persona/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setFormData({ name: '', role: 'Forensic Analyst', trauma: '', voiceId: 'Kore' });
        fetchPersonas();
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="lg:col-span-2 bg-zinc-900/40 border border-zinc-800 p-8 rounded-xl">
        <h2 className="text-xl font-bold uppercase mb-8 flex items-center gap-3">
          <Plus size={20} className="text-[#00ffcc]" /> Create New Forensic Identity
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] text-zinc-500 uppercase font-bold">Identity Designation</label>
            <input 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-black border border-zinc-800 p-4 rounded text-sm focus:border-[#00ffcc] outline-none" 
              placeholder="e.g. SIOBHAN" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] text-zinc-500 uppercase font-bold">Operational Role</label>
            <select 
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              className="w-full bg-black border border-zinc-800 p-4 rounded text-sm focus:border-[#00ffcc] outline-none appearance-none"
            >
              <option>Forensic Analyst</option>
              <option>Systems Architect</option>
              <option>Rogue Logic</option>
            </select>
          </div>
          <div className="lg:col-span-2 space-y-2">
            <label className="text-[10px] text-zinc-500 uppercase font-bold">Origin Trauma / Lore Seed</label>
            <textarea 
              value={formData.trauma}
              onChange={(e) => setFormData({...formData, trauma: e.target.value})}
              className="w-full bg-black border border-zinc-800 p-4 rounded text-sm focus:border-[#00ffcc] outline-none h-24" 
              placeholder="The reason they audit the machine..." 
            />
          </div>
        </div>
        <button 
          onClick={handleCommit}
          disabled={isSaving || !formData.name}
          className="mt-8 w-full bg-[#00ffcc] text-black font-black py-5 rounded uppercase tracking-tighter hover:bg-white transition-all shadow-[0_0_20px_rgba(0,255,204,0.2)] disabled:opacity-50"
        >
          {isSaving ? "Vaulting Identity..." : "Commit Identity to Vault"}
        </button>
      </div>

      <div className="bg-zinc-900/20 border border-zinc-800 p-6 rounded-xl h-fit">
        <h2 className="text-xs font-bold uppercase mb-6 flex items-center gap-2 text-zinc-400">
          <Database size={14} /> Identity_Vault
        </h2>
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          {loading ? (
            <div className="text-[10px] text-zinc-700 animate-pulse uppercase text-center py-8 italic tracking-widest">Syncing with Node...</div>
          ) : (
            personas.map((p, i) => (
              <div key={i} className="p-4 border border-zinc-800 bg-black/40 rounded hover:border-[#00ffcc]/40 transition-all cursor-pointer group">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-bold uppercase group-hover:text-[#00ffcc]">{p.name}</span>
                  <span className="text-[8px] px-2 py-0.5 border border-zinc-800 rounded text-zinc-500">{p.role}</span>
                </div>
                <div className="text-[10px] text-zinc-600 uppercase tracking-widest">{p.voiceId || 'Kore'}_Link_Active</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// --- SUB-COMPONENT: SEASON ARCHITECT ---
const SeasonPanel = () => {
  const [topic, setTopic] = useState('');
  const [season, setSeason] = useState(null);
  const [isReconciling, setIsReconciling] = useState(false);

  const handleReconcile = async () => {
    if (!topic) return;
    setIsReconciling(true);
    try {
      const res = await fetch(`${API_BASE}/season/reconcile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, episodes: 10 })
      });
      const data = await res.json();
      setSeason(data);
    } finally {
      setIsReconciling(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in fade-in slide-in-from-bottom-4">
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
            <button 
              onClick={handleReconcile}
              disabled={isReconciling || !topic}
              className="w-full py-5 bg-[#00ffcc] text-black font-black rounded uppercase text-xs hover:shadow-[0_0_30px_rgba(0,255,204,0.3)] transition-all disabled:opacity-50"
            >
              {isReconciling ? "Generating Arc..." : "Reconcile_Audit_Arc"}
            </button>
          </div>
        </div>
      </div>

      <div className="lg:col-span-8 bg-black/40 border border-zinc-800 rounded-xl overflow-hidden min-h-[400px]">
        <div className="p-6 bg-zinc-900/20 border-b border-zinc-800 flex justify-between items-center">
          <h2 className="text-xs font-bold uppercase flex items-center gap-2"><Calendar size={14} /> Sequence_Timeline</h2>
          <span className="text-[9px] text-zinc-600 uppercase tracking-widest">{season ? `ID: ${season.season_id}` : 'Awaiting Input'}</span>
        </div>
        <div className="divide-y divide-zinc-900">
          {!season ? (
            <div className="p-20 text-center text-zinc-800 text-xs italic">Awaiting macro_seed reconstruction...</div>
          ) : (
            season.timeline.map((ep, i) => (
              <div key={i} className="p-6 flex items-center justify-between hover:bg-zinc-900/20 transition-colors">
                <div className="flex gap-6 items-center">
                  <span className="text-[10px] font-bold text-zinc-700">{ep.episode_id}</span>
                  <div>
                    <div className="text-xs font-bold uppercase mb-1">{ep.theme}</div>
                    <div className="text-[9px] text-zinc-500 uppercase tracking-tighter">Status: {ep.status}</div>
                  </div>
                </div>
                <div className="flex gap-1">
                  {[1,2,3].map(a => <div key={a} className={`h-1 w-6 rounded-full ${a === ep.act ? 'bg-[#00ffcc]' : 'bg-zinc-800'}`} />)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// --- SUB-COMPONENT: SOURCE INJECTOR ---
const SourcePanel = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4">
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
              <span className="text-[8px] uppercase text-zinc-500 font-bold">Node Pulse: Live</span>
            </div>
            <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-tighter tracking-widest">Connected</div>
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
              <Cpu size={12} /> Local Node: Active
            </div>
          </div>
        </header>

        {activeTab === 'persona' && <PersonaPanel />}
        {activeTab === 'season' && <SeasonPanel />}
        {activeTab === 'source' && <SourcePanel />}
        
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
