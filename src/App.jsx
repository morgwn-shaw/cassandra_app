import React, { useState, useEffect, useRef } from 'react';
import { Zap, Activity, Code, Cpu, Layers, Fingerprint, Trash2, Plus, PlayCircle, UserPlus, Database, Quote, X, ShieldCheck, Send, Brain, Dice5, Eye, Terminal } from 'lucide-react';

const API_BASE = "https://shadow-cassandrafiles.pythonanywhere.com/api/v2";

const App = () => {
  const [viewMode, setViewMode] = useState('god'); 
  const [activeTab, setActiveTab] = useState('season');
  const [seasons, setSeasons] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [activeItem, setActiveItem] = useState(null); 
  const [activeBrief, setActiveBrief] = useState(null);
  const [loading, setLoading] = useState(false);
  const [liveStatus, setLiveStatus] = useState({ stage: 'IDLE', history: [], response_payload: '{}' });
  
  const [newS, setNewS] = useState({ topic: '', relationship: 'Unresolved Sexual Tension (UST)', host_ids: [], episodes_count: 10 });
  const [newP, setNewP] = useState({ name: '', role: 'Forensic Analyst', trauma: '', gender: 'Random' });

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
    try {
      const res = await fetch(`${API_BASE}/persona/create`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(newP) });
      if (!res.ok) throw new Error("Backend DNA rejection.");
      await refreshData();
      setNewP({ name: '', role: 'Forensic Analyst', trauma: '', gender: 'Random' });
    } catch(e) { window.alert(e.message); }
    finally { setLoading(false); }
  };

  const establishArc = async () => {
    if (!newS.topic || newS.host_ids.length !== 2) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/season/reconcile`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(newS) });
      if (!res.ok) throw new Error("Season reconciliation failed.");
      await refreshData();
    } catch(e) { window.alert(e.message); }
    finally { setLoading(false); }
  };

  const generateBrief = async (seasonId, idx) => {
    setActiveBrief(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/showrunner/brief`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ season_id: seasonId, node_index: idx }) });
      setActiveBrief(await res.json());
    } finally { setLoading(false); }
  };

  const renderBrief = () => {
    if (!activeBrief) return <div className="h-40 flex items-center justify-center text-slate-800 text-[10px] font-black uppercase tracking-[0.3em]">Initialize_Signal</div>;
    
    // Safety Render: If it's a known 'acts' list, use it; otherwise, iterate the object
    const data = activeBrief.acts || Object.entries(activeBrief);
    
    return data.map((item, i) => {
      const isAct = !Array.isArray(item);
      const title = isAct ? `ACT ${item.act_number}` : item[0].replace(/_/g, ' ');
      const content = isAct ? item.summary : item[1];
      
      return (
        <div key={i} className="border-l-2 border-teal-500/30 pl-4 py-3 mb-6 bg-black/30 rounded-r shadow-lg animate-in slide-in-from-right-4">
            <span className="text-[8px] text-teal-500 font-black uppercase mb-1 block opacity-60">{title}</span>
            <p className="text-[11px] text-slate-400 font-sans italic leading-relaxed uppercase">"{typeof content === 'string' ? content : JSON.stringify(content)}"</p>
        </div>
      );
    });
  };

  return (
    <div className={`h-screen w-screen font-mono flex overflow-hidden ${viewMode === 'god' ? 'bg-[#0d0f11]' : 'bg-[#1a1c1e]'}`}>
      
      {/* GOD MODE: TELEMETRY */}
      {viewMode === 'god' && (
        <section className="w-[420px] border-r border-slate-800 bg-[#08090a] flex flex-col p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
                <div className="text-teal-400 font-black uppercase text-[10px] flex items-center gap-2"><Zap size={14}/> Kernel_v27.6</div>
            </div>
            <div className="flex-1 overflow-hidden flex flex-col gap-4">
                <div className="bg-black/40 p-4 border border-slate-800 rounded flex-1 overflow-y-auto custom-scrollbar">
                    <p className="text-teal-500 text-[9px] font-black uppercase mb-4">Memory_Log</p>
                    {liveStatus.history.map((log, i) => (
                        <div key={i} className="border-l border-slate-800 pl-3 py-1 font-bold text-slate-600 text-[10px] mb-1">{log}</div>
                    ))}
                    <div ref={logEndRef} />
                </div>
                <pre className="h-32 bg-black p-4 border border-slate-800 text-[9px] text-teal-600/40 overflow-auto">OUT: {liveStatus.response_payload}</pre>
            </div>
        </section>
      )}

      {/* WORKSPACE */}
      <section className="flex-1 flex flex-col p-10 overflow-y-auto relative bg-[#121416]">
        <div className="absolute top-10 right-10 flex border border-slate-800 rounded overflow-hidden z-50 shadow-2xl">
            <button onClick={() => setViewMode('god')} className={`px-4 py-2 text-[9px] font-black ${viewMode === 'god' ? 'bg-teal-500 text-black' : 'bg-slate-900 text-slate-500'}`}>FORENSIC</button>
            <button onClick={() => setViewMode('user')} className={`px-4 py-2 text-[9px] font-black ${viewMode === 'user' ? 'bg-teal-500 text-black' : 'bg-slate-900 text-slate-500'}`}>SIMULATION</button>
        </div>

        <div className="flex gap-4 mb-10 border-b border-slate-800 pb-6">
            <button onClick={() => { setActiveTab('season'); setActiveItem(null); }} className={`px-10 py-3 text-[10px] font-black ${activeTab === 'season' && !activeItem ? 'bg-teal-500 text-black shadow-lg shadow-teal-500/20' : 'bg-slate-800 text-slate-500'}`}>SEASONS</button>
            <button onClick={() => { setActiveTab('persona'); setActiveItem(null); }} className={`px-10 py-3 text-[10px] font-black ${activeTab === 'persona' && !activeItem ? 'bg-teal-500 text-black shadow-lg shadow-teal-500/20' : 'bg-slate-800 text-slate-500'}`}>DNA_VAULT</button>
        </div>

        {!activeItem && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in">
              {(activeTab === 'season' ? seasons : personas).map((item, i) => (
                  <div key={i} className="bg-[#1c1f23] border border-slate-800 p-8 rounded-lg cursor-pointer relative group shadow-2xl hover:border-teal-500/40 transition-all" onClick={() => setActiveItem(item)}>
                      <div className="flex gap-6 items-center">
                        {item.portrait && <img src={item.portrait} className="w-16 h-16 rounded border border-slate-800 grayscale shadow-lg" alt="P" onError={(e) => e.target.src='https://via.placeholder.com/64?text=DNA'} />}
                        <div className="flex-1">
                            <h4 className="text-white font-black uppercase text-base italic tracking-tighter">{item.title || item.name}</h4>
                            <p className="text-[10px] text-teal-500 font-bold uppercase tracking-widest">{item.relationship || item.role}</p>
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
                    <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter">{activeItem.title}</h2>
                    <button onClick={() => { setActiveItem(null); setActiveBrief(null); }} className="bg-teal-500 text-black px-8 py-3 text-[10px] font-black">RETURN</button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="space-y-4 bg-black/20 p-8 rounded-xl border border-slate-800">
                        <h4 className="text-teal-500 text-[10px] font-black uppercase border-b border-slate-800 pb-2 italic">Episode_Nodes</h4>
                        {(activeItem.episodes || []).map((ep, idx) => (
                            <div key={idx} className="p-4 bg-[#1c1f23] border border-slate-800 flex justify-between items-center group hover:border-teal-500/30 transition-all">
                                <div className="flex flex-col">
                                    <span className="text-[8px] text-teal-500 font-black">ACT {ep.act}</span>
                                    <span className="text-white font-bold text-[11px] uppercase">{ep.title}</span>
                                </div>
                                <button onClick={() => generateBrief(activeItem.id, idx)} className="px-4 py-2 bg-slate-800 text-teal-400 text-[8px] font-black border border-slate-700 hover:bg-teal-500 hover:text-black transition-all">RUN_BRIEF</button>
                            </div>
                        ))}
                    </div>
                    <div className="space-y-4 bg-black/20 p-8 rounded-xl border border-slate-800 h-[600px] overflow-y-auto custom-scrollbar">
                        <h4 className="text-teal-500 text-[10px] font-black uppercase italic border-b border-slate-800 pb-2">6-Act_Brief</h4>
                        {renderBrief()}
                    </div>
                </div>
            </div>
        )}

        {/* DETAIL: PERSONA */}
        {activeItem && activeTab === 'persona' && (
            <div className="space-y-12 animate-in fade-in">
                <div className="flex justify-between items-end border-b border-slate-800 pb-8">
                    <div className="flex gap-8 items-end">
                        {activeItem.portrait && <img src={activeItem.portrait} className="w-32 h-32 rounded border border-slate-700 shadow-2xl grayscale" alt="DNA" />}
                        <div>
                            <h2 className="text-6xl font-black text-white uppercase italic tracking-tighter mb-2">{activeItem.name}</h2>
                            <p className="text-teal-500 font-black uppercase text-sm tracking-[0.2em]">{activeItem.role} // {activeItem.gender}</p>
                        </div>
                    </div>
                    <button onClick={() => setActiveItem(null)} className="bg-teal-500 text-black px-8 py-3 text-[10px] font-black">RETURN</button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 h-[600px]">
                    <div className="bg-black/20 p-10 border border-slate-800 rounded-xl overflow-y-auto custom-scrollbar">
                        <h4 className="text-teal-500 text-[10px] font-black uppercase mb-6 italic tracking-widest border-b border-slate-800 pb-2">Forensic_Dossier</h4>
                        <p className="text-[13px] text-slate-400 leading-relaxed whitespace-pre-wrap">{activeItem.archive?.bio}</p>
                    </div>
                    <div className="bg-black/20 p-10 border border-slate-800 rounded-xl overflow-y-auto custom-scrollbar">
                        <h4 className="text-teal-500 text-[10px] font-black uppercase mb-6 italic tracking-widest border-b border-slate-800 pb-2">DNA_Memories</h4>
                        {(activeItem.archive?.anecdotes || []).map((a, i) => (
                           <p key={i} className="p-4 bg-[#1c1f23] border border-slate-800 text-[11px] text-slate-500 italic mb-2 uppercase">"{a}"</p>
                        ))}
                    </div>
                </div>
            </div>
        )}
      </section>

      {/* COMMAND PANE (GOD MODE ONLY) */}
      {viewMode === 'god' && (
        <section className="w-[480px] bg-[#0b0c0e] p-10 flex flex-col gap-12 overflow-y-auto border-l border-slate-800 shadow-2xl">
            <div className="space-y-6 bg-black/30 p-8 rounded-2xl border border-slate-800 shadow-xl">
                <h3 className="text-teal-400 text-[11px] font-black uppercase flex items-center gap-3"><UserPlus size={16}/> Identity_Spawn</h3>
                <div className="space-y-4">
                    <input className="w-full bg-[#1c1f23] p-4 border border-slate-800 text-[12px] text-white font-bold outline-none focus:border-teal-500" placeholder="NAME" value={newP.name} onChange={(e) => setNewP({...newP, name: e.target.value})} />
                    <div className="grid grid-cols-2 gap-2">
                        <select className="bg-[#1c1f23] p-4 border border-slate-800 text-[11px] text-teal-500 font-black outline-none" value={newP.gender} onChange={(e) => setNewP({...newP, gender: e.target.value})}>
                            {["Male", "Female", "Non-Binary", "Random"].map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                        <input className="bg-[#1c1f23] p-4 border border-slate-800 text-[11px] text-slate-500 outline-none" placeholder="ROLE" value={newP.role} onChange={(e) => setNewP({...newP, role: e.target.value})} />
                    </div>
                    <button onClick={spawnPersona} disabled={loading || !newP.name} className="w-full py-4 bg-teal-500 text-black text-[10px] font-black uppercase tracking-widest rounded shadow-xl disabled:opacity-20">COMMIT_DNA</button>
                </div>
            </div>

            <div className="space-y-6 bg-black/30 p-8 rounded-2xl border border-slate-800 shadow-xl">
                <h3 className="text-teal-400 text-[11px] font-black uppercase flex items-center gap-3"><Database size={16}/> Establish_Season</h3>
                <div className="space-y-8">
                    <input className="w-full bg-[#1c1f23] p-4 border border-slate-800 text-[12px] text-white font-bold outline-none focus:border-teal-500 uppercase" placeholder="TOPIC_STRING" value={newS.topic} onChange={(e) => setNewS({...newS, topic: e.target.value})} />
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
                    <div className="space-y-3">
                        <p className="text-slate-600 text-[9px] font-black uppercase flex justify-between">Node_Length <span>{newS.episodes_count}</span></p>
                        <input type="range" min="4" max="24" step="2" className="w-full accent-teal-500" value={newS.episodes_count} onChange={(e) => setNewS({...newS, episodes_count: e.target.value})} />
                    </div>
                    <button onClick={establishArc} disabled={loading || !newS.topic || newS.host_ids.length !== 2} className="w-full py-6 bg-teal-500 text-black rounded uppercase shadow-2xl disabled:opacity-20">ESTABLISH_SIGNAL</button>
                </div>
            </div>
        </section>
      )}
    </div>
  );
};

export default App;
