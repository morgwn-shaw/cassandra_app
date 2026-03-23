import React, { useState, useEffect } from 'react';
import { Layers, User, Plus, Cpu, Eye, Trash2, PlayCircle, X, Activity, Database, AlertCircle } from 'lucide-react';

const API_BASE = "[https://shadow-cassandrafiles.pythonanywhere.com/api/v2](https://shadow-cassandrafiles.pythonanywhere.com/api/v2)";

const App = () => {
  const [activeTab, setActiveTab] = useState('season');
  const [seasons, setSeasons] = useState([]);
  const [activeSeason, setActiveSeason] = useState(null);
  const [personas, setPersonas] = useState([]);
  const [showSeasonModal, setShowSeasonModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [liveStatus, setLiveStatus] = useState({ stage: 'IDLE', last_event: 'System Ready' });
  const [newS, setNewS] = useState({ topic: '', relationship: 'UST', host_ids: [], episodes_count: 10 });

  useEffect(() => { refreshData(); }, []);

  // Polling for live AI feedback
  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(async () => {
        const res = await fetch(`${API_BASE}/status`);
        const data = await res.json();
        setLiveStatus(data);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const refreshData = async () => {
    const sRes = await fetch(`${API_BASE}/season/list`);
    const sData = await sRes.json();
    setSeasons(Array.isArray(sData) ? sData : []);
    const pRes = await fetch(`${API_BASE}/persona/list`);
    setPersonas(await pRes.json() || []);
  };

  const handleCreateSeason = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/season/reconcile`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newS)
      });
      if (!res.ok) throw new Error("AI Failed to generate Blueprint.");
      setShowSeasonModal(false);
      refreshData();
    } catch (e) { 
      setLiveStatus({ stage: 'ERROR', last_event: e.message });
    } finally { setLoading(false); }
  };

  const deleteArc = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("PURGE DATA?")) {
      await fetch(`${API_BASE}/season/delete/${id}`, { method: 'DELETE' });
      refreshData();
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 font-mono flex">
      {/* SIDEBAR */}
      <nav className="w-80 border-r border-zinc-900 bg-black/50 p-8 flex flex-col shadow-2xl">
        <div className="text-[#00ffcc] font-black uppercase text-[10px] mb-8 flex items-center gap-2 tracking-widest">
          <div className="w-2 h-2 bg-[#00ffcc] animate-pulse" /> Shadow_v20.1
        </div>
        
        <div className="flex flex-col gap-2">
          {['season', 'persona', 'vault'].map(t => (
            <button key={t} onClick={() => setActiveTab(t)} className={`flex items-center gap-4 py-3 px-4 text-[10px] font-bold uppercase rounded ${activeTab === t ? 'text-[#00ffcc] bg-[#00ffcc]/5 border-l-2 border-[#00ffcc]' : 'text-zinc-600 hover:text-zinc-300'}`}>
              {t === 'season' && <Layers size={16}/>}
              {t === 'persona' && <User size={16}/>}
              {t === 'vault' && <Eye size={16}/>}
              {t}
            </button>
          ))}
        </div>

        {/* TELEMETRY */}
        <div className={`mt-8 p-5 border rounded bg-black/80 ${liveStatus.stage === 'ERROR' ? 'border-red-500' : 'border-zinc-900'}`}>
           <p className="text-zinc-600 mb-2 flex items-center gap-2 uppercase text-[8px] font-black"><Activity size={10}/> Telemetry</p>
           <div className={`font-black uppercase text-[10px] ${liveStatus.stage === 'ERROR' ? 'text-red-500' : 'text-[#00ffcc]'}`}>{liveStatus.stage}</div>
           <div className="text-zinc-500 text-[9px] mt-2 italic leading-tight">{liveStatus.last_event}</div>
        </div>
      </nav>

      {/* MAIN VIEW */}
      <main className="flex-1 p-16 overflow-y-auto">
        <header className="mb-16 flex justify-between items-end border-b border-zinc-900 pb-8">
           <h1 className="text-5xl font-black uppercase text-white italic tracking-tighter">{activeTab}</h1>
           <button onClick={() => setShowSeasonModal(true)} className="bg-[#00ffcc] text-black px-10 py-4 text-[10px] font-black uppercase hover:bg-white shadow-lg"><Plus size={14}/> Establish Arc</button>
        </header>

        {activeTab === 'season' && (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {seasons.map((s, i) => (
               <div key={i} className="border border-zinc-900 bg-zinc-950 rounded relative group hover:border-[#00ffcc]/30 transition-all cursor-pointer overflow-hidden flex flex-col">
                 <button onClick={(e) => deleteArc(e, s.id)} className="w-full bg-red-950/20 py-2 text-red-500 text-[8px] font-black uppercase border-b border-zinc-900 hover:bg-red-500 hover:text-white transition-all">
                    [ Purge Archive Record ]
                 </button>
                 <div className="p-8" onClick={() => { setActiveSeason(s); setActiveTab('vault'); }}>
                    <h4 className="text-sm font-black uppercase text-white mb-2">{s.title}</h4>
                    <p className="text-[9px] text-zinc-600 mb-6 italic">{s.relationship} // {s.episodes_count} NODES</p>
                    <div className="w-full py-4 bg-zinc-900 text-[#00ffcc] text-[9px] font-black uppercase flex items-center justify-center gap-3 border border-zinc-800 group-hover:bg-[#00ffcc] group-hover:text-black">
                        <PlayCircle size={14}/> View_Blueprint
                    </div>
                 </div>
               </div>
             ))}
           </div>
        )}

        {activeTab === 'vault' && activeSeason && (
           <div className="animate-in fade-in duration-500">
              <div className="mb-12 flex items-center gap-4 text-[#00ffcc] border-b border-zinc-900 pb-8">
                <Database size={24}/>
                <h2 className="text-3xl font-black uppercase italic tracking-widest">{activeSeason.title}</h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-12">
                  <div className="border border-zinc-900 p-12 rounded bg-zinc-950/50">
                    <h3 className="text-zinc-500 text-xs font-black uppercase mb-8 border-b border-zinc-900 pb-4 italic">Secret Shared History</h3>
                    <div className="text-[13px] text-[#ff6666] font-mono leading-relaxed uppercase tracking-tighter">
                      {activeSeason.lore}
                    </div>
                  </div>
                </div>
                
                <div className="border border-zinc-900 p-12 rounded bg-zinc-950/50">
                  <h3 className="text-zinc-500 text-xs font-black uppercase mb-8 border-b border-zinc-900 pb-4 italic tracking-widest">3-Act Episode Nodes</h3>
                  <div className="space-y-6">
                    {(activeSeason.episodes || []).map((ep, idx) => (
                      <div key={idx} className="border-l-2 border-zinc-800 pl-4 py-3 hover:border-[#00ffcc] transition-all">
                        <p className="text-[8px] text-[#00ffcc] font-black uppercase mb-1 italic">ACT {ep.act} // Node {idx + 1}</p>
                        <h5 className="text-[11px] font-black text-white uppercase">{ep.title}</h5>
                        <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-tighter italic">{ep.sub_topic}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
           </div>
        )}
      </main>

      {/* MODAL */}
      {showSeasonModal && (
        <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-6 backdrop-blur-md">
          <div className="bg-zinc-950 border border-zinc-800 p-12 rounded-2xl max-w-xl w-full">
            <h2 className="text-3xl font-black uppercase mb-10 italic text-white tracking-tighter italic">Establish_Arc</h2>
            <div className="space-y-10">
              <input className="w-full bg-zinc-900 p-5 border border-zinc-800 text-[#00ffcc] font-bold outline-none" placeholder="AUDIT_TOPIC_STRING" value={newS.topic} onChange={(e) => setNewS({...newS, topic: e.target.value})} />
              
              <div className="space-y-3">
                <label className="text-[9px] text-zinc-500 uppercase font-black">Season_Length ({newS.episodes_count} Nodes)</label>
                <input type="range" min="4" max="24" step="2" className="w-full accent-[#00ffcc]" value={newS.episodes_count} onChange={(e) => setNewS({...newS, episodes_count: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {personas.map(p => (
                  <button key={p.id} onClick={() => {
                    const updated = newS.host_ids.includes(p.id) ? newS.host_ids.filter(id => id !== p.id) : [...newS.host_ids, p.id];
                    setNewS({...newS, host_ids: updated});
                  }} className={`p-4 text-[10px] font-black uppercase border transition-all text-left ${newS.host_ids.includes(p.id) ? 'border-[#00ffcc] text-[#00ffcc] bg-[#00ffcc]/5' : 'border-zinc-800 text-zinc-700'}`}>
                    {p.name}
                  </button>
                ))}
              </div>
              <button onClick={handleCreateSeason} disabled={loading} className={`w-full py-6 font-black uppercase tracking-widest transition-all ${loading ? 'bg-zinc-900 text-[#00ffcc] animate-pulse' : 'bg-[#00ffcc] text-black hover:bg-white shadow-lg shadow-[#00ffcc]/10'}`}>
                {loading ? `[ ${liveStatus.stage} ]` : "Establish_Signal"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
