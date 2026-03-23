import React, { useState, useEffect } from 'react';
import { Zap, Activity, Code, Cpu, Layers, Fingerprint, Trash2, Plus, PlayCircle, UserPlus, Database, Quote } from 'lucide-react';

const API_BASE = "https://shadow-cassandrafiles.pythonanywhere.com/api/v2";

const App = () => {
  const [activeTab, setActiveTab] = useState('season');
  const [seasons, setSeasons] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [activeSeason, setActiveSeason] = useState(null);
  const [activePersona, setActivePersona] = useState(null);
  const [loading, setLoading] = useState(false);
  const [liveStatus, setLiveStatus] = useState({ stage: 'IDLE', last_event: 'Ready', history: [], active_engine: '...', request_payload: '{}', response_payload: '{}' });

  // Input States
  const [newS, setNewS] = useState({ topic: '', relationship: 'UST', host_ids: [], episodes_count: 10 });
  const [newP, setNewP] = useState({ name: '', role: 'Auditor', trauma: '' });

  // Mandatory 1s Polling for the God-Mode Terminal
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/status`);
        const data = await res.json();
        setLiveStatus(data);
        // If an action just finished, refresh our lists
        if (data.stage === 'SUCCESS') refreshData();
      } catch (e) {}
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => { refreshData(); }, []);

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
    setNewP({ name: '', role: 'Auditor', trauma: '' });
    setLoading(false);
  };

  const handleCreateSeason = async () => {
    if (!newS.topic || newS.host_ids.length < 2) return;
    setLoading(true);
    await fetch(`${API_BASE}/season/reconcile`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(newS) });
    setNewS({ topic: '', relationship: 'UST', host_ids: [], episodes_count: 10 });
    setLoading(false);
  };

  return (
    <div className="h-screen w-screen bg-[#050505] text-zinc-400 font-mono flex overflow-hidden">
      
      {/* PANE 1: TELEMETRY (LEFT) */}
      <section className="w-[400px] border-r border-zinc-900 bg-black flex flex-col p-6 shadow-2xl overflow-hidden">
        <div className="flex items-center gap-3 text-[#00ffcc] mb-8">
            <Zap size={16} className="animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Shadow_Kernel_v23.5</span>
        </div>

        <div className="flex-1 flex flex-col gap-4 min-h-0">
            <div className="p-4 bg-zinc-950 border border-zinc-900 rounded">
                <p className="text-[#00ffcc] text-[9px] font-black uppercase mb-4 flex items-center gap-2"><Activity size={12}/> Kernel_History</p>
                <div className="h-48 overflow-y-auto space-y-2 pr-2 custom-scrollbar text-[10px]">
                    {liveStatus.history.map((log, i) => (
                        <div key={i} className={`border-l pl-3 py-1 font-bold ${log.includes('SUCCESS') ? 'text-[#00ffcc] border-[#00ffcc]' : 'text-zinc-700 border-zinc-900'}`}>{log}</div>
                    ))}
                </div>
            </div>
            <div className="p-4 bg-zinc-950 border border-zinc-900 rounded flex-1 flex flex-col min-h-0">
                <p className="text-purple-400 text-[9px] font-black uppercase mb-3 flex items-center gap-2"><Code size={12}/> Inbound_JSON</p>
                <pre className="text-[9px] text-zinc-700 bg-black p-3 rounded flex-1 overflow-auto whitespace-pre-wrap">{liveStatus.request_payload}</pre>
            </div>
            <div className="p-4 bg-zinc-950 border border-zinc-900 rounded flex-1 flex flex-col min-h-0">
                <p className="text-blue-400 text-[9px] font-black uppercase mb-3 flex items-center gap-2"><Cpu size={12}/> Engine_Response</p>
                <pre className="text-[9px] text-zinc-700 bg-black p-3 rounded flex-1 overflow-auto whitespace-pre-wrap">{liveStatus.response_payload}</pre>
            </div>
        </div>
      </section>

      {/* PANE 2: WORKSPACE (CENTER) */}
      <section className="flex-1 flex flex-col bg-[#080808] p-10 overflow-y-auto border-r border-zinc-900">
        <div className="flex gap-4 mb-10 border-b border-zinc-900 pb-6">
            <button onClick={() => { setActiveTab('season'); setActiveSeason(null); }} className={`px-8 py-3 text-[10px] font-black uppercase tracking-widest border transition-all ${activeTab === 'season' ? 'bg-[#00ffcc] text-black border-[#00ffcc]' : 'text-zinc-600 border-zinc-900 hover:border-zinc-700'}`}>Season_Arcs</button>
            <button onClick={() => { setActiveTab('persona'); setActivePersona(null); }} className={`px-8 py-3 text-[10px] font-black uppercase tracking-widest border transition-all ${activeTab === 'persona' ? 'bg-[#00ffcc] text-black border-[#00ffcc]' : 'text-zinc-600 border-zinc-900 hover:border-zinc-700'}`}>DNA_Vault</button>
        </div>

        {/* LIST VIEW */}
        {!activeSeason && !activePersona && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeTab === 'season' && seasons.map((s, i) => (
                  <div key={i} className="bg-black border border-zinc-900 p-8 rounded relative group hover:border-[#00ffcc]/30 transition-all">
                      <button onClick={async () => { await fetch(`${API_BASE}/season/delete/${s.id}`, {method:'DELETE'}); refreshData(); }} className="absolute top-4 right-4 text-zinc-800 hover:text-red-500"><Trash2 size={18}/></button>
                      <h4 className="text-white font-black uppercase text-base mb-2">{s.title}</h4>
                      <p className="text-[10px] text-zinc-600 italic uppercase mb-8">{s.relationship} // {s.episodes?.length || 0} NODES</p>
                      <button onClick={() => setActiveSeason(s)} className="w-full py-4 bg-zinc-900 text-[#00ffcc] text-[10px] font-black uppercase border border-zinc-800 hover:bg-[#00ffcc] hover:text-black">Open_Blueprint</button>
                  </div>
              ))}
              {activeTab === 'persona' && personas.map((p, i) => (
                  <div key={i} onClick={() => setActivePersona(p)} className="bg-black border border-zinc-900 p-8 rounded cursor-pointer hover:border-[#00ffcc]/30 transition-all flex flex-col min-h-[160px]">
                      <h4 className="text-white font-black uppercase text-base mb-2">{p.name}</h4>
                      <p className="text-[10px] text-zinc-600 italic uppercase mb-6">{p.role}</p>
                      <p className="mt-auto text-[9px] text-zinc-800 font-bold border-t border-zinc-900 pt-4 uppercase truncate">{p.trauma}</p>
                  </div>
              ))}
          </div>
        )}

        {/* DETAIL VIEW: SEASON VAULT */}
        {activeSeason && (
            <div className="animate-in fade-in duration-500 space-y-12">
                <div className="flex justify-between items-center border-b border-zinc-900 pb-8">
                    <h2 className="text-4xl font-black text-[#00ffcc] italic uppercase tracking-tighter">{activeSeason.title}</h2>
                    <button onClick={() => setActiveSeason(null)} className="text-zinc-600 hover:text-white uppercase text-[10px] font-black flex items-center gap-2"><X size={16}/> Close_Vault</button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="space-y-8 border border-zinc-900 p-10 bg-black/40 rounded-xl">
                        <h4 className="text-zinc-600 text-[10px] font-black uppercase border-b border-zinc-900 pb-2 italic">Synthesized_Shared_Lore</h4>
                        <div className="space-y-6">
                            {(activeSeason.shared_lore || []).map((l, i) => (
                                <p key={i} className="text-[12px] text-[#ff6666] font-mono leading-relaxed uppercase border-l border-red-900/30 pl-4 italic">"{l}"</p>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-8 border border-zinc-900 p-10 bg-black/40 rounded-xl">
                        <h4 className="text-zinc-600 text-[10px] font-black uppercase border-b border-zinc-900 pb-2 italic">3-Act_Blueprints</h4>
                        <div className="space-y-4">
                            {(activeSeason.episodes || []).map((ep, idx) => (
                                <div key={idx} className="p-4 border border-zinc-800 bg-zinc-950 flex justify-between items-center">
                                    <div>
                                        <p className="text-[8px] text-[#00ffcc] font-black uppercase mb-1 opacity-50 italic tracking-tighter">Act {ep.act} // Node {idx+1}</p>
                                        <h5 className="text-[11px] font-black text-white uppercase">{ep.title}</h5>
                                        <p className="text-[10px] text-zinc-500 italic mt-1 uppercase tracking-tighter">{ep.sub_topic}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* DETAIL VIEW: PERSONA DNA */}
        {activePersona && (
            <div className="animate-in fade-in duration-500 space-y-12">
                <div className="flex justify-between items-center border-b border-zinc-900 pb-8">
                    <h2 className="text-4xl font-black text-[#00ffcc] italic uppercase tracking-tighter">{activePersona.name}</h2>
                    <button onClick={() => setActivePersona(null)} className="text-zinc-600 hover:text-white uppercase text-[10px] font-black flex items-center gap-2"><X size={16}/> Exit_Vault</button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="space-y-8 border border-zinc-900 p-10 bg-black/40 rounded-xl flex flex-col">
                        <h4 className="text-zinc-600 text-[10px] font-black uppercase border-b border-zinc-900 pb-2 italic flex items-center gap-2"><Quote size={12}/> Character_Dossier</h4>
                        <div className="text-[12px] text-zinc-400 leading-relaxed font-sans flex-1 overflow-y-auto pr-4">{activePersona.archive?.bio || "No biography found."}</div>
                    </div>
                    <div className="space-y-8 border border-zinc-900 p-10 bg-black/40 rounded-xl overflow-hidden flex flex-col h-[600px]">
                        <h4 className="text-zinc-600 text-[10px] font-black uppercase border-b border-zinc-900 pb-2 italic">Archive_Anecdotes</h4>
                        <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                            {(activePersona.archive?.anecdotes || []).map((a, i) => (
                                <p key={i} className="text-[10px] text-zinc-500 italic bg-black p-4 border border-zinc-900">"{a}"</p>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )}
      </section>

      {/* PANE 3: COMMAND COMMAND CENTER (RIGHT) */}
      <section className="w-[450px] border-l border-zinc-900 bg-black p-10 flex flex-col gap-12 overflow-y-auto">
        
        {/* SPAWN PERSONA */}
        <div className="space-y-6 border border-zinc-900 p-6 rounded-xl bg-zinc-950/20">
            <h3 className="text-[#00ffcc] text-[10px] font-black uppercase flex items-center gap-2 tracking-widest underline underline-offset-8 decoration-zinc-800 mb-4"><UserPlus size={14}/> Spawn_Identity</h3>
            <div className="space-y-4">
                <input className="w-full bg-zinc-900 p-4 border border-zinc-800 text-[11px] text-[#00ffcc] font-bold outline-none" placeholder="NAME" value={newP.name} onChange={(e) => setNewP({...newP, name: e.target.value})} />
                <input className="w-full bg-zinc-900 p-4 border border-zinc-800 text-[11px] text-zinc-500 outline-none" placeholder="ROOT_TRAUMA" value={newP.trauma} onChange={(e) => setNewP({...newP, trauma: e.target.value})} />
                <button onClick={spawnPersona} disabled={loading || !newP.name} className={`w-full py-4 text-[10px] font-black uppercase transition-all rounded-lg ${loading || !newP.name ? 'bg-zinc-950 text-zinc-800 opacity-30 cursor-not-allowed' : 'bg-[#00ffcc] text-black shadow-lg shadow-[#00ffcc]/10 hover:bg-white'}`}>Commit_DNA</button>
            </div>
        </div>

        {/* ESTABLISH ARC */}
        <div className="space-y-6 border border-zinc-900 p-6 rounded-xl bg-zinc-950/20">
            <h3 className="text-[#00ffcc] text-[10px] font-black uppercase flex items-center gap-2 tracking-widest underline underline-offset-8 decoration-zinc-800 mb-4"><Database size={14}/> Establish_Arc</h3>
            <div className="space-y-6">
                <input className="w-full bg-zinc-900 p-4 border border-zinc-800 text-[11px] text-[#00ffcc] font-bold outline-none uppercase" placeholder="AUDIT_TOPIC_STRING" value={newS.topic} onChange={(e) => setNewS({...newS, topic: e.target.value})} />
                
                <div className="space-y-3">
                    <p className="text-zinc-600 text-[9px] font-black uppercase ml-1">Archive_DNA_Pairing (Need 2)</p>
                    <div className="grid grid-cols-2 gap-2">
                        {personas.map(p => (
                            <button key={p.id} onClick={() => {
                                const ids = newS.host_ids.includes(p.id) ? newS.host_ids.filter(id => id !== p.id) : [...newS.host_ids, p.id];
                                setNewS({...newS, host_ids: ids});
                            }} className={`p-4 text-[9px] font-black uppercase border transition-all rounded-lg ${newS.host_ids.includes(p.id) ? 'border-[#00ffcc] text-[#00ffcc] bg-[#00ffcc]/10' : 'border-zinc-800 text-zinc-700 hover:border-zinc-600'}`}>
                                {p.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-3">
                    <p className="text-zinc-600 text-[9px] font-black uppercase ml-1 tracking-tighter">Node_Length: {newS.episodes_count}</p>
                    <input type="range" min="4" max="24" step="2" className="w-full accent-[#00ffcc]" value={newS.episodes_count} onChange={(e) => setNewS({...newS, episodes_count: e.target.value})} />
                </div>

                <button 
                    onClick={handleCreateSeason} 
                    disabled={loading || !newS.topic || newS.host_ids.length < 2} 
                    className={`w-full py-6 text-[11px] font-black uppercase tracking-widest transition-all rounded-xl ${loading || !newS.topic || newS.host_ids.length < 2 ? 'bg-zinc-950 text-zinc-800 opacity-20 cursor-not-allowed' : 'bg-[#00ffcc] text-black shadow-xl shadow-[#00ffcc]/10 hover:bg-white'}`}
                >
                    {loading ? 'RECONCILING...' : 'Establish_Signal'}
                </button>
                
                {newS.host_ids.length < 2 && !loading && (
                    <div className="text-zinc-800 text-[8px] font-black uppercase text-center flex items-center justify-center gap-2">
                       Awaiting Identity Selection
                    </div>
                )}
            </div>
        </div>
      </section>
    </div>
  );
};

export default App;
