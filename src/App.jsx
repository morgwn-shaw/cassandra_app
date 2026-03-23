import React, { useState, useEffect, useRef } from 'react';
import { Zap, Activity, Code, Cpu, Layers, Fingerprint, Trash2, Plus, PlayCircle, UserPlus, Database, Quote, X, RefreshCw, Dice5, ShieldAlert } from 'lucide-react';

const API_BASE = "https://shadow-cassandrafiles.pythonanywhere.com/api/v2";

const App = () => {
  const [activeTab, setActiveTab] = useState('season');
  const [seasons, setSeasons] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [activeItem, setActiveItem] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [liveStatus, setLiveStatus] = useState({ stage: 'IDLE', last_event: 'Ready', history: [], request_payload: '{}', response_payload: '{}' });
  
  const [newS, setNewS] = useState({ topic: '', relationship: 'Unresolved Strategic Tension (UST)', host_ids: [], episodes_count: 10 });
  const [newP, setNewP] = useState({ name: '', role: 'Auditor', trauma: '' });

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
    setNewP({ name: '', role: 'Auditor', trauma: '' });
    setLoading(false);
  };

  const handleCreateSeason = async () => {
    if (!newS.topic || newS.host_ids.length < 2) return;
    setLoading(true);
    await fetch(`${API_BASE}/season/reconcile`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(newS) });
    refreshData();
    setNewS({ topic: '', relationship: 'Unresolved Strategic Tension (UST)', host_ids: [], episodes_count: 10 });
    setLoading(false);
  };

  return (
    <div className="h-screen w-screen bg-[#1a1c1e] text-slate-300 font-mono flex overflow-hidden">
      
      {/* PANE 1: TELEMETRY (LEFT) - Industrial Look */}
      <section className="w-[450px] border-r border-slate-800 bg-[#0f1113] flex flex-col p-6 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between mb-8">
            <div className="text-teal-400 font-black uppercase text-[10px] tracking-[0.4em] flex items-center gap-2">
                <ShieldAlert size={14} className={loading ? "animate-pulse text-amber-500" : ""} /> Shadow_Kernel_v24.5
            </div>
            <button onClick={refreshData} className="text-slate-600 hover:text-teal-400"><RefreshCw size={14}/></button>
        </div>

        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
            <div className="p-4 bg-[#141619] border border-slate-800 rounded">
                <p className="text-teal-500 text-[9px] font-black uppercase mb-4 flex items-center gap-2">System_Output</p>
                <div className="h-56 overflow-y-auto space-y-1 pr-2 custom-scrollbar text-[10px]">
                    {liveStatus.history.map((log, i) => (
                        <div key={i} className={`border-l pl-3 py-1 font-bold ${log.includes('SUCCESS') ? 'text-teal-400 border-teal-400' : 'text-slate-600 border-slate-800'}`}>{log}</div>
                    ))}
                    <div ref={logEndRef} />
                </div>
            </div>
            <pre className="text-[9px] text-slate-500 bg-black/40 p-4 rounded flex-1 overflow-auto border border-slate-800">REQUEST: {liveStatus.request_payload}</pre>
            <pre className="text-[9px] text-teal-600/50 bg-black/40 p-4 rounded flex-1 overflow-auto border border-slate-800 italic">RESPONSE: {liveStatus.response_payload}</pre>
        </div>
      </section>

      {/* PANE 2: WORKSPACE (CENTER) */}
      <section className="flex-1 flex flex-col bg-[#1a1c1e] p-10 overflow-y-auto border-r border-slate-800">
        <div className="flex gap-4 mb-10 border-b border-slate-800 pb-6">
            <button onClick={() => { setActiveTab('season'); setActiveItem(null); }} className={`px-10 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'season' && !activeItem ? 'bg-teal-500 text-black' : 'bg-slate-800 hover:bg-slate-700'}`}>Seasons</button>
            <button onClick={() => { setActiveTab('persona'); setActiveItem(null); }} className={`px-10 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'persona' && !activeItem ? 'bg-teal-500 text-black' : 'bg-slate-800 hover:bg-slate-700'}`}>DNA_Registry</button>
        </div>

        {/* DATA GRID */}
        {!activeItem && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {activeTab === 'season' && seasons.map((s, i) => (
                  <div key={i} className="bg-[#23262a] border border-slate-700 p-8 rounded shadow-lg group hover:border-teal-500/50 cursor-pointer" onClick={() => setActiveItem(s)}>
                      <h4 className="text-white font-black uppercase text-base mb-1">{s.title}</h4>
                      <p className="text-[10px] text-slate-500 italic mb-10 uppercase tracking-tighter">{s.relationship}</p>
                      <div className="w-full py-3 bg-slate-800 text-teal-400 text-[9px] font-black uppercase flex items-center justify-center gap-3 border border-slate-700 group-hover:bg-teal-500 group-hover:text-black transition-all">Audit_Arc</div>
                  </div>
              ))}
              {activeTab === 'persona' && personas.map((p, i) => (
                  <div key={i} className="bg-[#23262a] border border-slate-700 p-8 rounded shadow-lg group hover:border-teal-500/50 cursor-pointer" onClick={() => setActiveItem(p)}>
                      <h4 className="text-white font-black uppercase text-base mb-1">{p.name}</h4>
                      <p className="text-[10px] text-slate-500 uppercase mb-4">{p.role}</p>
                      <p className="text-[9px] text-slate-600 italic border-t border-slate-800 pt-4 truncate">{p.trauma}</p>
                  </div>
              ))}
          </div>
        )}

        {/* DETAIL VIEWS (Same logic as 24.1 but with Slate styles) */}
        {activeItem && (
            <div className="animate-in fade-in slide-in-from-bottom-4 space-y-12">
                <div className="flex justify-between items-end border-b border-slate-800 pb-8">
                    <h2 className="text-5xl font-black text-teal-400 uppercase italic tracking-tighter">{activeItem.title || activeItem.name}</h2>
                    <button onClick={() => setActiveItem(null)} className="bg-slate-800 px-6 py-2 text-[10px] font-black uppercase hover:bg-white hover:text-black">Return</button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 text-[12px] leading-relaxed">
                    <div className="bg-black/20 p-8 border border-slate-800 rounded-lg">
                        <h4 className="text-slate-500 text-[10px] font-black uppercase mb-6 tracking-widest italic">{activeTab === 'season' ? 'Shared_Lore' : 'Biography'}</h4>
                        <div className="space-y-4">
                            {activeTab === 'season' 
                                ? activeItem.shared_lore?.map((l, i) => <p key={i} className="text-amber-200 uppercase font-mono italic">"{l}"</p>)
                                : <p className="text-slate-400 font-sans">{activeItem.archive?.bio}</p>
                            }
                        </div>
                    </div>
                    <div className="bg-black/20 p-8 border border-slate-800 rounded-lg">
                        <h4 className="text-slate-500 text-[10px] font-black uppercase mb-6 tracking-widest italic">{activeTab === 'season' ? '3-Act_Nodes' : 'DNA_Anecdotes'}</h4>
                        <div className="space-y-4 h-[500px] overflow-y-auto pr-4 custom-scrollbar">
                            {activeTab === 'season'
                                ? activeItem.episodes?.map((ep, idx) => <div key={idx} className="p-4 bg-slate-800/50 mb-2 border border-slate-700">ACT {ep.act} // {ep.title}</div>)
                                : activeItem.archive?.anecdotes?.map((a, i) => <p key={i} className="p-4 bg-slate-800/50 mb-2 border border-slate-700">"{a}"</p>)
                            }
                        </div>
                    </div>
                </div>
            </div>
        )}
      </section>

      {/* PANE 3: COMMAND (RIGHT) */}
      <section className="w-[480px] bg-[#141619] p-10 flex flex-col gap-12 overflow-y-auto border-l border-slate-800">
        
        {/* CREATE PERSONA */}
        <div className="space-y-6">
            <h3 className="text-teal-400 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2"><UserPlus size={14}/> Spawn_Identity</h3>
            <div className="space-y-4">
                <input className="w-full bg-[#1a1c1e] p-4 border border-slate-800 text-[12px] text-white font-bold" placeholder="NAME" value={newP.name} onChange={(e) => setNewP({...newP, name: e.target.value})} />
                <div className="relative">
                   <input className="w-full bg-[#1a1c1e] p-4 border border-slate-800 text-[12px] text-slate-500 pr-12" placeholder="TRAUMA (OPTIONAL)" value={newP.trauma} onChange={(e) => setNewP({...newP, trauma: e.target.value})} />
                   <button className="absolute right-4 top-4 text-slate-600 hover:text-teal-400 transition-all"><Dice5 size={18}/></button>
                </div>
                <button onClick={handleCreatePersona} disabled={loading || !newP.name} className="w-full py-4 bg-teal-500 text-black text-[10px] font-black uppercase tracking-widest hover:bg-white disabled:opacity-30 transition-all">Commit_DNA</button>
            </div>
        </div>

        <div className="h-[1px] bg-slate-800" />

        {/* CREATE SEASON */}
        <div className="space-y-6">
            <h3 className="text-teal-400 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2"><Database size={14}/> Establish_Season</h3>
            <div className="space-y-6">
                <input className="w-full bg-[#1a1c1e] p-4 border border-slate-800 text-[12px] text-white font-bold" placeholder="TOPIC_STRING" value={newS.topic} onChange={(e) => setNewS({...newS, topic: e.target.value})} />
                
                <div className="space-y-3">
                    <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest">DNA_Pairing (Need 2)</p>
                    <div className="grid grid-cols-2 gap-2">
                        {personas.map(p => (
                            <button key={p.id} onClick={() => {
                                const ids = newS.host_ids.includes(p.id) ? newS.host_ids.filter(id => id !== p.id) : [...newS.host_ids, p.id];
                                setNewS({...newS, host_ids: ids});
                            }} className={`p-4 text-[9px] font-black uppercase border transition-all ${newS.host_ids.includes(p.id) ? 'border-teal-500 bg-teal-500/10 text-teal-400' : 'border-slate-800 text-slate-600'}`}>
                                {p.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-3">
                    <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest">Relationship_Tension</p>
                    <select className="w-full bg-[#1a1c1e] p-4 border border-slate-800 text-[11px] text-teal-400 font-bold" value={newS.relationship} onChange={(e) => setNewS({...newS, relationship: e.target.value})}>
                        <option>Unresolved Strategic Tension (UST)</option>
                        <option>Grudging Mutual Respect</option>
                        <option>Professional Rivalry (Cold War)</option>
                        <option>Mentor / Protégé (Estranged)</option>
                    </select>
                </div>

                <button onClick={handleCreateSeason} disabled={loading || !newS.topic || newS.host_ids.length < 2} className="w-full py-6 bg-teal-500 text-black text-[11px] font-black uppercase tracking-widest hover:bg-white disabled:opacity-30 transition-all shadow-xl">
                    {loading ? 'Synthesizing...' : 'Establish_Signal'}
                </button>
            </div>
        </div>
      </section>
    </div>
  );
};

export default App;
