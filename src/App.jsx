import React, { useState, useEffect } from 'react';
import { Layers, User, Plus, Cpu, Eye, Trash2, PlayCircle, X, Activity, Database, ChevronRight } from 'lucide-react';

const API_BASE = "https://shadow-cassandrafiles.pythonanywhere.com/api/v2";

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

  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`${API_BASE}/status`);
          const data = await res.json();
          setLiveStatus(data);
        } catch (e) { console.error("Telemetry link lost."); }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const refreshData = async () => {
    try {
      const sRes = await fetch(`${API_BASE}/season/list`);
      const sData = await sRes.json();
      setSeasons(Array.isArray(sData) ? sData : []);
      const pRes = await fetch(`${API_BASE}/persona/list`);
      setPersonas(await pRes.json() || []);
    } catch (e) { console.error("Sync fail"); }
  };

  const handleCreateSeason = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/season/reconcile`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newS)
      });
      if (!res.ok) throw new Error("AI Rejection");
      setShowSeasonModal(false);
      setNewS({ topic: '', relationship: 'UST', host_ids: [], episodes_count: 10 });
      refreshData();
    } catch (e) { setLiveStatus({ stage: 'ERROR', last_event: e.message }); }
    finally { setLoading(false); }
  };

  const deleteArc = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("PURGE ARC?")) {
      await fetch(`${API_BASE}/season/delete/${id}`, { method: 'DELETE' });
      refreshData();
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 font-mono flex">
      {/* SIDEBAR */}
      <nav className="w-80 border-r border-zinc-900 bg-black/50 p-8 flex flex-col shadow-2xl">
        <div className="text-[#00ffcc] font-black uppercase text-[10px] mb-8 flex items-center gap-2 tracking-[0.2em]">
          <div className="w-2 h-2 bg-[#00ffcc] animate-pulse" /> Shadow_v20.2
        </div>
        
        <div className="flex flex-col gap-2">
          {['season', 'persona', 'vault'].map(t => (
            <button key={t} onClick={() => setActiveTab(t)} className={`flex items-center gap-4 py-3 px-4 text-[10px] font-bold uppercase rounded transition-all ${activeTab === t ? 'text-[#00ffcc] bg-[#00ffcc]/5 border-l-2 border-[#00ffcc]' : 'text-zinc-600 hover:text-zinc-300'}`}>
              {t === 'season' && <Layers size={16}/>}
              {t === 'persona' && <User size={16}/>}
              {t === 'vault' && <Eye size={16}/>}
              {t}
            </button>
          ))}
        </div>

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
           <button onClick={() => setShowSeasonModal(true)} className="bg-[#00ffcc] text-black px-10 py-4 text-[10px] font-black uppercase hover:bg-white transition-all shadow-lg"><Plus size={14}/> Establish Arc</button>
        </header>

        {activeTab === 'season' && (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {seasons.map((s, i) => (
               <div key={i} className="border border-zinc-900 bg-zinc-950 rounded relative group hover:border-[#00ffcc]/30 transition-all cursor-pointer overflow-hidden flex flex-col min-h-[220px]">
                 <button onClick={(e) => deleteArc(e, s.id)} className="w-full bg-red-950/20 py-2 text-red-500 text-[8px] font-black uppercase border-b border-zinc-900 hover:bg-red-500 hover:text-white transition-all">
                    [ Purge Archive Record ]
                 </button>
                 <div className="p-8 flex-1 flex flex-col" onClick={() => { setActiveSeason(s); setActiveTab('vault'); }}>
                    <h4 className="text-sm font-black uppercase text-white mb-2">{s.title || "Unknown"}</h4>
                    <p className="text-[9px] text-zinc-600 mb-6 italic">{s.relationship} // {s.episodes_count} NODES</p>
                    <div className="mt-auto w-full py-4 bg-zinc-900 text-[#00ffcc] text-[9px] font-black uppercase flex items-center justify-center gap-3 border border-zinc-800 group-hover:bg-[#00ffcc] group-hover:text-black">
                        <PlayCircle size={14}/> View_Blueprint
                    </div>
                 </div>
               </div>
             ))}
             {seasons.length === 0 && <div className="col-span-full py-20 border border-dashed border-zinc-900 text-center text-[10px] uppercase font-black text-zinc-700 tracking-[0.4em]">Archive_Registry_Empty</div>}
           </div>
        )}

        {activeTab === 'vault' && activeSeason && (
           <div className="animate-in fade-in duration-500">
              <div className="mb-12 flex items-center gap-4 text-[#00ffcc] border-b border-zinc-900 pb-8">
                <Database size={24}/>
                <h2 className="text-3xl font-black uppercase italic tracking-widest">{activeSeason.title}</h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="border border-zinc-900 p-12 rounded bg-zinc-950/50">
                  <h3 className="text-zinc-500 text-xs font-black uppercase mb-8 border-b border-zinc-900 pb-4 italic underline underline-offset-8">Shared History</h3>
                  <div className="text-[13px] text-[#ff6666] font-mono leading-relaxed uppercase tracking-tighter whitespace-pre-wrap">
                    {activeSeason.lore}
                  </div>
                </div>
                
                <div className="border border-zinc-900 p-12 rounded bg-zinc-950/50">
                  <h3 className="text-zinc-500 text-xs font-black uppercase mb-8 border-b border-zinc-900 pb-4 italic tracking-widest underline underline-offset-8">3-Act Episode Nodes</h3>
                  <div className="space-y-6">
                    {(activeSeason.episodes || []).map((ep, idx) => (
                      <div key={idx} className="border-l-2 border-zinc-800 pl-4 py-3 hover:border-[#00ffcc] transition-all group">
                        <p className="text-[8px] text-[#00ffcc] font-black uppercase mb-1 italic opacity-50">ACT {ep.act} // Node {idx + 1}</p>
                        <h5 className="text-[11px] font-black text-white uppercase group-hover:text-[#00ffcc] transition-all">{ep.title}</h5>
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
          <div className="bg-zinc-950 border border-zinc-800 p-12 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowSeasonModal(false)} className="absolute top-8 right-8 text-zinc-700 hover:text-white"><X size={20}/></button>
            <h2 className="text-3xl font-black uppercase mb-10 italic text-white tracking-tighter italic">Establish_Arc</h2>
            
            <div className="space-y-10">
              <div className="space-y-3">
                <label className="text-[9px] text-zinc-500 uppercase font-black ml-1">Target_Audit_Topic</label>
                <input className="w-full bg-zinc-900 p-5 border border-zinc-800 text-[#00ffcc] font-bold outline-none" placeholder="TOPIC_STRING" value={newS.topic} onChange={(e) => setNewS({...newS, topic: e.target.value})} />
              </div>

              <div className="space-y-3">
                <label className="text-[9px] text-zinc-500 uppercase font-black ml-1">Node_Count ({newS.episodes_count})</label>
                <input type="range" min="4" max="20" step="2" className="w-full accent-[#00ffcc]" value={newS.episodes_count} onChange={(e) => setNewS({...newS, episodes_count: e.target.value})} />
              </div>

              <div className="space-y-4">
                <label className="text-[9px] text-zinc-500 uppercase font-black ml-1">Identity_DNA_Pairing</label>
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
              </div>

              <div className="space-y-3">
                 <label className="text-[9px] text-zinc-500 uppercase font-black ml-1">Relationship_Dynamic</label>
                 <select className="w-full bg-zinc-900 p-5 border border-zinc-800 text-[11px] font-bold text-[#00ffcc] outline-none" value={newS.relationship} onChange={(e) => setNewS({...newS, relationship: e.target.value})}>
                    <option value="UST">UNRESOLVED TENSION</option>
                    <option value="FRENEMIES">FRENEMIES</option>
                    <option value="OLD_FRIENDS">OLD FRIENDS</option>
                 </select>
              </div>

              <button onClick={handleCreateSeason} disabled={loading || !newS.topic || newS.host_ids.length === 0} className={`w-full py-6 font-black uppercase tracking-widest transition-all ${loading ? 'bg-zinc-900 text-[#00ffcc] animate-pulse' : 'bg-[#00ffcc] text-black hover:bg-white shadow-lg shadow-[#00ffcc]/10'}`}>
                {loading ? `[ RECONCILING_3_ACT_ARC ]` : "Establish_Signal"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
