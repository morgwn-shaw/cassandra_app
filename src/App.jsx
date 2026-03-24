import React, { useState, useEffect, useRef } from 'react';
import { Zap, Activity, Code, Cpu, Layers, Fingerprint, Trash2, Plus, PlayCircle, UserPlus, Database, Quote, X, ShieldCheck, Send, Brain, Dice5, Eye, Terminal } from 'lucide-react';

// --- CONFIGURATION: DECLARED ONCE AT ROOT ---
const API_BASE = "https://shadow-cassandrafiles.pythonanywhere.com/api/v2";
const GENDER_OPTIONS = ["Male", "Female", "Non-Binary", "Gender-Fluid", "Agender", "Random"];
const RELATIONSHIP_OPTIONS = ["Unresolved Sexual Tension (UST)", "UST - High Friction", "Grudging Mutual Respect", "Mentor / Protégé", "Bitter Rivals"];
const TRAUMA_OPTIONS = ["Witnessed a server farm bleed-out.", "Neural-link betrayal.", "Identity stolen.", "Escaped digital cult.", "Domestic threat flag."];

const App = () => {
  // UI State
  const [viewMode, setViewMode] = useState('god'); 
  const [activeTab, setActiveTab] = useState('season');
  const [seasons, setSeasons] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [activeItem, setActiveItem] = useState(null); 
  const [activeBrief, setActiveBrief] = useState(null);
  const [loading, setLoading] = useState(false);
  const [liveStatus, setLiveStatus] = useState({ stage: 'IDLE', history: [], response_payload: '{}' });
  
  // Forms
  const [newS, setNewS] = useState({ topic: '', relationship: RELATIONSHIP_OPTIONS[0], host_ids: [], episodes_count: 10 });
  const [newP, setNewP] = useState({ name: '', role: 'Analyst', trauma: '', gender: 'Random' });

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
    try {
      const sRes = await fetch(`${API_BASE}/season/list`);
      const sData = await sRes.json();
      setSeasons(Array.isArray(sData) ? sData : []);
      const pRes = await fetch(`${API_BASE}/persona/list`);
      const pData = await pRes.json();
      setPersonas(Array.isArray(pData) ? pData : []);
    } catch(e) {}
  };

  const spawnPersona = async () => {
    if (!newP.name) return;
    setLoading(true);
    await fetch(`${API_BASE}/persona/create`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(newP) });
    refreshData();
    setNewP({ name: '', role: 'Analyst', trauma: '', gender: 'Random' });
    setLoading(false);
  };

  const establishArc = async () => {
    if (!newS.topic || newS.host_ids.length !== 2) return;
    setLoading(true);
    await fetch(`${API_BASE}/season/reconcile`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(newS) });
    refreshData();
    setLoading(false);
  };

  const generateBrief = async (seasonId, idx) => {
    setActiveBrief(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/showrunner/brief`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ season_id: seasonId, node_index: idx }) });
      const data = await res.json();
      setActiveBrief(data);
    } finally { setLoading(false); }
  };

  const renderBrief = () => {
    if (!activeBrief) return <div className="h-40 flex items-center justify-center border border-dashed border-slate-800 rounded text-slate-700 text-[10px] font-black uppercase">Initialize_Node</div>;
    const items = activeBrief.acts || Object.entries(activeBrief);
    return items.map((item, i) => {
      const isAct = !Array.isArray(item);
      const title = isAct ? `ACT ${item.act_number}` : item[0].replace(/_/g, ' ');
      const content = isAct ? item.summary : item[1];
      return (
        <div key={i} className="border-l-2 border-teal-500/30 pl-4 py-3 mb-6 bg-black/20 rounded-r">
            <span className="text-[8px] text-teal-400 font-black uppercase mb-1 block">{title}</span>
            <p className="text-[11px] text-slate-400 font-sans italic leading-relaxed uppercase">"{typeof content === 'string' ? content : JSON.stringify(content)}"</p>
        </div>
      );
    });
  };

  return (
    <div className={`h-screen w-screen font-mono flex overflow-hidden ${viewMode === 'god' ? 'bg-[#0d0f11]' : 'bg-[#1a1c1e]'}`}>
      
      {/* LEFT PANE: TELEMETRY */}
      {viewMode === 'god' && (
        <section className="w-[420px] border-r border-slate-800 bg-[#08090a] flex flex-col p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
                <div className="text-teal-400 font-black uppercase text-[10px] tracking-[0.4em] flex items-center gap-2">
                    <Zap size={14} className={loading ? "animate-pulse" : ""} /> Kernel_v27.1
                </div>
            </div>
            <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                <div className="p-4 bg-black/40 border border-slate-800 rounded flex-1 overflow-hidden flex flex-col">
                    <p className="text-teal-500 text-[9px] font-black uppercase mb-4">Memory_Log</p>
                    <div className="flex-1 overflow-y-auto space-y-1 text-[10px]">
                        {(liveStatus.history || []).map((log, i) => (
                            <div key={i} className="border-l border-slate-800 pl-3 py-1 font-bold text-slate-600">{log}</div>
                        ))}
                        <div ref={logEndRef} />
                    </div>
                </div>
                <pre className="h-32 text-[9px] text-teal-600/40 bg-black/60 p-4 rounded border border-slate-800 overflow-auto">OUT: {liveStatus.response_payload}</pre>
            </div>
        </section>
      )}

      {/* CENTER PANE: WORKSPACE */}
      <section className="flex-1 flex flex-col p-10 overflow-y-auto relative bg-[#121416]">
        <div className="absolute top-10 right-10 flex border border-slate-800 rounded overflow-hidden z-50">
            <button onClick={() => setViewMode('god')} className={`px-4 py-2 text-[9px] font-black ${viewMode === 'god' ? 'bg-teal-500 text-black' : 'bg-slate-900'}`}>FORENSIC</button>
            <button onClick={() => setViewMode('user')} className={`px-4 py-2 text-[9px] font-black ${viewMode === 'user' ? 'bg-teal-500 text-black' : 'bg-slate-900'}`}>SIMULATION</button>
        </div>

        <div className="flex gap-4 mb-10 border-b border-slate-800 pb-6">
            <button onClick={() => { setActiveTab('season'); setActiveItem(null); }} className={`px-10 py-3 text-[10px] font-black transition-all ${activeTab === 'season' && !activeItem ? 'bg-teal-500 text-black' : 'bg-slate-800'}`}>SEASONS</button>
            <button onClick={() => { setActiveTab('persona'); setActiveItem(null); }} className={`px-10 py-3 text-[10px] font-black transition-all ${activeTab === 'persona' && !activeItem ? 'bg-teal-500 text-black' : 'bg-slate-800'}`}>DNA_VAULT</button>
        </div>

        {!activeItem && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in">
              {(activeTab === 'season' ? seasons : personas).map((item, i) => (
                  <div key={i} className="bg-[#1c1f23] border border-slate-800 p-8 rounded-lg cursor-pointer relative group" onClick={() => setActiveItem(item)}>
                      {viewMode === 'god' && <button onClick={(e) => { e.stopPropagation(); fetch(`${API_BASE}/${activeTab}/delete/${item.id}`, {method:'DELETE'}); refreshData(); }} className="absolute top-4 right-4 text-slate-700 hover:text-red-500"><Trash2 size={16}/></button>}
                      <div className="flex gap-4 items-center">
                        {item.portrait && <img src={item.portrait} className="w-12 h-12 rounded border border-slate-800 grayscale" alt="P" />}
                        <div>
                            <h4 className="text-white font-black uppercase text-base">{item.title || item.name}</h4>
                            <p className="text-[10px] text-teal-500">{item.relationship || item.role}</p>
                        </div>
                      </div>
                  </div>
              ))}
          </div>
        )}

        {/* DETAIL: SEASON */}
        {activeItem && activeTab === 'season' && (
            <div className="space-y-12 animate-in fade-in">
                <div className="flex justify-between items-end border-b border-slate-800 pb-8">
                    <h2 className="text-5xl font-black text-white italic">{activeItem.title}</h2>
                    <button onClick={() => setActiveItem(null)} className="bg-teal-500 text-black px-8 py-3 text-[10px] font-black">RETURN</button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="space-y-4 bg-black/20 p-8 rounded-xl border border-slate-800">
                        <h4 className="text-teal-500 text-[10px] font-black uppercase">Nodes</h4>
                        {(activeItem.episodes || []).map((ep, idx) => (
                            <div key={idx} className="p-4 bg-[#1c1f23] border border-slate-800 flex justify-between items-center group">
                                <span className="text-white font-bold text-[11px]">{ep.title}</span>
                                <button onClick={() => generateBrief(activeItem.id, idx)} className="px-4 py-2 bg-slate-800 text-teal-400 text-[8px] font-black border border-slate-700 hover:bg-teal-500 hover:text-black transition-all">RUN_BRIEF</button>
                            </div>
                        ))}
                    </div>
                    <div className="space-y-4 bg-black/20 p-8 rounded-xl border border-slate-800 h-[600px] overflow-y-auto custom-scrollbar">
                        <h4 className="text-teal-500 text-[10px] font-black uppercase">Brief_Output</h4>
                        {renderBrief()}
                    </div>
                </div>
            </div>
        )}

        {/* DETAIL: PERSONA */}
        {activeItem && activeTab === 'persona' && (
            <div className="space-y-12 animate-in fade-in">
                <div className="flex justify-between items-end border-b border-slate-800 pb-8">
                    <div className="flex gap-6 items-center">
                        {activeItem.portrait && <img src={activeItem.portrait} className="w-24 h-24 rounded border border-slate-700 shadow-2xl" alt="DNA" />}
                        <h2 className="text-6xl font-black text-white uppercase italic">{activeItem.name}</h2>
                    </div>
                    <button onClick={() => setActiveItem(null)} className="bg-teal-500 text-black px-8 py-3 text-[10px] font-black">RETURN</button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 h-[600px]">
                    <div className="bg-black/20 p-10 border border-slate-800 rounded-xl overflow-y-auto">
                        <h4 className="text-teal-500 text-[10px] font-black uppercase mb-4 tracking-widest border-b border-slate-800 pb-2">Dossier</h4>
                        <p className="text-[13px] text-slate-400 leading-relaxed whitespace-pre-wrap">{activeItem.archive?.bio}</p>
                    </div>
                    <div className="bg-black/20 p-10 border border-slate-800 rounded-xl overflow-y-auto">
                        <h4 className="text-teal-500 text-[10px] font-black uppercase mb-4 tracking-widest border-b border-slate-800 pb-2">DNA_Memories</h4>
                        {(activeItem.archive?.anecdotes || []).map((a, i) => (
                           <p key={i} className="p-4 bg-[#1c1f23] border border-slate-800 text-[11px] text-slate-500 italic mb-2 uppercase leading-relaxed">"{a}"</p>
                        ))}
                    </div>
                </div>
            </div>
        )}
      </section>

      {/* RIGHT PANE: COMMAND */}
      {viewMode === 'god' && (
        <section className="w-[480px] bg-[#0b0c0e] p-10 flex flex-col gap-12 overflow-y-auto border-l border-slate-800 shadow-2xl">
            <div className="space-y-6 bg-black/30 p-8 rounded-2xl border border-slate-800">
                <h3 className="text-teal-400 text-[11px] font-black uppercase flex items-center gap-3"><UserPlus size={16}/> Identity_Spawn</h3>
                <div className="space-y-4">
                    <input className="w-full bg-[#1c1f23] p-4 border border-slate-800 text-[12px] text-white font-bold outline-none" placeholder="NAME" value={newP.name} onChange={(e) => setNewP({...newP, name: e.target.value})} />
                    <div className="grid grid-cols-2 gap-2">
                        <select className="bg-[#1c1f23] p-4 border border-slate-800 text-[11px] text-teal-500 font-black outline-none" value={newP.gender} onChange={(e) => setNewP({...newP, gender: e.target.value})}>
                            {GENDER_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                        <input className="bg-[#1c1f23] p-4 border border-slate-800 text-[11px] text-slate-500 outline-none" placeholder="ROLE" value={newP.role} onChange={(e) => setNewP({...newP, role: e.target.value})} />
                    </div>
                    <div className="relative">
                        <input className="w-full bg-[#1c1f23] p-4 border border-slate-800 text-[11px] text-slate-500 outline-none uppercase pr-12" placeholder="TRAUMA" value={newP.trauma} onChange={(e) => setNewP({...newP, trauma: e.target.value})} />
                        <button onClick={() => setNewP({...newP, trauma: TRAUMA_OPTIONS[Math.floor(Math.random() * TRAUMA_OPTIONS.length)]})} className="absolute right-4 top-3.5 text-slate-700 hover:text-teal-500 transition-all"><Dice5 size={20}/></button>
                    </div>
                    <button onClick={spawnPersona} disabled={loading || !newP.name} className="w-full py-4 bg-teal-500 text-black text-[10px] font-black uppercase tracking-widest rounded shadow-xl disabled:opacity-20">COMMIT_DNA</button>
                </div>
            </div>

            <div className="space-y-6 bg-black/30 p-8 rounded-2xl border border-slate-800">
                <h3 className="text-teal-400 text-[11px] font-black uppercase flex items-center gap-3"><Database size={16}/> Establish_Season</h3>
                <div className="space-y-8">
                    <input className="w-full bg-[#1c1f23] p-4 border border-slate-800 text-[12px] text-white font-bold outline-none uppercase" placeholder="TOPIC_STRING" value={newS.topic} onChange={(e) => setNewS({...newS, topic: e.target.value})} />
                    <div className="grid grid-cols-2 gap-2">
                        {personas.map(p => (
                            <button key={p.id} onClick={() => {
                                const ids = newS.host_ids.includes(p.id) ? newS.host_ids.filter(id => id !== p.id) : [...newS.host_ids, p.id];
                                setNewS({...newS, host_ids: ids.slice(0, 2)});
                            }} className={`p-4 text-[9px] font-black uppercase border rounded transition-all ${newS.host_ids.includes(p.id) ? 'border-teal-500 bg-teal-500/10 text-teal-400' : 'border-slate-800 text-slate-600'}`}>
                                {p.name}
                            </button>
                        ))}
                    </div>
                    <select className="w-full bg-[#1c1f23] p-4 border border-slate-800 text-[11px] text-teal-400 font-bold" value={newS.relationship} onChange={(e) => setNewS({...newS, relationship: e.target.value})}>
                        {RELATIONSHIP_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <button onClick={establishArc} disabled={loading || !newS.topic || newS.host_ids.length !== 2} className="w-full py-6 text-[11px] font-black bg-teal-500 text-black rounded uppercase shadow-2xl disabled:opacity-20">ESTABLISH_SIGNAL</button>
                </div>
            </div>
        </section>
      )}
    </div>
  );
};

export default App;
