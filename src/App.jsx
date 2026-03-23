import React, { useState, useEffect } from 'react';
import { Zap, Activity, Code, Cpu, Layers, Fingerprint, Trash2, Plus, PlayCircle, UserPlus, Database, AlertTriangle } from 'lucide-react';

const API_BASE = "https://shadow-cassandrafiles.pythonanywhere.com/api/v2";

const App = () => {
  const [activeTab, setActiveTab] = useState('season');
  const [seasons, setSeasons] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [liveStatus, setLiveStatus] = useState({ stage: 'IDLE', last_event: 'Ready', history: [], active_engine: '...', request_payload: '{}', response_payload: '{}' });

  // Creation States
  const [newS, setNewS] = useState({ topic: '', relationship: 'UST', host_ids: [], episodes_count: 10 });
  const [newP, setNewP] = useState({ name: '', role: 'Auditor', trauma: '' });

  // POLLING: Mandatory 1s heartbeat
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/status`);
        setLiveStatus(await res.json());
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

  const spawnPersona = async () => {
    if (!newP.name) return;
    setLoading(true);
    await fetch(`${API_BASE}/persona/create`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(newP) });
    await refreshData();
    setLoading(false);
    setNewP({ name: '', role: 'Auditor', trauma: '' });
  };

  const establishArc = async () => {
    if (!newS.topic || newS.host_ids.length < 2) return;
    setLoading(true);
    await fetch(`${API_BASE}/season/reconcile`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(newS) });
    await refreshData();
    setLoading(false);
    setNewS({ topic: '', relationship: 'UST', host_ids: [], episodes_count: 10 });
  };

  return (
    <div className="h-screen w-screen bg-[#050505] text-zinc-400 font-mono flex overflow-hidden">
      
      {/* LEFT: TELEMETRY & LOGS */}
      <section className="w-[400px] border-r border-zinc-900 bg-black flex flex-col p-6 shadow-2xl">
        <div className="flex items-center gap-3 text-[#00ffcc] mb-8">
            <Zap size={16} className="animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Shadow_Console v23</span>
        </div>

        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
            <div className="p-4 bg-zinc-950 border border-zinc-900 rounded">
                <p className="text-[#00ffcc] text-[9px] font-black uppercase mb-4 flex items-center gap-2"><Activity size={12}/> System_Log</p>
                <div className="h-64 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    {liveStatus.history.map((log, i) => (
                        <div key={i} className="text-[10px] text-zinc-600 border-l border-zinc-800 pl-3 leading-tight font-bold">{log}</div>
                    ))}
                </div>
            </div>

            <div className="p-4 bg-zinc-950 border border-zinc-900 rounded flex-1 flex flex-col">
                <p className="text-purple-400 text-[9px] font-black uppercase mb-4 flex items-center gap-2"><Code size={12}/> Request_Payload</p>
                <pre className="text-[9px] text-zinc-700 bg-black p-3 rounded flex-1 overflow-auto whitespace-pre-wrap">{liveStatus.request_payload}</pre>
            </div>

            <div className="p-4 bg-zinc-950 border border-zinc-900 rounded flex-1 flex flex-col">
                <p className="text-blue-400 text-[9px] font-black uppercase mb-4 flex items-center gap-2"><Cpu size={12}/> Engine_Response</p>
                <pre className="text-[9px] text-zinc-700 bg-black p-3 rounded flex-1 overflow-auto whitespace-pre-wrap">{liveStatus.response_payload}</pre>
            </div>
        </div>
      </section>

      {/* MIDDLE: THE WORKSPACE */}
      <section className="flex-1 flex flex-col p-10 bg-[#080808] overflow-y-auto">
        <div className="flex gap-4 mb-10 border-b border-zinc-900 pb-6">
            <button onClick={() => setActiveTab('season')} className={`px-8 py-3 text-[10px] font-black uppercase tracking-widest border transition-all ${activeTab === 'season' ? 'bg-[#00ffcc] text-black border-[#00ffcc]' : 'text-zinc-600 border-zinc-900'}`}>Season_Arcs</button>
            <button onClick={() => setActiveTab('persona')} className={`px-8 py-3 text-[10px] font-black uppercase tracking-widest border transition-all ${activeTab === 'persona' ? 'bg-[#00ffcc] text-black border-[#00ffcc]' : 'text-zinc-600 border-zinc-900'}`}>Persona_DNA</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeTab === 'season' && seasons.map((s, i) => (
                <div key={i} className="bg-black border border-zinc-900 p-6 rounded relative group hover:border-[#00ffcc]/30 transition-all">
                    <button onClick={async () => { await fetch(`${API_BASE}/season/delete/${s.id}`, {method:'DELETE'}); refreshData(); }} className="absolute top-4 right-4 text-zinc-800 hover:text-red-500"><Trash2 size={18}/></button>
                    <h4 className="text-white font-black uppercase text-sm mb-1">{s.title}</h4>
                    <p className="text-[9px] text-zinc-600 italic uppercase mb-6">{s.relationship} // {s.episodes_count} NODES</p>
                    <button className="w-full py-3 bg-zinc-900 text-[#00ffcc] text-[9px] font-black uppercase border border-zinc-800 hover:bg-[#00ffcc] hover:text-black">Open_Vault</button>
                </div>
            ))}
            
            {activeTab === 'persona' && personas.map((p, i) => (
                <div key={i} className="bg-black border border-zinc-900 p-6 rounded hover:border-[#00ffcc]/30 transition-all">
                    <h4 className="text-white font-black uppercase text-sm mb-1">{p.name}</h4>
                    <p className="text-[9px] text-zinc-600 italic uppercase mb-2">{p.role}</p>
                    <p className="text-[8px] text-zinc-800 font-bold border-t border-zinc-900 pt-4 truncate">{p.trauma}</p>
                </div>
            ))}
        </div>
      </section>

      {/* RIGHT: COMMAND CENTER */}
      <section className="w-[450px] border-l border-zinc-900 bg-black p-8 flex flex-col gap-10 shadow-2xl overflow-y-auto">
        
        {/* SPAWN PERSONA */}
        <div className="space-y-6">
            <h3 className="text-[#00ffcc] text-[10px] font-black uppercase flex items-center gap-2 tracking-widest"><UserPlus size={14}/> Spawn_Identity</h3>
            <div className="space-y-4">
                <input className="w-full bg-zinc-950 p-4 border border-zinc-900 text-[11px] text-[#00ffcc] font-bold" placeholder="NAME" value={newP.name} onChange={(e) => setNewP({...newP, name: e.target.value})} />
                <input className="w-full bg-zinc-950 p-4 border border-zinc-900 text-[11px] text-zinc-500" placeholder="TRAUMA_ROOT" value={newP.trauma} onChange={(e) => setNewP({...newP, trauma: e.target.value})} />
                <button onClick={spawnPersona} disabled={loading || !newP.name} className={`w-full py-4 text-[10px] font-black uppercase transition-all ${loading || !newP.name ? 'bg-zinc-900 text-zinc-700 cursor-not-allowed' : 'bg-[#00ffcc] text-black shadow-[0_0_15px_#00ffcc20]'}`}>Commit_DNA</button>
            </div>
        </div>

        <div className="h-[1px] bg-zinc-900" />

        {/* ESTABLISH ARC */}
        <div className="space-y-6">
            <h3 className="text-[#00ffcc] text-[10px] font-black uppercase flex items-center gap-2 tracking-widest"><Database size={14}/> Establish_Arc</h3>
            <div className="space-y-6">
                <input className="w-full bg-zinc-950 p-4 border border-zinc-900 text-[11px] text-[#00ffcc] font-bold uppercase" placeholder="AUDIT_TOPIC" value={newS.topic} onChange={(e) => setNewS({...newS, topic: e.target.value})} />
                
                <div className="space-y-3">
                    <p className="text-zinc-600 text-[9px] font-black uppercase">DNA_Pairing (Need 2)</p>
                    <div className="grid grid-cols-2 gap-2">
                        {personas.map(p => (
                            <button key={p.id} onClick={() => {
                                const ids = newS.host_ids.includes(p.id) ? newS.host_ids.filter(id => id !== p.id) : [...newS.host_ids, p.id];
                                setNewS({...newS, host_ids: ids});
                            }} className={`p-3 text-[9px] font-black uppercase border transition-all ${newS.host_ids.includes(p.id) ? 'border-[#00ffcc] text-[#00ffcc] bg-[#00ffcc]/10' : 'border-zinc-900 text-zinc-700 hover:border-zinc-700'}`}>
                                {p.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-3">
                    <p className="text-zinc-600 text-[9px] font-black uppercase">Node_Count: {newS.episodes_count}</p>
                    <input type="range" min="4" max="24" step="2" className="w-full accent-[#00ffcc]" value={newS.episodes_count} onChange={(e) => setNewS({...newS, episodes_count: e.target.value})} />
                </div>

                <button 
                    onClick={establishArc} 
                    disabled={loading || !newS.topic || newS.host_ids.length < 2} 
                    className={`w-full py-5 text-[10px] font-black uppercase tracking-widest transition-all ${loading || !newS.topic || newS.host_ids.length < 2 ? 'bg-zinc-950 text-zinc-800 border border-zinc-900 cursor-not-allowed opacity-50' : 'bg-[#00ffcc] text-black shadow-[0_0_20px_#00ffcc30]'}`}
                >
                    {loading ? 'Synthesizing...' : 'Establish_Signal'}
                </button>
                
                {newS.host_ids.length < 2 && (
                    <div className="flex items-center gap-2 text-zinc-700 text-[8px] font-black uppercase tracking-tighter">
                        <AlertTriangle size={10}/> DNA_Insufficient: Pair identity profiles
                    </div>
                )}
            </div>
        </div>
      </section>
    </div>
  );
};

export default App;
