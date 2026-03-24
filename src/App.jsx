import React, { useState, useEffect, useRef } from 'react';
import { Zap, Activity, Code, Cpu, Layers, Fingerprint, Trash2, Plus, PlayCircle, UserPlus, Database, Quote, X, ShieldCheck, Send, Brain, Dice5, Eye, Terminal } from 'lucide-react';

const API_BASE = "https://shadow-cassandrafiles.pythonanywhere.com/api/v2";

// CONFIG (No Duplicates)
const GENDERS = ["Male", "Female", "Non-Binary", "Gender-Fluid", "Agender", "Random"];
const DYNAMICS = ["Unresolved Sexual Tension (UST)", "UST - High Friction", "UST - Professional Denial", "Grudging Mutual Respect", "Mentor / Protégé", "Bitter Rivals"];
const TRAUMAS = ["Witnessed a server farm bleed-out.", "Neural-link mentor betrayal.", "Exposed a high-level data laundering ring.", "Escaped a digital cult.", "Wrongly flagged as a domestic threat."];

const App = () => {
  const [viewMode, setViewMode] = useState('god'); // 'god' or 'user'
  const [activeTab, setActiveTab] = useState('season');
  const [seasons, setSeasons] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [activeItem, setActiveItem] = useState(null); 
  const [activeBrief, setActiveBrief] = useState(null);
  const [loading, setLoading] = useState(false);
  const [liveStatus, setLiveStatus] = useState({ stage: 'IDLE', history: [], response_payload: '{}' });
  
  const [newS, setNewS] = useState({ topic: '', relationship: DYNAMICS[0], host_ids: [], episodes_count: 10 });
  const [newP, setNewP] = useState({ name: '', role: 'Forensic Investigator', trauma: '', gender: 'Random' });

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
      setSeasons(await sRes.json() || []);
      const pRes = await fetch(`${API_BASE}/persona/list`);
      setPersonas(await pRes.json() || []);
    } catch(e) {}
  };

  const spawnPersona = async () => {
    if (!newP.name) return;
    setLoading(true);
    await fetch(`${API_BASE}/persona/create`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(newP) });
    refreshData();
    setNewP({ name: '', role: 'Forensic Investigator', trauma: '', gender: 'Random' });
    setLoading(false);
  };

  const generateBrief = async (seasonId, idx) => {
    setActiveBrief(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/showrunner/brief`, { 
        method: 'POST', headers: {'Content-Type': 'application/json'}, 
        body: JSON.stringify({ season_id: seasonId, node_index: idx }) 
      });
      setActiveBrief(await res.json());
    } finally { setLoading(false); }
  };

  const renderBrief = () => {
    if (!activeBrief) return <div className="h-64 flex items-center justify-center border border-dashed border-slate-800 rounded text-slate-700 text-[10px] font-black uppercase">Initialize_Node</div>;
    
    // Safety handle for different JSON structures (Acts list or Object)
    const data = activeBrief.acts || Object.entries(activeBrief);
    
    return data.map((item, i) => {
      const isList = !Array.isArray(item);
      const title = isList ? `ACT ${item.act_number} // ${item.type}` : item[0].replace(/_/g, ' ');
      const content = isList ? item.summary : item[1];
      
      return (
        <div key={i} className="border-l-2 border-teal-500/30 pl-6 py-4 mb-6 bg-black/30 rounded-r shadow-lg">
            <span className="text-[9px] text-teal-400 font-black uppercase mb-2 block tracking-widest">{title}</span>
            <p className="text-[12px] text-slate-400 font-sans italic leading-relaxed uppercase">"{typeof content === 'string' ? content : JSON.stringify(content)}"</p>
        </div>
      );
    });
  };

  return (
    <div className={`h-screen w-screen font-mono flex overflow-hidden ${viewMode === 'god' ? 'bg-[#0d0f11]' : 'bg-[#1a1c1e]'}`}>
      
      {/* PANE 1: TELEMETRY (Hidden in User Mode) */}
      {viewMode === 'god' && (
        <section className="w-[420px] border-r border-slate-800 bg-[#08090a] flex flex-col p-6 shadow-2xl overflow-hidden animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
                <div className="text-teal-400 font-black uppercase text-[10px] tracking-[0.4em] flex items-center gap-2">
                    <Zap size={14} className={loading ? "animate-pulse text-amber-500" : ""} /> Kernel_v27.5
                </div>
            </div>
            <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                <div className="p-4 bg-black/40 border border-slate-800 rounded flex flex-col min-h-[250px]">
                    <p className="text-teal-500 text-[9px] font-black uppercase mb-4">Live_Log</p>
                    <div className="flex-1 overflow-y-auto space-y-1 text-[10px] custom-scrollbar">
                        {(liveStatus.history || []).map((log, i) => (
                            <div key={i} className={`border-l pl-3 py-1 font-bold ${log.includes('SUCCESS') ? 'text-teal-400 border-teal-400' : 'text-slate-600 border-slate-800'}`}>{log}</div>
                        ))}
                        <div ref={logEndRef} />
                    </div>
                </div>
                <pre className="text-[9px] text-teal-600/40 bg-black/60 p-4 rounded border border-slate-800 flex-1 overflow-auto whitespace-pre-wrap leading-tight italic">OUT: {liveStatus.response_payload}</pre>
            </div>
        </section>
      )}

      {/* PANE 2: WORKSPACE (CENTER) */}
      <section className="flex-1 flex flex-col p-10 overflow-y-auto relative bg-[#121416]">
        
        {/* MODE TOGGLE */}
        <div className="absolute top-10 right-10 flex border border-slate-800 rounded overflow-hidden shadow-2xl z-50">
            <button onClick={() => setViewMode('god')} className={`px-4 py-2 text-[9px] font-black uppercase flex items-center gap-2 ${viewMode === 'god' ? 'bg-teal-500 text-black' : 'bg-slate-900 text-slate-500'}`}><Terminal size={12}/> Forensic</button>
            <button onClick={() => setViewMode('user')} className={`px-4 py-2 text-[9px] font-black uppercase flex items-center gap-2 ${viewMode === 'user' ? 'bg-teal-500 text-black' : 'bg-slate-900 text-slate-500'}`}><Eye size={12}/> Simulation</button>
        </div>

        <div className="flex gap-4 mb-10 border-b border-slate-800 pb-6">
            <button onClick={() => { setActiveTab('season'); setActiveItem(null); setActiveBrief(null); }} className={`px-10 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'season' && !activeItem ? 'bg-teal-500 text-black shadow-lg shadow-teal-500/20' : 'bg-slate-800 text-slate-500'}`}>Seasons</button>
            <button onClick={() => { setActiveTab('persona'); setActiveItem(null); setActiveBrief(null); }} className={`px-10 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'persona' && !activeItem ? 'bg-teal-500 text-black shadow-lg shadow-teal-500/20' : 'bg-slate-800 text-slate-500'}`}>DNA_Vault</button>
        </div>

        {!activeItem && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in">
              {(activeTab === 'season' ? seasons : personas).map((item, i) => (
                  <div key={i} className="bg-[#1c1f23] border border-slate-800 p-8 rounded-lg shadow-2xl hover:border-teal-500/40 cursor-pointer relative group transition-all" onClick={() => setActiveItem(item)}>
                      {viewMode === 'god' && <button onClick={(e) => { e.stopPropagation(); fetch(`${API_BASE}/${activeTab}/delete/${item.id}`, {method:'DELETE'}); refreshData(); }} className="absolute top-6 right-6 text-slate-700 hover:text-red-500"><Trash2 size={18}/></button>}
                      
                      <div className="flex gap-6 items-start">
                        {item.portrait && <img src={item.portrait} className="w-16 h-16 rounded border border-slate-800 grayscale hover:grayscale-0 transition-all" alt="DNA" />}
                        <div className="flex-1">
                            <h4 className="text-white font-black uppercase text-base mb-1 tracking-tighter italic">{item.title || item.name}</h4>
                            <p className="text-[10px] text-teal-500 uppercase mb-4 tracking-widest">{item.relationship || item.role}</p>
                            <p className="text-[9px] text-slate-600 italic line-clamp-2 uppercase border-t border-slate-800 pt-4">{item.trauma || "DATA_STABILIZED"}</p>
                        </div>
                      </div>
                  </div>
              ))}
          </div>
        )}

        {/* DETAIL: SEASON */}
        {activeItem && activeTab === 'season' && (
            <div className="animate-in fade-in space-y-12">
                <div className="flex justify-between items-end border-b border-slate-800 pb-8">
                    <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter">{activeItem.title}</h2>
                    <button onClick={() => { setActiveItem(null); setActiveBrief(null); }} className="bg-teal-500 text-black px-8 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-white shadow-xl">Return</button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="space-y-6 bg-black/20 p-8 border border-slate-800 rounded-xl">
                        <h4 className="text-teal-500 text-[10px] font-black uppercase mb-4 italic border-b border-slate-800 pb-2">Topic_Sequence</h4>
                        <div className="space-y-3">
                            {(activeItem.episodes || []).map((ep, idx) => (
                                <div key={idx} className="p-4 bg-[#1c1f23] border border-slate-800 flex justify-between items-center group hover:border-teal-500/40 transition-all">
                                    <div className="flex flex-col">
                                        <span className="text-[8px] text-teal-500/50 font-black uppercase">ACT {ep.act}</span>
                                        <span className="text-white font-bold uppercase text-[11px]">{ep.title}</span>
                                    </div>
                                    <button onClick={() => generateBrief(activeItem.id, idx)} className="px-4 py-2 bg-slate-800 text-teal-400 text-[9px] font-black uppercase border border-slate-700 hover:bg-teal-500 hover:text-black flex items-center gap-2"><Send size={12}/> Run_Brief</button>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-6 bg-black/20 p-8 border border-slate-800 rounded-xl">
                        <h4 className="text-teal-500 text-[10px] font-black uppercase mb-4 italic border-b border-slate-800 pb-2 flex justify-between items-center">
                            <span>Showrunner_Output</span>
                            <ShieldCheck size={14} className="text-teal-900" />
                        </h4>
                        <div className="max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">{renderBrief()}</div>
                    </div>
                </div>
            </div>
        )}

        {/* DETAIL: PERSONA */}
        {activeItem && activeTab === 'persona' && (
            <div className="animate-in fade-in space-y-12">
                <div className="flex justify-between items-end border-b border-slate-800 pb-8">
                    <div className="flex gap-8 items-end">
                       {activeItem.portrait && <img src={activeItem.portrait} className="w-32 h-32 rounded border border-slate-700 shadow-2xl" alt="DNA" />}
                       <div>
                          <h2 className="text-6xl font-black text-white uppercase italic tracking-tighter mb-2">{activeItem.name}</h2>
                          <p className="text-teal-500 font-black uppercase text-sm tracking-[0.2em]">{activeItem.role} // {activeItem.gender}</p>
                       </div>
                    </div>
                    <button onClick={() => setActiveItem(null)} className="bg-teal-500 text-black px-8 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-white shadow-xl">Return</button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 text-[12px] leading-relaxed">
                    <div className="bg-black/20 p-10 border border-slate-800 rounded-xl space-y-8 h-[600px] overflow-y-auto pr-4 custom-scrollbar shadow-2xl">
                        <h4 className="text-teal-500 text-[10px] font-black uppercase mb-6 flex items-center gap-2 italic tracking-widest border-b border-slate-800 pb-2"><Quote size={14}/> Forensic_Dossier</h4>
                        <div className="bg-teal-500/5 p-4 border border-teal-500/20 mb-6 text-teal-400 font-bold italic">"{activeItem.archive?.vocal_intro}"</div>
                        <p className="text-[13px] text-slate-400 font-sans leading-relaxed whitespace-pre-wrap">{activeItem.archive?.bio}</p>
                    </div>
                    <div className="bg-black/20 p-10 border border-slate-800 rounded-xl space-y-8 h-[600px] overflow-y-auto pr-4 custom-scrollbar shadow-2xl">
                        <h4 className="text-teal-500 text-[10px] font-black uppercase mb-6 italic border-b border-slate-800 pb-2">Memory_Registry</h4>
                        <div className="space-y-4">
                           {(activeItem.archive?.anecdotes || []).map((a, i) => (
                              <p key={i} className="p-4 bg-[#1c1f23] border border-slate-800 text-[11px] text-slate-500 italic uppercase leading-relaxed hover:text-white transition-all">"{a}"</p>
                           ))}
                        </div>
                    </div>
                </div>
            </div>
        )}
      </section>

      {/* PANE 3: COMMAND (RIGHT - Hidden in User Mode) */}
      {viewMode === 'god' && (
        <section className="w-[480px] bg-[#0b0c0e] p-10 flex flex-col gap-12 overflow-y-auto border-l border-slate-800 shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="space-y-6 bg-black/30 p-8 rounded-2xl border border-slate-800 shadow-xl">
                <h3 className="text-teal-400 text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-3"><UserPlus size={16}/> Spawn_Identity</h3>
                <div className="space-y-4">
                    <input className="w-full bg-[#1c1f23] p-4 border border-slate-800 text-[12px] text-white font-bold outline-none focus:border-teal-500" placeholder="NAME" value={newP.name} onChange={(e) => setNewP({...newP, name: e.target.value})} />
                    <div className="grid grid-cols-2 gap-2">
                    <select className="bg-[#1c1f23] p-4 border border-slate-800 text-[11px] text-teal-500 font-black outline-none" value={newP.gender} onChange={(e) => setNewP({...newP, gender: e.target.value})}>
                        {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                    <input className="bg-[#1c1f23] p-4 border border-slate-800 text-[11px] text-slate-500 outline-none" placeholder="ROLE" value={newP.role} onChange={(e) => setNewP({...newP, role: e.target.value})} />
                    </div>
                    <div className="relative">
                    <input className="w-full bg-[#1c1f23] p-4 border border-slate-800 text-[11px] text-slate-500 outline-none uppercase pr-12" placeholder="CORE_TRAUMA" value={newP.trauma} onChange={(e) => setNewP({...newP, trauma: e.target.value})} />
                    <button onClick={() => setNewP({...newP, trauma: TRAUMAS[Math.floor(Math.random() * TRAUMAS.length)]})} className="absolute right-4 top-3.5 text-slate-700 hover:text-teal-500 transition-all"><Dice5 size={20}/></button>
                    </div>
                    <button onClick={handleCreatePersona} disabled={loading || !newP.name} className={`w-full py-4 text-[10px] font-black uppercase tracking-widest rounded shadow-xl transition-all ${loading || !newP.name ? 'bg-slate-900 text-slate-800 opacity-20' : 'bg-teal-500 text-black hover:bg-white'}`}>Commit_DNA</button>
                </div>
            </div>

            <div className="space-y-6 bg-black/30 p-8 rounded-2xl border border-slate-800 shadow-xl">
                <h3 className="text-teal-400 text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-3"><Database size={16}/> Establish_Season</h3>
                <div className="space-y-8">
                    <input className="w-full bg-[#1c1f23] p-4 border border-slate-800 text-[12px] text-white font-bold outline-none focus:border-teal-500 uppercase" placeholder="TOPIC_STRING" value={newS.topic} onChange={(e) => setNewS({...newS, topic: e.target.value})} />
                    <div className="grid grid-cols-2 gap-2">
                        {personas.map(p => (
                            <button key={p.id} onClick={() => {
                                const ids = newS.host_ids.includes(p.id) ? newS.host_ids.filter(id => id !== p.id) : [...newS.host_ids, p.id];
                                setNewS({...newS, host_ids: ids.slice(0, 2)});
                            }} className={`p-4 text-[9px] font-black uppercase border transition-all rounded ${newS.host_ids.includes(p.id) ? 'border-teal-500 bg-teal-500/10 text-teal-400' : 'border-slate-800 text-slate-600'}`}>
                                {p.name}
                            </button>
                        ))}
                    </div>
                    <select className="w-full bg-[#1c1f23] p-4 border border-slate-800 text-[11px] text-teal-400 font-bold outline-none" value={newS.relationship} onChange={(e) => setNewS({...newS, relationship: e.target.value})}>
                        {DYNAMICS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <button onClick={handleCreateSeason} disabled={loading || !newS.topic || newS.host_ids.length !== 2} className={`w-full py-6 text-[11px] font-black uppercase tracking-widest rounded transition-all shadow-2xl ${loading || !newS.topic || newS.host_ids.length !== 2 ? 'bg-slate-900 text-slate-800 opacity-20' : 'bg-teal-500 text-black hover:bg-white'}`}>Establish_Signal</button>
                </div>
            </div>
        </section>
      )}
    </div>
  );
};

export default App;
