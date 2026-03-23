import React, { useState, useEffect, useRef } from 'react';
import { Zap, Activity, Code, Cpu, Layers, Fingerprint, Trash2, Plus, PlayCircle, UserPlus, Database, Quote, X, Dice5, ShieldCheck, MessageSquare, Brain, Eye } from 'lucide-react';

const API_BASE = "https://shadow-cassandrafiles.pythonanywhere.com/api/v2";

const GENDERS = ["Male", "Female", "Non-Binary", "Gender-Fluid", "Agender", "Trans-Masculine", "Trans-Feminine", "Random"];
const DYNAMICS = ["Unresolved Sexual Tension (UST) - High Friction", "UST - Denied Attraction", "Grudging Mutual Respect", "Mentor / Protégé (Estranged)", "Bitter Professional Rivals", "Two Strangers sharing a Secret", "Echo-Chamber (Dangerous Agreement)"];

const App = () => {
  const [activeTab, setActiveTab] = useState('season');
  const [seasons, setSeasons] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [activeItem, setActiveItem] = useState(null); 
  const [activeBrief, setActiveBrief] = useState(null);
  const [loading, setLoading] = useState(false);
  const [liveStatus, setLiveStatus] = useState({ stage: 'IDLE', last_event: 'Ready', history: [], active_engine: '...' });
  
  const [newS, setNewS] = useState({ topic: '', relationship: DYNAMICS[0], host_ids: [], episodes_count: 10 });
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
  useEffect(() => { logEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [liveStatus.history]);

  const refreshData = async () => {
    const sRes = await fetch(`${API_BASE}/season/list`);
    setSeasons(await sRes.json() || []);
    const pRes = await fetch(`${API_BASE}/persona/list`);
    setPersonas(await pRes.json() || []);
  };

  const spawnPersona = async () => {
    if (!newP.name) return;
    setLoading(true);
    await fetch(`${API_BASE}/persona/create`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(newP) });
    refreshData();
    setNewP({ name: '', role: 'Forensic Analyst', trauma: '', gender: 'Random' });
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
    setLoading(true);
    const res = await fetch(`${API_BASE}/showrunner/brief`, { 
      method: 'POST', headers: {'Content-Type': 'application/json'}, 
      body: JSON.stringify({ season_id: seasonId, node_index: idx }) 
    });
    const data = await res.json();
    setActiveBrief(data.data);
    setLoading(false);
  };

  return (
    <div className="h-screen w-screen bg-[#0d0f11] text-slate-300 font-mono flex overflow-hidden">
      
      {/* PANE 1: FORENSIC TELEMETRY (LEFT) */}
      <section className="w-[420px] border-r border-slate-800 bg-[#08090a] flex flex-col p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
            <div className="text-teal-400 font-black uppercase text-[10px] tracking-[0.4em] flex items-center gap-2">
                <Zap size={14} className={loading ? "animate-pulse text-amber-500" : ""} /> Shadow_Kernel_v26
            </div>
            <div className="text-[8px] text-slate-600 font-bold uppercase tracking-widest">{liveStatus.active_engine?.split('/')[1]}</div>
        </div>

        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
            <div className="p-4 bg-black/40 border border-slate-800 rounded">
                <p className="text-teal-500 text-[9px] font-black uppercase mb-4">Kernel_History</p>
                <div className="h-40 overflow-y-auto space-y-1 text-[10px]">
                    {liveStatus.history.map((log, i) => (
                        <div key={i} className={`border-l pl-3 py-1 font-bold ${log.includes('SUCCESS') ? 'text-teal-400 border-teal-400' : 'text-slate-600 border-slate-800'}`}>{log}</div>
                    ))}
                    <div ref={logEndRef} />
                </div>
            </div>
            <div className="flex-1 flex flex-col min-h-0 gap-4">
                <pre className="text-[9px] text-slate-600 bg-black/60 p-4 rounded border border-slate-800 flex-1 overflow-auto whitespace-pre-wrap leading-tight font-sans italic">ENGINE_OUTPUT: {liveStatus.response_payload}</pre>
            </div>
        </div>
      </section>

      {/* PANE 2: WORKSPACE (CENTER) */}
      <section className="flex-1 flex flex-col bg-[#0d0f11] p-10 overflow-y-auto border-r border-slate-800">
        <div className="flex gap-4 mb-10 border-b border-slate-800 pb-6">
            <button onClick={() => { setActiveTab('season'); setActiveItem(null); setActiveBrief(null); }} className={`px-10 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'season' && !activeItem ? 'bg-teal-500 text-black shadow-lg' : 'bg-slate-800 text-slate-500 hover:text-white'}`}>Seasons</button>
            <button onClick={() => { setActiveTab('persona'); setActiveItem(null); setActiveBrief(null); }} className={`px-10 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'persona' && !activeItem ? 'bg-teal-500 text-black shadow-lg' : 'bg-slate-800 text-slate-500 hover:text-white'}`}>DNA_Registry</button>
        </div>

        {!activeItem && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-500">
              {activeTab === 'season' && seasons.map((s, i) => (
                  <div key={i} className="bg-[#161a1d] border border-slate-800 p-8 rounded-lg shadow-xl hover:border-teal-500/40 cursor-pointer relative" onClick={() => setActiveItem(s)}>
                      <button onClick={(e) => { e.stopPropagation(); fetch(`${API_BASE}/season/delete/${s.id}`, {method:'DELETE'}); refreshData(); }} className="absolute top-6 right-6 text-slate-700 hover:text-red-500 transition-all"><Trash2 size={18}/></button>
                      <h4 className="text-white font-black uppercase text-base mb-2 italic">{s.title}</h4>
                      <p className="text-[10px] text-slate-500 italic uppercase mb-8 border-l border-slate-700 pl-4">{s.relationship}</p>
                      <div className="w-full py-3 bg-slate-800 text-teal-400 text-[9px] font-black uppercase flex items-center justify-center gap-3 border border-slate-700">Audit_Blueprints</div>
                  </div>
              ))}
              {activeTab === 'persona' && personas.map((p, i) => (
                  <div key={i} className="bg-[#161a1d] border border-slate-800 p-8 rounded-lg shadow-xl hover:border-teal-500/40 cursor-pointer relative" onClick={() => setActiveItem(p)}>
                      <button onClick={(e) => { e.stopPropagation(); fetch(`${API_BASE}/persona/delete/${p.id}`, {method:'DELETE'}); refreshData(); }} className="absolute top-6 right-6 text-slate-700 hover:text-red-500 transition-all"><Trash2 size={18}/></button>
                      <h4 className="text-white font-black uppercase text-base mb-1">{p.name}</h4>
                      <div className="flex gap-2 mb-4">
                        <span className="text-[8px] bg-teal-500/10 text-teal-400 border border-teal-500/20 px-2 py-0.5 rounded uppercase font-black">{p.gender}</span>
                      </div>
                      <p className="text-[9px] text-slate-600 border-t border-slate-800 pt-4 italic truncate uppercase">{p.trauma}</p>
                  </div>
              ))}
          </div>
        )}

        {/* DETAIL VIEW: SEASON & SHOWRUNNER BRIEF */}
        {activeItem && activeTab === 'season' && (
            <div className="animate-in fade-in space-y-12">
                <div className="flex justify-between items-end border-b border-slate-800 pb-8">
                    <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter">{activeItem.title}</h2>
                    <button onClick={() => { setActiveItem(null); setActiveBrief(null); }} className="bg-teal-500 text-black px-8 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-xl">Return_to_Archive</button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="space-y-8 bg-black/20 p-10 border border-slate-800 rounded-xl">
                        <h4 className="text-teal-500 text-[10px] font-black uppercase mb-8 tracking-widest italic underline underline-offset-8 decoration-slate-800">Node_Sequence</h4>
                        <div className="space-y-4">
                            {activeItem.episodes?.map((ep, idx) => (
                                <div key={idx} className="p-4 bg-[#161a1d] border border-slate-800 flex justify-between items-center group hover:border-teal-500/50 transition-all">
                                    <div className="flex flex-col">
                                        <span className="text-[8px] text-teal-500 font-black uppercase tracking-tighter mb-1 opacity-50">ACT {ep.act} // NODE {idx+1}</span>
                                        <span className="text-white font-bold uppercase text-[11px] mb-1">{ep.title}</span>
                                        <span className="text-[9px] text-slate-500 italic uppercase">{ep.sub_topic}</span>
                                    </div>
                                    <button onClick={() => generateBrief(activeItem.id, idx)} className="px-4 py-2 bg-slate-800 text-teal-400 text-[8px] font-black uppercase border border-slate-700 hover:bg-teal-500 hover:text-black transition-all">Initialize_Showrunner</button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-8 bg-black/20 p-10 border border-slate-800 rounded-xl">
                        <h4 className="text-teal-500 text-[10px] font-black uppercase mb-8 tracking-widest italic underline underline-offset-8 decoration-slate-800 flex justify-between">
                            <span>Showrunner_Brief</span>
                            {activeBrief && <span className="text-slate-700 font-sans tracking-tighter italic">S{activeItem.id.slice(-4)}_E_ORDINAL</span>}
                        </h4>
                        {activeBrief ? (
                           <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                              {Object.entries(activeBrief).map(([act, content], i) => (
                                 <div key={i} className="border-l border-teal-500/30 pl-4 py-2">
                                    <span className="text-[9px] text-teal-500 font-black uppercase mb-1 block">{act}</span>
                                    <p className="text-[11px] text-slate-400 font-sans italic leading-relaxed whitespace-pre-wrap uppercase">"{content}"</p>
                                 </div>
                              ))}
                           </div>
                        ) : (
                           <div className="h-64 flex items-center justify-center border border-dashed border-slate-800 rounded text-slate-700 text-[9px] font-black uppercase tracking-[0.4em]">Select_Node_to_Orchestrate</div>
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* DETAIL VIEW: PERSONA DNA */}
        {activeItem && activeTab === 'persona' && (
            <div className="animate-in fade-in space-y-12">
                <div className="flex justify-between items-end border-b border-slate-800 pb-8">
                    <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter">{activeItem.name}</h2>
                    <button onClick={() => setActiveItem(null)} className="bg-teal-500 text-black px-8 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-xl">Return_to_Archive</button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="bg-black/20 p-10 border border-slate-800 rounded-xl space-y-8">
                        <h4 className="text-teal-500 text-[10px] font-black uppercase mb-6 flex items-center gap-2 italic tracking-widest border-b border-slate-800 pb-2"><Quote size={14}/> Full_Dossier</h4>
                        <p className="text-[12px] text-slate-400 font-sans leading-relaxed whitespace-pre-wrap">{activeItem.archive?.bio}</p>
                    </div>
                    <div className="bg-black/20 p-10 border border-slate-800 rounded-xl space-y-8">
                        <h4 className="text-teal-500 text-[10px] font-black uppercase mb-6 italic tracking-widest border-b border-slate-800 pb-2 flex justify-between">
                           <span>DNA_Memories</span>
                           <span className="text-slate-800">{activeItem.archive?.behavioral_dna?.mbti}</span>
                        </h4>
                        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                           {(activeItem.archive?.anecdotes || []).map((a, i) => (
                              <p key={i} className="p-4 bg-[#161a1d] border border-slate-800 text-[10px] text-slate-500 italic uppercase">"{a}"</p>
                           ))}
                        </div>
                    </div>
                </div>
            </div>
        )}
      </section>

      {/* PANE 3: COMMAND COMMAND CENTER (RIGHT) */}
      <section className="w-[480px] bg-[#0b0c0e] p-10 flex flex-col gap-12 overflow-y-auto border-l border-slate-800 shadow-2xl">
        {/* SPAWN PERSONA */}
        <div className="space-y-6 bg-black/30 p-8 rounded-2xl border border-slate-800">
            <h3 className="text-teal-400 text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-3"><UserPlus size={16}/> Spawn_Identity</h3>
            <div className="space-y-4">
                <input className="w-full bg-[#161a1d] p-4 border border-slate-800 text-[12px] text-white font-bold outline-none focus:border-teal-500" placeholder="NAME" value={newP.name} onChange={(e) => setNewP({...newP, name: e.target.value})} />
                <div className="grid grid-cols-2 gap-2">
                   <select className="bg-[#161a1d] p-4 border border-slate-800 text-[11px] text-teal-500 font-black outline-none" value={newP.gender} onChange={(e) => setNewP({...newP, gender: e.target.value})}>
                      {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                   </select>
                   <input className="bg-[#161a1d] p-4 border border-slate-800 text-[11px] text-slate-500 outline-none" placeholder="ROLE" value={newP.role} onChange={(e) => setNewP({...newP, role: e.target.value})} />
                </div>
                <input className="w-full bg-[#161a1d] p-4 border border-slate-800 text-[11px] text-slate-500 outline-none uppercase" placeholder="CORE_TRAUMA" value={newP.trauma} onChange={(e) => setNewP({...newP, trauma: e.target.value})} />
                <button onClick={spawnPersona} disabled={loading || !newP.name} className={`w-full py-4 text-[10px] font-black uppercase tracking-widest rounded shadow-xl transition-all ${loading || !newP.name ? 'bg-slate-900 text-slate-800 opacity-20' : 'bg-teal-500 text-black hover:bg-white'}`}>Commit_DNA</button>
            </div>
        </div>

        {/* ESTABLISH SEASON */}
        <div className="space-y-6 bg-black/30 p-8 rounded-2xl border border-slate-800">
            <h3 className="text-teal-400 text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-3"><Database size={16}/> Establish_Season</h3>
            <div className="space-y-8">
                <input className="w-full bg-[#161a1d] p-4 border border-slate-800 text-[12px] text-white font-bold outline-none focus:border-teal-500 uppercase" placeholder="TOPIC_STRING" value={newS.topic} onChange={(e) => setNewS({...newS, topic: e.target.value})} />
                
                <div className="space-y-3">
                    <p className="text-slate-600 text-[9px] font-black uppercase flex justify-between tracking-tighter italic">Archive_DNA_Pairing <span>{newS.host_ids.length}/2</span></p>
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
                </div>

                <div className="space-y-3">
                    <p className="text-slate-600 text-[9px] font-black uppercase tracking-widest italic">Host_Dynamic</p>
                    <select className="w-full bg-[#161a1d] p-4 border border-slate-800 text-[11px] text-teal-400 font-bold outline-none" value={newS.relationship} onChange={(e) => setNewS({...newS, relationship: e.target.value})}>
                        {DYNAMICS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>

                <button onClick={handleCreateSeason} disabled={loading || !newS.topic || newS.host_ids.length !== 2} className={`w-full py-6 text-[11px] font-black uppercase tracking-widest rounded transition-all shadow-2xl ${loading || !newS.topic || newS.host_ids.length !== 2 ? 'bg-slate-900 text-slate-800 opacity-20' : 'bg-teal-500 text-black hover:bg-white'}`}>
                    {loading ? 'SYNTHESIZING...' : 'Establish_Signal'}
                </button>
            </div>
        </div>
      </section>
    </div>
  );
};

export default App;
