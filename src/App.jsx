import React, { useState, useEffect, useRef } from 'react';
import { Zap, Activity, Code, Cpu, Layers, Fingerprint, Trash2, Plus, PlayCircle, UserPlus, Database, Quote, X, Dice5, ShieldCheck } from 'lucide-react';

const API_BASE = "https://shadow-cassandrafiles.pythonanywhere.com/api/v2";

const App = () => {
  const [activeTab, setActiveTab] = useState('season');
  const [seasons, setSeasons] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [activeItem, setActiveItem] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [liveStatus, setLiveStatus] = useState({ stage: 'IDLE', last_event: 'Ready', history: [], active_engine: '...', request_payload: '{}', response_payload: '{}' });
  
  const [newS, setNewS] = useState({ topic: '', relationship: 'Unresolved Strategic Tension (UST)', host_ids: [], episodes_count: 10 });
  const [newP, setNewP] = useState({ name: '', role: 'Victim Advocate / Tech Cynic', trauma: '' });

  const logEndRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/status`);
        const data = await res.json();
        setLiveStatus(data);
        if (data.stage === 'SUCCESS' && !loading) refreshData();
      } catch (e) {}
    }, 1500);
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => { refreshData(); }, []);
  useEffect(() => { logEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [liveStatus.history]);

  const refreshData = async () => {
    const sRes = await fetch(`${API_BASE}/season/list`);
    setSeasons(await sRes.json() || []);
    const pRes = await fetch(`${API_BASE}/persona/list`);
    setPersonas(await pRes.json() || []);
  };

  const handleCreatePersona = async () => {
    if (!newP.name) return;
    setLoading(true);
    await fetch(`${API_BASE}/persona/create`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(newP) });
    refreshData();
    setNewP({ name: '', role: 'Victim Advocate / Tech Cynic', trauma: '' });
    setLoading(false);
  };

  const handleCreateSeason = async () => {
    if (!newS.topic || newS.host_ids.length !== 2) return;
    setLoading(true);
    await fetch(`${API_BASE}/season/reconcile`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(newS) });
    refreshData();
    setNewS({ topic: '', relationship: 'Unresolved Strategic Tension (UST)', host_ids: [], episodes_count: 10 });
    setLoading(false);
  };

  return (
    <div className="h-screen w-screen bg-[#141619] text-slate-300 font-mono flex overflow-hidden">
      
      {/* PANE 1: TELEMETRY (LEFT) */}
      <section className="w-[450px] border-r border-slate-800 bg-[#0b0c0e] flex flex-col p-6 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
            <div className="text-teal-400 font-black uppercase text-[10px] tracking-[0.4em] flex items-center gap-2">
                <ShieldCheck size={14} className={loading ? "animate-pulse text-amber-500" : ""} /> Kernel_v24.6
            </div>
            <div className="text-[8px] text-slate-600 font-bold uppercase tracking-widest">{liveStatus.active_engine?.split('/')[1]}</div>
        </div>

        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
            <div className="p-4 bg-black/40 border border-slate-800 rounded">
                <p className="text-teal-500 text-[9px] font-black uppercase mb-4">System_Memory</p>
                <div className="h-48 overflow-y-auto space-y-1 pr-2 custom-scrollbar text-[10px]">
                    {liveStatus.history.map((log, i) => (
                        <div key={i} className={`border-l pl-3 py-1 font-bold ${log.includes('SUCCESS') ? 'text-teal-400 border-teal-400' : 'text-slate-600 border-slate-800'}`}>{log}</div>
                    ))}
                    <div ref={logEndRef} />
                </div>
            </div>
            <div className="flex-1 flex flex-col min-h-0">
                <pre className="text-[9px] text-slate-500 bg-black/60 p-4 rounded mb-4 overflow-auto border border-slate-800 flex-1 whitespace-pre-wrap">IN: {liveStatus.request_payload}</pre>
                <pre className="text-[9px] text-teal-600/40 bg-black/60 p-4 rounded overflow-auto border border-slate-800 flex-1 italic whitespace-pre-wrap font-sans">OUT: {liveStatus.response_payload}</pre>
            </div>
        </div>
      </section>

      {/* PANE 2: WORKSPACE (CENTER) */}
      <section className="flex-1 flex flex-col bg-[#1a1c1e] p-10 overflow-y-auto border-r border-slate-800">
        <div className="flex gap-4 mb-10 border-b border-slate-800 pb-6">
            <button onClick={() => { setActiveTab('season'); setActiveItem(null); }} className={`px-10 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'season' && !activeItem ? 'bg-teal-500 text-black shadow-lg shadow-teal-500/20' : 'bg-slate-800 text-slate-500 hover:text-white'}`}>Seasons</button>
            <button onClick={() => { setActiveTab('persona'); setActiveItem(null); }} className={`px-10 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'persona' && !activeItem ? 'bg-teal-500 text-black shadow-lg shadow-teal-500/20' : 'bg-slate-800 text-slate-500 hover:text-white'}`}>DNA_Vault</button>
        </div>

        {!activeItem && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-500">
              {activeTab === 'season' && seasons.map((s, i) => (
                  <div key={i} className="bg-[#23262a] border border-slate-700 p-8 rounded-lg shadow-xl hover:border-teal-500/40 transition-all cursor-pointer relative" onClick={() => setActiveItem(s)}>
                      <button onClick={(e) => { e.stopPropagation(); fetch(`${API_BASE}/season/delete/${s.id}`, {method:'DELETE'}); refreshData(); }} className="absolute top-6 right-6 text-slate-700 hover:text-red-500 transition-all"><Trash2 size={18}/></button>
                      <h4 className="text-white font-black uppercase text-base mb-2 tracking-tighter">{s.title}</h4>
                      <p className="text-[10px] text-slate-500 italic uppercase mb-8">{s.relationship}</p>
                      <div className="w-full py-3 bg-slate-800 text-teal-400 text-[10px] font-black uppercase flex items-center justify-center gap-3 border border-slate-700 font-mono italic">Audit_Blueprints</div>
                  </div>
              ))}
              {activeTab === 'persona' && personas.map((p, i) => (
                  <div key={i} className="bg-[#23262a] border border-slate-700 p-8 rounded-lg shadow-xl hover:border-teal-500/40 transition-all cursor-pointer relative" onClick={() => setActiveItem(p)}>
                      <button onClick={(e) => { e.stopPropagation(); fetch(`${API_BASE}/persona/delete/${p.id}`, {method:'DELETE'}); refreshData(); }} className="absolute top-6 right-6 text-slate-700 hover:text-red-500 transition-all"><Trash2 size={18}/></button>
                      <h4 className="text-white font-black uppercase text-base mb-1 tracking-tighter">{p.name}</h4>
                      <p className="text-[10px] text-teal-500/60 uppercase mb-4 font-bold tracking-widest">{p.role}</p>
                      <p className="text-[9px] text-slate-600 border-t border-slate-800 pt-4 italic truncate">{p.trauma}</p>
                  </div>
              ))}
          </div>
        )}

        {activeItem && (
            <div className="animate-in fade-in slide-in-from-bottom-4 space-y-12">
                <div className="flex justify-between items-end border-b border-slate-800 pb-8">
                    <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter">{activeItem.title || activeItem.name}</h2>
                    <button onClick={() => setActiveItem(null)} className="bg-teal-500 text-black px-8 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-xl shadow-teal-500/20">Return_to_Archive</button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 text-[12px] leading-relaxed">
                    <div className="bg-black/20 p-8 border border-slate-800 rounded-lg">
                        <h4 className="text-teal-500 text-[10px] font-black uppercase mb-6 tracking-widest italic underline underline-offset-8 decoration-slate-800">{activeTab === 'season' ? 'Shared_Lore' : 'Full_Dossier'}</h4>
                        <div className="space-y-6">
                            {activeTab === 'season' 
                                ? activeItem.shared_lore?.map((l, i) => <p key={i} className="text-amber-200/80 uppercase font-mono italic border-l border-amber-900/40 pl-4 leading-loose">"{l}"</p>)
                                : <p className="text-slate-400 font-sans whitespace-pre-wrap">{activeItem.archive?.bio}</p>
                            }
                        </div>
                    </div>
                    <div className="bg-black/20 p-8 border border-slate-800 rounded-lg">
                        <h4 className="text-teal-500 text-[10px] font-black uppercase mb-6 tracking-widest italic underline underline-offset-8 decoration-slate-800">{activeTab === 'season' ? '3-Act_Nodes' : 'DNA_Anecdotes'}</h4>
                        <div className="space-y-3 h-[500px] overflow-y-auto pr-4 custom-scrollbar">
                            {activeTab === 'season'
                                ? activeItem.episodes?.map((ep, idx) => <div key={idx} className="p-4 bg-[#23262a] border border-slate-700 flex flex-col"><span className="text-[8px] text-teal-500 font-black mb-1 uppercase tracking-tighter">ACT {ep.act}</span><span className="text-white font-bold uppercase">{ep.title}</span><span className="text-[9px] text-slate-500 italic uppercase mt-1">{ep.sub_topic}</span></div>)
                                : activeItem.archive?.anecdotes?.map((a, i) => <p key={i} className="p-4 bg-[#23262a] border border-slate-700 text-slate-400 italic font-mono uppercase text-[11px]">"{a}"</p>)
                            }
                        </div>
                    </div>
                </div>
            </div>
        )}
      </section>

      {/* PANE 3: COMMAND COMMAND CENTER (RIGHT) */}
      <section className="w-[480px] bg-[#141619] p-10 flex flex-col gap-12 overflow-y-auto border-l border-slate-800">
        
        {/* SPAWN PERSONA */}
        <div className="space-y-6 bg-black/20 p-8 rounded-2xl border border-slate-800">
            <h3 className="text-teal-400 text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-3"><UserPlus size={16}/> Spawn_Identity</h3>
            <div className="space-y-4">
                <input className="w-full bg-[#1a1c1e] p-4 border border-slate-800 text-[12px] text-white font-bold outline-none focus:border-teal-500 transition-all placeholder-slate-800" placeholder="NAME" value={newP.name} onChange={(e) => setNewP({...newP, name: e.target.value})} />
                <div className="relative">
                   <input className="w-full bg-[#1a1c1e] p-4 border border-slate-800 text-[12px] text-slate-500 pr-12 outline-none uppercase placeholder-slate-800" placeholder="ROOT_TRAUMA (OPTIONAL)" value={newP.trauma} onChange={(e) => setNewP({...newP, trauma: e.target.value})} />
                   <button onClick={() => setNewP({...newP, trauma: randomChoice(TRAUMA_DEFAULTS)})} className="absolute right-4 top-4 text-slate-600 hover:text-teal-400 transition-all"><Dice5 size={18}/></button>
                </div>
                <button onClick={handleCreatePersona} disabled={loading || !newP.name} className={`w-full py-4 text-[10px] font-black uppercase tracking-widest transition-all rounded shadow-xl ${loading || !newP.name ? 'bg-slate-900 text-slate-800 border border-slate-800 cursor-not-allowed' : 'bg-teal-500 text-black hover:bg-white'}`}>Commit_DNA</button>
            </div>
        </div>

        {/* ESTABLISH ARC */}
        <div className="space-y-6 bg-black/20 p-8 rounded-2xl border border-slate-800">
            <h3 className="text-teal-400 text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-3"><Database size={16}/> Establish_Arc</h3>
            <div className="space-y-8">
                <input className="w-full bg-[#1a1c1e] p-4 border border-slate-800 text-[12px] text-white font-bold outline-none focus:border-teal-500 transition-all uppercase placeholder-slate-800" placeholder="TOPIC_STRING" value={newS.topic} onChange={(e) => setNewS({...newS, topic: e.target.value})} />
                
                <div className="space-y-3">
                    <p className="text-slate-600 text-[9px] font-black uppercase tracking-widest flex justify-between">Archive_Pairing <span>{newS.host_ids.length}/2</span></p>
                    <div className="grid grid-cols-2 gap-2">
                        {personas.map(p => (
                            <button key={p.id} onClick={() => {
                                const ids = newS.host_ids.includes(p.id) ? newS.host_ids.filter(id => id !== p.id) : [...newS.host_ids, p.id];
                                setNewS({...newS, host_ids: ids.slice(0, 2)});
                            }} className={`p-4 text-[9px] font-black uppercase border transition-all rounded ${newS.host_ids.includes(p.id) ? 'border-teal-500 bg-teal-500/10 text-teal-400' : 'border-slate-800 text-slate-600 hover:text-slate-400'}`}>
                                {p.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-3">
                    <p className="text-slate-600 text-[9px] font-black uppercase tracking-widest italic">Node_Length: {newS.episodes_count}</p>
                    <input type="range" min="4" max="24" step="2" className="w-full accent-teal-500" value={newS.episodes_count} onChange={(e) => setNewS({...newS, episodes_count: e.target.value})} />
                </div>

                <button 
                    onClick={handleCreateSeason} 
                    disabled={loading || !newS.topic || newS.host_ids.length !== 2} 
                    className={`w-full py-6 text-[11px] font-black uppercase tracking-widest transition-all rounded shadow-2xl ${loading || !newS.topic || newS.host_ids.length !== 2 ? 'bg-slate-900 text-slate-800 border border-slate-800 cursor-not-allowed' : 'bg-teal-500 text-black hover:bg-white'}`}
                >
                    Establish_Signal
                </button>
            </div>
        </div>
      </section>
    </div>
  );
};

// Helper for UI randomizer
const TRAUMA_DEFAULTS = [
    "Witnessed the 2024 San Jose server farm bleed-out.",
    "Exposed a high-level data laundering scheme in the DMV.",
    "Lost a deep-cover source to a zero-day exploit in 2025.",
    "Accidentally flagged a federal witness as a domestic threat.",
    "Spent 6 months in a dark-site for 'unauthorized decryption'."
];
const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];

export default App;
