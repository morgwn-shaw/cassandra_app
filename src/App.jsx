import React, { useState, useEffect, useRef } from 'react';
import { Zap, Activity, Code, Cpu, Layers, Fingerprint, Trash2, Plus, PlayCircle, UserPlus, Database, Quote, X, Dice5, ShieldCheck, MessageSquare, Brain } from 'lucide-react';

const API_BASE = "https://shadow-cassandrafiles.pythonanywhere.com/api/v2";

const TRAUMA_POOLS = ["Witnessed a server-farm meltdown in San Jose.", "Accidentally decrypted a child's last words.", "Betrayed by a neural-link mentor.", "Developed a phobia of synthetic voices.", "Identity was stolen and used for hits.", "Escaped a digital cult."];
const GENDERS = ["Male", "Female", "Non-Binary", "Gender-Fluid", "Agender", "Trans-Masculine", "Trans-Feminine", "Random"];
const DYNAMICS = ["Unresolved Strategic Tension (UST)", "Grudging Mutual Respect", "Mentor / Protégé (Estranged)", "Bitter Professional Rivals", "Assassin and Target (Unlikely Allies)", "AI and Handler (Dysfunctional)", "The Liar and the Skeptic"];

const App = () => {
  const [activeTab, setActiveTab] = useState('season');
  const [seasons, setSeasons] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [activeItem, setActiveItem] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [liveStatus, setLiveStatus] = useState({ stage: 'IDLE', last_event: 'Ready', history: [], request_payload: '{}', response_payload: '{}', active_engine: '...' });
  
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

  const handleCreatePersona = async () => {
    if (!newP.name) return;
    setLoading(true);
    await fetch(`${API_BASE}/persona/create`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(newP) });
    refreshData();
    setNewP({ name: '', role: 'Forensic Analyst', trauma: '', gender: 'Random' });
    setLoading(false);
  };

  const handleCreateSeason = async () => {
    if (!newS.topic || newS.host_ids.length !== 2) return;
    setLoading(true);
    await fetch(`${API_BASE}/season/reconcile`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(newS) });
    refreshData();
    setLoading(false);
  };

  const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];

  return (
    <div className="h-screen w-screen bg-[#141619] text-slate-300 font-mono flex overflow-hidden">
      
      {/* PANE 1: TELEMETRY (LEFT) */}
      <section className="w-[420px] border-r border-slate-800 bg-[#0b0c0e] flex flex-col p-6 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
            <div className="text-teal-400 font-black uppercase text-[10px] tracking-[0.4em] flex items-center gap-2">
                <ShieldCheck size={14} className={loading ? "animate-pulse text-amber-500" : ""} /> Kernel_v25.0
            </div>
            <div className="text-[8px] text-slate-600 font-bold uppercase tracking-widest">{liveStatus.active_engine?.split('/')[1]}</div>
        </div>

        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
            <div className="p-4 bg-black/40 border border-slate-800 rounded">
                <p className="text-teal-500 text-[9px] font-black uppercase mb-4 flex justify-between"><span>System_Memory</span> <span>{liveStatus.stage}</span></p>
                <div className="h-40 overflow-y-auto space-y-1 pr-2 custom-scrollbar text-[10px]">
                    {liveStatus.history.map((log, i) => (
                        <div key={i} className={`border-l pl-3 py-1 font-bold ${log.includes('SUCCESS') ? 'text-teal-400 border-teal-400' : 'text-slate-600 border-slate-800'}`}>{log}</div>
                    ))}
                    <div ref={logEndRef} />
                </div>
            </div>
            <div className="flex-1 flex flex-col min-h-0 gap-4">
                <pre className="text-[9px] text-slate-600 bg-black/60 p-4 rounded border border-slate-800 flex-1 whitespace-pre-wrap overflow-auto">IN: {liveStatus.request_payload}</pre>
                <pre className="text-[9px] text-teal-600/40 bg-black/60 p-4 rounded border border-slate-800 flex-1 italic whitespace-pre-wrap font-sans overflow-auto">OUT: {liveStatus.response_payload}</pre>
            </div>
        </div>
      </section>

      {/* PANE 2: WORKSPACE (CENTER) */}
      <section className="flex-1 flex flex-col bg-[#1a1c1e] p-10 overflow-y-auto border-r border-slate-800">
        <div className="flex gap-4 mb-10 border-b border-slate-800 pb-6">
            <button onClick={() => { setActiveTab('season'); setActiveItem(null); }} className={`px-10 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'season' && !activeItem ? 'bg-teal-500 text-black shadow-lg' : 'bg-slate-800 text-slate-500 hover:text-white'}`}>Seasons</button>
            <button onClick={() => { setActiveTab('persona'); setActiveItem(null); }} className={`px-10 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'persona' && !activeItem ? 'bg-teal-500 text-black shadow-lg' : 'bg-slate-800 text-slate-500 hover:text-white'}`}>DNA_Registry</button>
        </div>

        {!activeItem && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-500">
              {activeTab === 'season' && seasons.map((s, i) => (
                  <div key={i} className="bg-[#23262a] border border-slate-700 p-8 rounded-lg shadow-xl hover:border-teal-500/40 transition-all cursor-pointer relative" onClick={() => setActiveItem(s)}>
                      <button onClick={(e) => { e.stopPropagation(); fetch(`${API_BASE}/season/delete/${s.id}`, {method:'DELETE'}); refreshData(); }} className="absolute top-6 right-6 text-slate-700 hover:text-red-500 transition-all"><Trash2 size={18}/></button>
                      <h4 className="text-white font-black uppercase text-base mb-2 tracking-tighter italic">{s.title}</h4>
                      <p className="text-[10px] text-slate-500 italic uppercase mb-8 border-l border-slate-700 pl-4">{s.relationship}</p>
                      <div className="w-full py-3 bg-slate-800 text-teal-400 text-[9px] font-black uppercase flex items-center justify-center gap-3 border border-slate-700 font-mono">View_Blueprint</div>
                  </div>
              ))}
              {activeTab === 'persona' && personas.map((p, i) => (
                  <div key={i} className="bg-[#23262a] border border-slate-700 p-8 rounded-lg shadow-xl hover:border-teal-500/40 transition-all cursor-pointer relative" onClick={() => setActiveItem(p)}>
                      <button onClick={(e) => { e.stopPropagation(); fetch(`${API_BASE}/persona/delete/${p.id}`, {method:'DELETE'}); refreshData(); }} className="absolute top-6 right-6 text-slate-700 hover:text-red-500 transition-all"><Trash2 size={18}/></button>
                      <h4 className="text-white font-black uppercase text-base mb-1 tracking-tighter">{p.name}</h4>
                      <div className="flex gap-2 mb-4">
                        <span className="text-[8px] bg-teal-500/10 text-teal-400 border border-teal-500/20 px-2 py-0.5 rounded uppercase font-black">{p.gender}</span>
                        <span className="text-[8px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded uppercase font-bold tracking-widest">{p.role}</span>
                      </div>
                      <p className="text-[9px] text-slate-600 border-t border-slate-800 pt-4 italic truncate uppercase">{p.trauma}</p>
                  </div>
              ))}
          </div>
        )}

        {/* DETAIL VIEW: FLOWING LAYOUT */}
        {activeItem && (
            <div className="animate-in fade-in slide-in-from-bottom-4 space-y-12">
                <div className="flex justify-between items-end border-b border-slate-800 pb-8">
                    <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter">{activeItem.title || activeItem.name}</h2>
                    <button onClick={() => setActiveItem(null)} className="bg-teal-500 text-black px-8 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-white shadow-lg transition-all">Back_to_Archive</button>
                </div>
                
                <div className="flex flex-col gap-12 text-[12px] leading-relaxed">
                    {/* TOP SECTION: BIO / SHARED LORE */}
                    <div className="bg-black/20 p-10 border border-slate-800 rounded-xl">
                        <h4 className="text-teal-500 text-[10px] font-black uppercase mb-8 tracking-widest italic flex items-center gap-2"><Quote size={14}/> {activeTab === 'season' ? 'Synthesized_Shared_History' : 'Full_Dossier'}</h4>
                        <div className="space-y-6">
                            {activeTab === 'season' 
                                ? activeItem.shared_lore?.map((l, i) => <p key={i} className="text-amber-200/80 uppercase font-mono italic border-l border-amber-900/40 pl-6 leading-loose">"{l}"</p>)
                                : (
                                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                    <p className="text-slate-400 font-sans whitespace-pre-wrap border-r border-slate-800 pr-8">{activeItem.archive?.bio}</p>
                                    <div className="space-y-8">
                                       <div>
                                          <h5 className="text-teal-500/50 font-black uppercase text-[10px] mb-4 flex items-center gap-2"><Brain size={12}/> Psychological_Profile</h5>
                                          <div className="grid grid-cols-2 gap-4 text-[10px] text-slate-500 uppercase font-black">
                                              <p>MBTI: <span className="text-white">{activeItem.archive?.behavioral_dna?.mbti}</span></p>
                                              <p>Social: <span className="text-white">{activeItem.archive?.behavioral_dna?.social_style}</span></p>
                                              <p>Risk: <span className="text-white">{activeItem.archive?.behavioral_dna?.risk_appetite}</span></p>
                                              <p>Cadence: <span className="text-white">{activeItem.archive?.behavioral_dna?.speech_speed}</span></p>
                                          </div>
                                       </div>
                                       <div>
                                          <h5 className="text-teal-500/50 font-black uppercase text-[10px] mb-4">Linguistic_Ticks</h5>
                                          <div className="flex flex-wrap gap-2">
                                            {activeItem.archive?.behavioral_dna?.linguistic_ticks?.map((t, i) => <span key={i} className="bg-slate-800 px-3 py-1 text-teal-400">"{t}"</span>)}
                                          </div>
                                       </div>
                                    </div>
                                  </div>
                                )
                            }
                        </div>
                    </div>

                    {/* BOTTOM SECTION: ANECDOTES / EPISODES */}
                    <div className="bg-black/20 p-10 border border-slate-800 rounded-xl">
                        <h4 className="text-teal-500 text-[10px] font-black uppercase mb-8 tracking-widest italic underline underline-offset-8 decoration-slate-800">{activeTab === 'season' ? '3-Act_Nodes_Sequence' : 'DNA_Anecdotes_Buffer'}</h4>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {activeTab === 'season'
                                ? activeItem.episodes?.map((ep, idx) => (
                                    <div key={idx} className="p-5 bg-[#23262a] border border-slate-700 flex flex-col group hover:border-teal-500/30 transition-all">
                                      <div className="flex justify-between items-center mb-2">
                                        <span className="text-[8px] text-teal-500 font-black uppercase tracking-tighter italic">ACT {ep.act} // NODE {idx+1}</span>
                                        <MessageSquare size={12} className="text-slate-700 group-hover:text-teal-500"/>
                                      </div>
                                      <span className="text-white font-bold uppercase text-[11px] mb-1">{ep.title}</span>
                                      <span className="text-[9px] text-slate-500 italic uppercase">{ep.sub_topic}</span>
                                    </div>
                                  ))
                                : activeItem.archive?.anecdotes?.map((a, i) => <p key={i} className="p-4 bg-[#23262a] border border-slate-700 text-slate-400 italic font-mono uppercase text-[10px] leading-relaxed hover:text-white transition-all">"{a}"</p>)
                            }
                        </div>
                    </div>
                </div>
            </div>
        )}
      </section>

      {/* PANE 3: COMMAND (RIGHT) */}
      <section className="w-[480px] bg-[#141619] p-10 flex flex-col gap-12 overflow-y-auto border-l border-slate-800">
        
        {/* SPAWN PERSONA */}
        <div className="space-y-6 bg-black/20 p-8 rounded-2xl border border-slate-800">
            <h3 className="text-teal-400 text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-3"><UserPlus size={16}/> Spawn_Identity</h3>
            <div className="space-y-4">
                <input className="w-full bg-[#1a1c1e] p-4 border border-slate-800 text-[12px] text-white font-bold outline-none focus:border-teal-500" placeholder="NAME" value={newP.name} onChange={(e) => setNewP({...newP, name: e.target.value})} />
                
                <div className="grid grid-cols-2 gap-2">
                   <select className="bg-[#1a1c1e] p-4 border border-slate-800 text-[11px] text-teal-500 font-bold outline-none" value={newP.gender} onChange={(e) => setNewP({...newP, gender: e.target.value})}>
                      {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                   </select>
                   <input className="bg-[#1a1c1e] p-4 border border-slate-800 text-[11px] text-slate-500" placeholder="ROLE" value={newP.role} onChange={(e) => setNewP({...newP, role: e.target.value})} />
                </div>

                <div className="relative">
                   <input className="w-full bg-[#1a1c1e] p-4 border border-slate-800 text-[11px] text-slate-500 pr-12 outline-none uppercase" placeholder="TRAUMA (OPTIONAL)" value={newP.trauma} onChange={(e) => setNewP({...newP, trauma: e.target.value})} />
                   <button onClick={() => setNewP({...newP, trauma: randomChoice(TRAUMA_POOLS)})} className="absolute right-4 top-3.5 text-slate-600 hover:text-teal-400 transition-all"><Dice5 size={20}/></button>
                </div>
                
                <button onClick={handleCreatePersona} disabled={loading || !newP.name} className={`w-full py-4 text-[10px] font-black uppercase tracking-widest transition-all rounded shadow-xl ${loading || !newP.name ? 'bg-slate-900 text-slate-800 border border-slate-800 cursor-not-allowed' : 'bg-teal-500 text-black hover:bg-white'}`}>Commit_DNA</button>
            </div>
        </div>

        {/* ESTABLISH SEASON */}
        <div className="space-y-6 bg-black/20 p-8 rounded-2xl border border-slate-800">
            <h3 className="text-teal-400 text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-3"><Database size={16}/> Establish_Season</h3>
            <div className="space-y-6">
                <input className="w-full bg-[#1a1c1e] p-4 border border-slate-800 text-[12px] text-white font-bold outline-none focus:border-teal-500 transition-all uppercase" placeholder="TOPIC_STRING" value={newS.topic} onChange={(e) => setNewS({...newS, topic: e.target.value})} />
                
                <div className="space-y-3">
                    <p className="text-slate-600 text-[9px] font-black uppercase tracking-widest flex justify-between">Pairing <span>{newS.host_ids.length}/2</span></p>
                    <div className="grid grid-cols-2 gap-2">
                        {personas.map(p => (
                            <button key={p.id} onClick={() => {
                                const ids = newS.host_ids.includes(p.id) ? newS.host_ids.filter(id => id !== p.id) : [...newS.host_ids, p.id];
                                setNewS({...newS, host_ids: ids.slice(0, 2)});
                            }} className={`p-4 text-[9px] font-black uppercase border transition-all rounded ${newS.host_ids.includes(p.id) ? 'border-teal-500 bg-teal-500/10 text-teal-400 shadow-[0_0_10px_#2dd4bf20]' : 'border-slate-800 text-slate-600 hover:text-slate-400'}`}>
                                {p.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <p className="text-slate-600 text-[9px] font-black uppercase tracking-widest italic">Dynamic</p>
                      <button onClick={() => setNewS({...newS, relationship: randomChoice(DYNAMICS)})} className="text-slate-600 hover:text-teal-400 transition-all"><Dice5 size={14}/></button>
                    </div>
                    <select className="w-full bg-[#1a1c1e] p-4 border border-slate-800 text-[11px] text-teal-400 font-bold outline-none" value={newS.relationship} onChange={(e) => setNewS({...newS, relationship: e.target.value})}>
                        {DYNAMICS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>

                <button onClick={handleCreateSeason} disabled={loading || !newS.topic || newS.host_ids.length !== 2} className={`w-full py-6 bg-teal-500 text-black text-[11px] font-black uppercase tracking-widest hover:bg-white disabled:opacity-30 transition-all shadow-2xl ${loading ? 'animate-pulse cursor-wait' : ''}`}>
                    {loading ? 'SYNTHESIZING_ARC...' : 'Establish_Signal'}
                </button>
            </div>
        </div>
      </section>
    </div>
  );
};

export default App;
