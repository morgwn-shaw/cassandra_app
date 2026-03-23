import React, { useState, useEffect, useRef } from 'react';
import { Zap, Activity, Code, Cpu, Layers, Fingerprint, Trash2, Plus, PlayCircle, UserPlus, Database, Quote, X, Terminal } from 'lucide-react';

const API_BASE = "https://shadow-cassandrafiles.pythonanywhere.com/api/v2";

const App = () => {
  const [activeTab, setActiveTab] = useState('season');
  const [seasons, setSeasons] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [activeItem, setActiveItem] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [liveStatus, setLiveStatus] = useState({ stage: 'IDLE', last_event: 'Ready', history: [], request_payload: '{}', response_payload: '{}', active_engine: '...' });
  
  const [newS, setNewS] = useState({ topic: '', relationship: 'UST', host_ids: [], episodes_count: 10 });
  const [newP, setNewP] = useState({ name: '', role: 'Auditor', trauma: '' });

  const logEndRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/status`);
        const data = await res.json();
        setLiveStatus(data);
      } catch (e) {}
    }, 1500);
    return () => clearInterval(interval);
  }, []);

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
    setNewP({ name: '', role: 'Auditor', trauma: '' });
    setLoading(false);
  };

  const establishArc = async () => {
    if (!newS.topic || newS.host_ids.length < 2) return;
    setLoading(true);
    await fetch(`${API_BASE}/season/reconcile`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(newS) });
    refreshData();
    setNewS({ topic: '', relationship: 'UST', host_ids: [], episodes_count: 10 });
    setLoading(false);
  };

  const deleteItem = async (type, id) => {
    if (!window.confirm(`Purge this ${type}?`)) return;
    await fetch(`${API_BASE}/${type}/delete/${id}`, { method: 'DELETE' });
    if (activeItem?.id === id) setActiveItem(null);
    refreshData();
  };

  return (
    <div className="h-screen w-screen bg-[#020202] text-zinc-400 font-mono flex overflow-hidden">
      
      {/* PANE 1: TELEMETRY (LEFT) */}
      <section className="w-[450px] border-r border-zinc-900 bg-black flex flex-col p-6 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between mb-8">
            <div className="text-[#00ffcc] font-black uppercase text-[10px] tracking-[0.4em] flex items-center gap-2">
                <Zap size={14} className="animate-pulse" /> Shadow_Kernel_v24.1
            </div>
            <div className="text-[8px] text-zinc-600 font-bold uppercase tracking-tighter">Engine: {liveStatus.active_engine?.split('/')[1]}</div>
        </div>

        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
            <div className="p-4 bg-zinc-950 border border-zinc-900 rounded">
                <p className="text-[#00ffcc] text-[9px] font-black uppercase mb-4 flex items-center gap-2 tracking-tighter"><Terminal size={12}/> Kernel_History</p>
                <div className="h-56 overflow-y-auto space-y-1 pr-2 custom-scrollbar text-[10px]">
                    {liveStatus.history.map((log, i) => (
                        <div key={i} className={`border-l pl-3 py-1 font-bold ${log.includes('SUCCESS') ? 'text-[#00ffcc] border-[#00ffcc]' : 'text-zinc-700 border-zinc-900'}`}>{log}</div>
                    ))}
                    <div ref={logEndRef} />
                </div>
            </div>

            <div className="p-4 bg-zinc-950 border border-zinc-900 rounded flex-1 flex flex-col overflow-hidden">
                <p className="text-purple-400 text-[9px] font-black uppercase mb-3 flex items-center gap-2"><Code size={12}/> Inbound_Payload</p>
                <pre className="text-[9px] text-zinc-700 bg-black p-3 rounded flex-1 overflow-auto whitespace-pre-wrap">{liveStatus.request_payload}</pre>
            </div>

            <div className="p-4 bg-zinc-950 border border-zinc-900 rounded flex-1 flex flex-col overflow-hidden">
                <p className="text-blue-400 text-[9px] font-black uppercase mb-3 flex items-center gap-2"><Cpu size={12}/> Engine_Response</p>
                <pre className="text-[9px] text-zinc-700 bg-black p-3 rounded flex-1 overflow-auto whitespace-pre-wrap">{liveStatus.response_payload}</pre>
            </div>
        </div>
      </section>

      {/* PANE 2: WORKSPACE (CENTER) */}
      <section className="flex-1 flex flex-col bg-[#080808] p-10 overflow-y-auto border-r border-zinc-900 relative">
        <div className="flex gap-4 mb-10 border-b border-zinc-900 pb-6">
            <button onClick={() => { setActiveTab('season'); setActiveItem(null); }} className={`px-8 py-3 text-[10px] font-black uppercase border transition-all ${activeTab === 'season' && !activeItem ? 'bg-[#00ffcc] text-black border-[#00ffcc]' : 'text-zinc-600 border-zinc-900 hover:border-zinc-700'}`}>Season_Arcs</button>
            <button onClick={() => { setActiveTab('persona'); setActiveItem(null); }} className={`px-8 py-3 text-[10px] font-black uppercase border transition-all ${activeTab === 'persona' && !activeItem ? 'bg-[#00ffcc] text-black border-[#00ffcc]' : 'text-zinc-600 border-zinc-900 hover:border-zinc-700'}`}>Persona_Vault</button>
        </div>

        {/* LIST VIEW */}
        {!activeItem && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-500">
              {activeTab === 'season' && seasons.map((s, i) => (
                  <div key={i} className="bg-black border border-zinc-900 p-8 rounded relative group hover:border-[#00ffcc]/30 transition-all cursor-pointer" onClick={() => setActiveItem(s)}>
                      <button onClick={(e) => { e.stopPropagation(); deleteItem('season', s.id); }} className="absolute top-4 right-4 text-zinc-800 hover:text-red-500"><Trash2 size={18}/></button>
                      <h4 className="text-white font-black uppercase text-base mb-1">{s.title}</h4>
                      <p className="text-[10px] text-zinc-600 italic uppercase mb-8 tracking-widest">{s.relationship} // {s.episodes?.length || 0} NODES</p>
                      <div className="w-full py-3 bg-zinc-900 text-[#00ffcc] text-[9px] font-black uppercase flex items-center justify-center gap-3 border border-zinc-800 group-hover:bg-[#00ffcc] group-hover:text-black transition-all font-mono italic">Open_Vault</div>
                  </div>
              ))}
              {activeTab === 'persona' && personas.map((p, i) => (
                  <div key={i} className="bg-black border border-zinc-900 p-8 rounded relative group hover:border-[#00ffcc]/30 transition-all cursor-pointer" onClick={() => setActiveItem(p)}>
                      <button onClick={(e) => { e.stopPropagation(); deleteItem('persona', p.id); }} className="absolute top-4 right-4 text-zinc-800 hover:text-red-500"><Trash2 size={18}/></button>
                      <h4 className="text-white font-black uppercase text-base mb-1">{p.name}</h4>
                      <p className="text-[10px] text-zinc-600 italic uppercase mb-2">{p.role}</p>
                      <p className="text-[9px] text-zinc-800 font-bold border-t border-zinc-900 pt-4 truncate uppercase tracking-tighter">{p.trauma}</p>
                  </div>
              ))}
          </div>
        )}

        {/* DETAIL VIEW: SEASON BLUEPRINT */}
        {activeItem && activeTab === 'season' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-12 h-full flex flex-col">
                <div className="flex justify-between items-center border-b border-zinc-900 pb-8">
                    <h2 className="text-4xl font-black text-[#00ffcc] uppercase italic tracking-tighter">{activeItem.title}</h2>
                    <button onClick={() => setActiveItem(null)} className="text-zinc-600 hover:text-white uppercase text-[10px] font-black flex items-center gap-2 border border-zinc-800 px-4 py-2"><X size={16}/> Close_Vault</button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 flex-1 overflow-hidden">
                    <div className="bg-black/40 border border-zinc-900 p-10 rounded-xl space-y-8 overflow-y-auto pr-4 custom-scrollbar">
                        <h4 className="text-zinc-600 text-[10px] font-black uppercase border-b border-zinc-900 pb-2 italic tracking-widest">Shared_Lore_Registry</h4>
                        <div className="space-y-6">
                            {(activeItem.shared_lore || []).map((l, i) => (
                                <p key={i} className="text-[12px] text-[#ff6666] font-mono leading-relaxed uppercase border-l border-red-900/40 pl-6 italic">"{l}"</p>
                            ))}
                        </div>
                    </div>
                    <div className="bg-black/40 border border-zinc-900 p-10 rounded-xl space-y-8 overflow-y-auto pr-4 custom-scrollbar">
                        <h4 className="text-zinc-600 text-[10px] font-black uppercase border-b border-zinc-900 pb-2 italic tracking-widest">3-Act_Nodes</h4>
                        <div className="space-y-3">
                            {(activeItem.episodes || []).map((ep, idx) => (
                                <div key={idx} className="p-4 border border-zinc-800 bg-zinc-950 flex flex-col">
                                    <p className="text-[8px] text-[#00ffcc] font-black uppercase mb-1 opacity-50 italic">Act {ep.act} // Node {idx+1}</p>
                                    <h5 className="text-[11px] font-black text-white uppercase">{ep.title}</h5>
                                    <p className="text-[10px] text-zinc-500 italic mt-1 uppercase tracking-tighter">{ep.sub_topic}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* DETAIL VIEW: PERSONA DNA */}
        {activeItem && activeTab === 'persona' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-12 h-full flex flex-col">
                <div className="flex justify-between items-center border-b border-zinc-900 pb-8">
                    <h2 className="text-4xl font-black text-[#00ffcc] uppercase italic tracking-tighter">{activeItem.name}</h2>
                    <button onClick={() => setActiveItem(null)} className="text-zinc-600 hover:text-white uppercase text-[10px] font-black flex items-center gap-2 border border-zinc-800 px-4 py-2"><X size={16}/> Exit_DNA</button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 flex-1 overflow-hidden">
                    <div className="bg-black/40 border border-zinc-900 p-10 rounded-xl flex flex-col overflow-hidden">
                        <h4 className="text-zinc-600 text-[10px] font-black uppercase border-b border-zinc-900 pb-4 mb-6 italic"><Quote size={12} className="inline mr-2"/> Character_Dossier</h4>
                        <div className="text-[13px] text-zinc-400 leading-relaxed font-sans overflow-y-auto pr-4 custom-scrollbar whitespace-pre-wrap">{activeItem.archive?.bio}</div>
                    </div>
                    <div className="bg-black/40 border border-zinc-900 p-10 rounded-xl flex flex-col overflow-hidden">
                        <h4 className="text-zinc-600 text-[10px] font-black uppercase border-b border-zinc-900 pb-4 mb-6 italic tracking-widest">Memories_&_DNA</h4>
                        <div className="space-y-4 overflow-y-auto pr-4 custom-scrollbar">
                            {(activeItem.archive?.anecdotes || []).map((a, i) => (
                                <p key={i} className="text-[10px] text-zinc-500 italic border border-zinc-900 p-4 bg-black">"{a}"</p>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )}
      </section>

      {/* PANE 3: COMMAND COMMAND CENTER (RIGHT) */}
      <section className="w-[450px] bg-black p-10 flex flex-col gap-12 overflow-y-auto border-l border-zinc-900">
        
        {/* SPAWN PERSONA */}
        <div className="space-y-6 border border-zinc-900 p-8 rounded-2xl bg-zinc-950/20">
            <h3 className="text-[#00ffcc] text-[10px] font-black uppercase flex items-center gap-2 tracking-[0.2em] mb-4"><UserPlus size={14}/> Spawn_Identity</h3>
            <div className="space-y-4">
                <input className="w-full bg-zinc-900 p-4 border border-zinc-800 text-[11px] text-[#00ffcc] font-bold outline-none uppercase placeholder-zinc-700" placeholder="IDENTITY_NAME" value={newP.name} onChange={(e) => setNewP({...newP, name: e.target.value})} />
                <input className="w-full bg-zinc-900 p-4 border border-zinc-800 text-[11px] text-zinc-500 outline-none uppercase placeholder-zinc-800" placeholder="CORE_TRAUMA" value={newP.trauma} onChange={(e) => setNewP({...newP, trauma: e.target.value})} />
                <button onClick={spawnPersona} disabled={loading || !newP.name} className={`w-full py-4 text-[10px] font-black uppercase transition-all rounded-lg ${loading || !newP.name ? 'bg-zinc-950 text-zinc-800 opacity-20 cursor-not-allowed border border-zinc-900' : 'bg-[#00ffcc] text-black shadow-lg shadow-[#00ffcc]/10 hover:bg-white'}`}>Commit_DNA</button>
            </div>
        </div>

        {/* ESTABLISH ARC */}
        <div className="space-y-6 border border-zinc-900 p-8 rounded-2xl bg-zinc-950/20">
            <h3 className="text-[#00ffcc] text-[10px] font-black uppercase flex items-center gap-2 tracking-[0.2em] mb-4"><Database size={14}/> Establish_Arc</h3>
            <div className="space-y-8">
                <input className="w-full bg-zinc-900 p-4 border border-zinc-800 text-[11px] text-[#00ffcc] font-bold outline-none uppercase placeholder-zinc-700" placeholder="AUDIT_TOPIC_STRING" value={newS.topic} onChange={(e) => setNewS({...newS, topic: e.target.value})} />
                
                <div className="space-y-3">
                    <p className="text-zinc-600 text-[9px] font-black uppercase ml-1 tracking-tighter italic">Archive_DNA_Pairing (Select 2)</p>
                    <div className="grid grid-cols-2 gap-2">
                        {personas.map(p => (
                            <button key={p.id} onClick={() => {
                                const ids = newS.host_ids.includes(p.id) ? newS.host_ids.filter(id => id !== p.id) : [...newS.host_ids, p.id];
                                setNewS({...newS, host_ids: ids});
                            }} className={`p-4 text-[9px] font-black uppercase border transition-all rounded-lg ${newS.host_ids.includes(p.id) ? 'border-[#00ffcc] text-[#00ffcc] bg-[#00ffcc]/10 shadow-[0_0_15px_#00ffcc10]' : 'border-zinc-800 text-zinc-700'}`}>
                                {p.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-3">
                    <p className="text-zinc-600 text-[9px] font-black uppercase ml-1 tracking-tighter italic">Node_Length: {newS.episodes_count}</p>
                    <input type="range" min="4" max="24" step="2" className="w-full accent-[#00ffcc]" value={newS.episodes_count} onChange={(e) => setNewS({...newS, episodes_count: e.target.value})} />
                </div>

                <button 
                    onClick={establishArc} 
                    disabled={loading || !newS.topic || newS.host_ids.length < 2} 
                    className={`w-full py-6 text-[11px] font-black uppercase tracking-widest transition-all rounded-xl ${loading || !newS.topic || newS.host_ids.length < 2 ? 'bg-zinc-950 text-zinc-800 opacity-20 cursor-not-allowed border border-zinc-900' : 'bg-[#00ffcc] text-black shadow-xl shadow-[#00ffcc]/10 hover:bg-white'}`}
                >
                    {loading ? 'SYNTHESIZING...' : 'Establish_Signal'}
                </button>
                
                {loading && (
                    <div className="flex items-center justify-center gap-3 text-zinc-600 animate-pulse text-[9px] font-black uppercase tracking-widest">
                        <Activity size={12}/> Engine_Handshake_In_Progress
                    </div>
                )}
            </div>
        </div>
      </section>
    </div>
  );
};

export default App;
