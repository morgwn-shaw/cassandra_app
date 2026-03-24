import React, { useState, useEffect, useRef } from 'react';
import { Zap, Activity, Code, Cpu, Layers, Fingerprint, Trash2, Plus, PlayCircle, UserPlus, Database, Quote, X, ShieldCheck, Send, Brain, Dice5, Eye, Terminal } from 'lucide-react';

const API_BASE = "https://shadow-cassandrafiles.pythonanywhere.com/api/v2";

const App = () => {
  const [viewMode, setViewMode] = useState('god'); 
  const [activeTab, setActiveTab] = useState('season');
  const [seasons, setSeasons] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [activeItem, setActiveItem] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [liveStatus, setLiveStatus] = useState({ stage: 'IDLE', history: [] });
  
  const [newS, setNewS] = useState({ topic: '', relationship: 'Unresolved Sexual Tension (UST)', host_ids: [], episodes_count: 10 });
  const [newP, setNewP] = useState({ name: '', role: 'Forensic Analyst', trauma: '', gender: 'Random' });

  const logEndRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/status`);
        setLiveStatus(await res.json());
      } catch (e) {}
    }, 1500);
    return () => clearInterval(interval);
  }, []);

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
    try {
      await fetch(`${API_BASE}/persona/create`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(newP) });
      await refreshData();
    } finally { 
      setLoading(false); 
      setNewP({ name: '', role: 'Forensic Analyst', trauma: '', gender: 'Random' });
    }
  };

  const establishArc = async () => {
    if (!newS.topic || newS.host_ids.length !== 2) return;
    setLoading(true);
    try {
      await fetch(`${API_BASE}/season/reconcile`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(newS) });
      await refreshData();
    } finally { setLoading(false); }
  };

  return (
    <div className={`h-screen w-screen font-mono flex overflow-hidden ${viewMode === 'god' ? 'bg-[#0d0f11]' : 'bg-[#1a1c1e]'}`}>
      
      {/* GOD TELEMETRY */}
      {viewMode === 'god' && (
        <section className="w-[380px] border-r border-slate-800 bg-[#08090a] flex flex-col p-6 shadow-2xl">
            <div className="flex items-center gap-2 text-teal-400 font-black text-[10px] mb-8 uppercase tracking-[0.4em] border-b border-slate-800 pb-4">
                <Zap size={14} className={loading ? "animate-pulse" : ""} /> Kernel_v27.8
            </div>
            <div className="flex-1 overflow-y-auto space-y-1 text-[9px] custom-scrollbar">
                {liveStatus.history.map((log, i) => (
                    <div key={i} className="border-l border-slate-800 pl-3 py-1 font-bold text-slate-600 mb-1 uppercase tracking-tighter">{log}</div>
                ))}
                <div ref={logEndRef} />
            </div>
        </section>
      )}

      {/* WORKSPACE */}
      <section className="flex-1 flex flex-col p-10 overflow-y-auto bg-[#121416] relative">
        <div className="absolute top-10 right-10 flex border border-slate-800 rounded overflow-hidden z-50 shadow-2xl">
            <button onClick={() => setViewMode('god')} className={`px-4 py-2 text-[9px] font-black ${viewMode === 'god' ? 'bg-teal-500 text-black' : 'bg-slate-900 text-slate-500'}`}>GOD</button>
            <button onClick={() => setViewMode('user')} className={`px-4 py-2 text-[9px] font-black ${viewMode === 'user' ? 'bg-teal-500 text-black' : 'bg-slate-900 text-slate-500'}`}>USER</button>
        </div>

        <div className="flex gap-4 mb-10 border-b border-slate-800 pb-6">
            <button onClick={() => { setActiveTab('season'); setActiveItem(null); }} className={`px-10 py-3 text-[10px] font-black ${activeTab === 'season' && !activeItem ? 'bg-teal-500 text-black shadow-lg shadow-teal-500/20' : 'bg-slate-800 text-slate-500 hover:text-white'}`}>SEASONS</button>
            <button onClick={() => { setActiveTab('persona'); setActiveItem(null); }} className={`px-10 py-3 text-[10px] font-black ${activeTab === 'persona' && !activeItem ? 'bg-teal-500 text-black shadow-lg shadow-teal-500/20' : 'bg-slate-800 text-slate-500 hover:text-white'}`}>DNA_VAULT</button>
        </div>

        {!activeItem ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-300">
              {(activeTab === 'season' ? seasons : personas).map((item, i) => (
                  <div key={i} className="bg-[#1c1f23] border border-slate-800 p-6 rounded cursor-pointer hover:border-teal-500 transition-all flex gap-5 items-center group shadow-xl" onClick={() => setActiveItem(item)}>
                      {item.portrait ? (
                        <img src={item.portrait} className="w-14 h-14 rounded grayscale group-hover:grayscale-0 border border-slate-800 transition-all shadow-lg" alt="DNA" />
                      ) : (
                        <div className="w-14 h-14 rounded bg-slate-900 flex items-center justify-center text-slate-700"><Fingerprint size={24}/></div>
                      )}
                      <div>
                        <h4 className="text-white font-black uppercase text-sm italic tracking-tighter">{item.title || item.name}</h4>
                        <p className="text-[9px] text-teal-500 uppercase font-black opacity-60 tracking-widest">{item.relationship || item.role}</p>
                      </div>
                  </div>
              ))}
          </div>
        ) : (
          <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-10">
             <div className="flex justify-between items-end border-b border-slate-800 pb-8">
                <div className="flex gap-8 items-center">
                    {activeItem.portrait && <img src={activeItem.portrait} className="w-28 h-28 rounded border border-slate-700 shadow-2xl grayscale" alt="P" />}
                    <div>
                        <h2 className="text-6xl font-black text-white uppercase italic tracking-tighter mb-2">{activeItem.title || activeItem.name}</h2>
                        <span className="bg-teal-500 text-black px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded">{activeItem.relationship || activeItem.role}</span>
                    </div>
                </div>
                <button onClick={() => setActiveItem(null)} className="bg-slate-800 text-white px-8 py-3 text-[10px] font-black hover:bg-teal-500 hover:text-black shadow-xl transition-all border border-slate-700">CLOSE_VAULT</button>
             </div>

             {/* HYDRATION GUARD: Prevents rendering if AI hasn't finished bio */}
             {activeTab === 'persona' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="bg-black/40 p-10 border border-slate-800 rounded shadow-2xl h-[550px] overflow-y-auto custom-scrollbar">
                        <h4 className="text-teal-500 text-[10px] font-black uppercase mb-6 flex items-center gap-2 border-b border-slate-800 pb-2 italic"><Quote size={14}/> Forensic Dossier</h4>
                        {!activeItem.archive?.bio ? (
                           <div className="flex items-center gap-3 text-slate-700 font-black uppercase text-[10px] animate-pulse italic"><Brain size={18}/> Reconstructing Bio...</div>
                        ) : (
                           <p className="text-[13px] text-slate-400 font-sans leading-relaxed whitespace-pre-wrap selection:bg-teal-500/30 selection:text-white uppercase">{activeItem.archive.bio}</p>
                        )}
                    </div>
                    <div className="bg-black/40 p-10 border border-slate-800 rounded shadow-2xl h-[550px] overflow-y-auto custom-scrollbar">
                        <h4 className="text-teal-500 text-[10px] font-black uppercase mb-6 italic border-b border-slate-800 pb-2">DNA Memory Buffer</h4>
                        {!activeItem.archive?.anecdotes ? (
                            <div className="flex items-center gap-3 text-slate-700 font-black uppercase text-[10px] animate-pulse italic"><Activity size={18}/> Parsing Synapses...</div>
                        ) : (
                            activeItem.archive.anecdotes.map((a, i) => (
                                <p key={i} className="p-4 bg-white/5 border border-white/5 text-[10px] text-slate-500 italic mb-3 uppercase leading-relaxed hover:text-white hover:bg-teal-500/5 transition-all">"{a}"</p>
                            ))
                        )}
                    </div>
                </div>
             )}
          </div>
        )}
      </section>

      {/* COMMAND CENTER (GOD MODE ONLY) */}
      {viewMode === 'god' && (
        <section className="w-[420px] bg-[#0b0c0e] p-10 flex flex-col gap-12 border-l border-slate-800 overflow-y-auto shadow-2xl">
            <div className="space-y-6">
                <h3 className="text-teal-400 text-[10px] font-black uppercase flex items-center gap-3 tracking-[0.2em]"><UserPlus size={16}/> Spawn_Identity</h3>
                <input className="w-full bg-[#1c1f23] p-4 border border-slate-800 text-[12px] text-white font-bold outline-none focus:border-teal-500" placeholder="NAME" value={newP.name} onChange={(e) => setNewP({...newP, name: e.target.value})} />
                <div className="grid grid-cols-2 gap-2">
                    <select className="bg-[#1c1f23] p-4 border border-slate-800 text-[10px] text-teal-500 font-black outline-none" value={newP.gender} onChange={(e) => setNewP({...newP, gender: e.target.value})}>
                        {["Male", "Female", "Non-Binary", "Random"].map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                    <input className="bg-[#1c1f23] p-4 border border-slate-800 text-[10px] text-slate-500 outline-none" placeholder="ROLE" value={newP.role} onChange={(e) => setNewP({...newP, role: e.target.value})} />
                </div>
                <button onClick={spawnPersona} disabled={loading} className="w-full py-5 bg-teal-500 text-black text-[11px] font-black uppercase tracking-widest shadow-2xl disabled:opacity-20 hover:bg-white transition-all">COMMIT_DNA</button>
            </div>

            <div className="space-y-6">
                <h3 className="text-teal-400 text-[10px] font-black uppercase flex items-center gap-3 tracking-[0.2em]"><Database size={16}/> Establish_Season</h3>
                <input className="w-full bg-[#1c1f23] p-4 border border-slate-800 text-[12px] text-white font-bold outline-none uppercase" placeholder="TOPIC" value={newS.topic} onChange={(e) => setNewS({...newS, topic: e.target.value})} />
                <div className="grid grid-cols-2 gap-2">
                    {personas.map(p => (
                        <button key={p.id} onClick={() => {
                            const ids = newS.host_ids.includes(p.id) ? newS.host_ids.filter(id => id !== p.id) : [...newS.host_ids, p.id];
                            setNewS({...newS, host_ids: ids.slice(0, 2)});
                        }} className={`p-3 text-[9px] font-black border uppercase rounded transition-all ${newS.host_ids.includes(p.id) ? 'border-teal-500 bg-teal-500/10 text-teal-400' : 'border-slate-800 text-slate-600'}`}>
                            {p.name}
                        </button>
                    ))}
                </div>
                <div className="space-y-2">
                    <p className="text-[9px] text-slate-600 uppercase font-black flex justify-between tracking-widest">Episode_Count <span>{newS.episodes_count}</span></p>
                    <input type="range" min="4" max="24" step="2" className="w-full accent-teal-500" value={newS.episodes_count} onChange={(e) => setNewS({...newS, episodes_count: e.target.value})} />
                </div>
                <button onClick={establishArc} disabled={loading || newS.host_ids.length !== 2} className="w-full py-5 bg-teal-500 text-black text-[11px] font-black uppercase shadow-2xl disabled:opacity-20 hover:bg-white transition-all">ESTABLISH_SIGNAL</button>
            </div>
        </section>
      )}
    </div>
  );
};

export default App;
