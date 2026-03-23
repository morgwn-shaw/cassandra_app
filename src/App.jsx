import React, { useState, useEffect } from 'react';
import { Layers, User, Plus, Cpu, Eye, Trash2, PlayCircle, X, Activity, Database, Zap } from 'lucide-react';

const API_BASE = "https://shadow-cassandrafiles.pythonanywhere.com/api/v2";

const App = () => {
  const [activeTab, setActiveTab] = useState('season');
  const [seasons, setSeasons] = useState([]);
  const [activeSeason, setActiveSeason] = useState(null);
  const [personas, setPersonas] = useState([]);
  const [showSeasonModal, setShowSeasonModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [liveStatus, setLiveStatus] = useState({ stage: 'IDLE', last_event: 'System Ready' });
  const [newS, setNewS] = useState({ topic: '', relationship: 'UST', host_ids: [] });

  useEffect(() => { refreshData(); }, []);

  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`${API_BASE}/status`);
          const data = await res.json();
          setLiveStatus(data);
        } catch (e) { console.error("Poll fail"); }
      }, 1200);
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
    if (!newS.topic || newS.host_ids.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/season/reconcile`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newS)
      });
      if (!res.ok) throw new Error("3.1 Pro Connection Failed");
      setShowSeasonModal(false);
      setNewS({ topic: '', relationship: 'UST', host_ids: [] });
      await refreshData();
    } catch (e) { setLiveStatus({ stage: 'ERROR', last_event: e.message }); }
    finally { setLoading(false); }
  };

  const deleteSeason = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("Purge Arc?")) {
      await fetch(`${API_BASE}/season/delete/${id}`, { method: 'DELETE' });
      refreshData();
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 font-mono flex">
      {/* SIDEBAR */}
      <nav className="w-72 border-r border-zinc-900 bg-black/50 p-8 flex flex-col shadow-2xl">
        <div className="text-[#00ffcc] font-black uppercase text-[10px] mb-8 flex items-center gap-2 tracking-[0.2em]">
          <div className="w-2 h-2 bg-[#00ffcc] animate-pulse shadow-[0_0_8px_#00ffcc]" /> Shadow_v18.9
        </div>
        <div className="flex flex-col gap-2">
          {['season', 'persona', 'vault'].map(t => (
            <button key={t} onClick={() => setActiveTab(t)} className={`flex items-center gap-4 py-3 px-4 text-[10px] font-bold uppercase rounded transition-all ${activeTab === t ? 'text-[#00ffcc] bg-[#00ffcc]/5' : 'text-zinc-600 hover:text-zinc-300'}`}>
              {t === 'season' && <Layers size={16}/>}
              {t === 'persona' && <User size={16}/>}
              {t === 'vault' && <Eye size={16}/>}
              {t}
            </button>
          ))}
        </div>
        
        {/* TELEMETRY BOX */}
        <div className="mt-8 bg-black border border-zinc-900 p-5 rounded relative overflow-hidden">
           <div className="absolute top-0 right-0 p-1 opacity-20"><Zap size={40}/></div>
           <p className="text-zinc-600 mb-2 flex items-center gap-2 uppercase text-[8px] font-black"><Activity size={10}/> Telemetry</p>
           <div className={`font-black uppercase text-[11px] ${liveStatus.stage === 'ERROR' ? 'text-red-500' : 'text-[#00ffcc]'}`}>{liveStatus.stage}</div>
           <div className="text-zinc-500 mt-2 italic leading-tight text-[9px]">{liveStatus.last_event}</div>
        </div>
        
        <div className="mt-auto pt-8 border-t border-zinc-900">
           <select className="bg-zinc-950 text-[#00ffcc] text-[10px] font-bold w-full p-4 border border-zinc-900 outline-none" value={activeSeason?.id} onChange={(e) => setActiveSeason(seasons.find(s => s.id === e.target.value))}>
             {seasons.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
           </select>
        </div>
      </nav>

      {/* MAIN VIEW */}
      <main className="flex-1 p-16 overflow-y-auto">
        <header className="mb-16 flex justify-between items-end border-b border-zinc-900 pb-8">
           <h1 className="text-5xl font-black uppercase text-white italic tracking-tighter">{activeTab}</h1>
           <button onClick={() => setShowSeasonModal(true)} className="bg-[#00ffcc] text-black px-10 py-4 text-[10px] font-black uppercase hover:bg-white transition-all shadow-lg active:scale-95"><Plus size={14}/> New Arc</button>
        </header>

        {activeTab === 'season' && (
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {seasons.map((s, i) => (
               <div key={i} onClick={() => { setActiveSeason(s); setActiveTab('vault'); }} className="border border-zinc-900 bg-zinc-950 p-8 rounded relative group cursor-pointer hover:border-[#00ffcc]/30 transition-all">
                 <button onClick={(e) => deleteSeason(e, s.id)} className="absolute top-4 right-4 text-zinc-800 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16}/></button>
                 <h4 className="text-sm font-black uppercase text-white mb-2">{s.title}</h4>
                 <p className="text-[9px] text-zinc-600 mb-6 italic">{s.relationship}</p>
                 <div className="w-full py-4 bg-zinc-900 text-[#00ffcc] text-[9px] font-black uppercase flex items-center justify-center gap-3 border border-zinc-800 group-hover:bg-[#00ffcc] group-hover:text-black">
                   <PlayCircle size={14} /> View_Vault
                 </div>
               </div>
             ))}
           </div>
        )}

        {activeTab === 'vault' && activeSeason && (
           <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-12 flex items-center justify-between">
                <div className="flex items-center gap-4 text-[#00ffcc]">
                  <Database size={24}/>
                  <h2 className="text-3xl font-black uppercase italic tracking-widest leading-none">{activeSeason.title}</h2>
                </div>
                <div className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded text-[8px] font-black text-zinc-600 uppercase flex items-center gap-2">
                  <Cpu size={12}/> Model: <span className="text-[#00ffcc]">{activeSeason.model_version || "3.1 Pro"}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="border border-zinc-900 p-12 rounded bg-zinc-950/50">
                  <h3 className="text-zinc-500 text-xs font-black uppercase mb-8 border-b border-zinc-900 pb-4 italic">Parameters</h3>
                  <div className="text-[10px] space-y-4">
                    <p><span className="text-zinc-600 uppercase">Audit ID:</span> <span className="text-white">{activeSeason.id}</span></p>
                    <p><span className="text-zinc-600 uppercase">Dynamic:</span> <span className="text-white font-bold">{activeSeason.relationship}</span></p>
                    <p><span className="text-zinc-600 uppercase">Assigned Hosts:</span> <span className="text-[#00ffcc]">{activeSeason.hosts?.map(h => h.name).join(' // ')}</span></p>
                  </div>
                </div>
                <div className="border border-[#ff4444]/20 p-12 rounded bg-black/80 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5 text-[#ff4444]"><Activity size={80}/></div>
                  <h3 className="text-[#ff4444] text-xs font-black uppercase mb-8 border-b border-[#ff4444]/10 pb-4 italic tracking-widest">Forensic_Output</h3>
                  <div className="text-[14px] text-[#ff6666] font-mono leading-relaxed uppercase tracking-tighter">
                    {activeSeason.lore || "> DECRYPTING..."}
                  </div>
                </div>
              </div>
           </div>
        )}
      </main>

      {/* MODAL: ESTABLISH ARC */}
      {showSeasonModal && (
        <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-6 backdrop-blur-md">
          <div className="bg-zinc-950 border border-zinc-800 p-12 rounded-2xl max-w-xl w-full shadow-2xl relative">
            <button onClick={() => setShowSeasonModal(false)} className="absolute top-8 right-8 text-zinc-700 hover:text-white transition-all"><X size={20}/></button>
            <h2 className="text-3xl font-black uppercase mb-10 text-white italic tracking-tighter">Initialize_Arc</h2>
            
            <div className="space-y-10">
              <input className="w-full bg-zinc-900 p-5 border border-zinc-800 text-[#00ffcc] font-bold outline-none focus:border-[#00ffcc] transition-all" placeholder="AUDIT_TOPIC_STRING" value={newS.topic} onChange={(e) => setNewS({...newS, topic: e.target.value})} />

              <div className="space-y-4">
                <label className="text-[9px] text-zinc-500 uppercase font-black ml-1">Pair Identity DNA</label>
                <div className="grid grid-cols-2 gap-3">
                  {personas.map(p => (
                    <button key={p.id} onClick={() => {
                      const updated = newS.host_ids.includes(p.id) ? newS.host_ids.filter(id => id !== p.id) : [...newS.host_ids, p.id];
                      setNewS({...newS, host_ids: updated});
                    }} className={`p-4 text-[10px] font-black uppercase border transition-all text-left ${newS.host_ids.includes(p.id) ? 'border-[#00ffcc] text-[#00ffcc] bg-[#00ffcc]/5' : 'border-zinc-800 text-zinc-700 hover:border-zinc-500'}`}>
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              <select className="w-full bg-zinc-900 p-5 border border-zinc-800 text-[11px] font-bold text-[#00ffcc] outline-none appearance-none" value={newS.relationship} onChange={(e) => setNewS({...newS, relationship: e.target.value})}>
                <option value="UST">UNRESOLVED TENSION</option>
                <option value="FRENEMIES">FRENEMIES</option>
                <option value="BUDDY_COP">BUDDY COP</option>
              </select>

              <button 
                onClick={handleCreateSeason} 
                disabled={loading || !newS.topic || newS.host_ids.length === 0} 
                className={`w-full py-6 font-black uppercase tracking-widest transition-all ${loading ? 'bg-zinc-900 text-[#00ffcc] animate-pulse' : 'bg-[#00ffcc] text-black hover:bg-white shadow-lg'}`}
              >
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
