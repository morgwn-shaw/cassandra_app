import React, { useState, useEffect } from 'react';
import { Layers, User, Plus, Cpu, Eye, Trash2, PlayCircle, X, Activity, AlertTriangle } from 'lucide-react';

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
  const [newP, setNewP] = useState({ name: '', role: 'Analyst', trauma: '' });
  const [showInlinePersona, setShowInlinePersona] = useState(false);

  useEffect(() => { refreshData(); }, []);

  // POLLING: Only clear status if NOT loading
  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`${API_BASE}/status`);
          const data = await res.json();
          setLiveStatus(data);
        } catch (e) { console.error("Poll fail"); }
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
    } catch (e) { setLiveStatus({ stage: 'ERROR', last_event: 'Connection Lost' }); }
  };

  const handleCreateSeason = async () => {
    if (!newS.topic || newS.host_ids.length === 0) return alert("Missing Data");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/season/reconcile`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newS)
      });
      if (!res.ok) throw new Error("Server Reject");
      setShowSeasonModal(false);
      setNewS({ topic: '', relationship: 'UST', host_ids: [] });
      await refreshData();
    } catch (e) { setLiveStatus({ stage: 'ERROR', last_event: e.message }); }
    finally { setLoading(false); }
  };

  const handleCreatePersona = async () => {
    await fetch(`${API_BASE}/persona/create`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newP)
    });
    setNewP({ name: '', role: 'Analyst', trauma: '' });
    setShowInlinePersona(false);
    refreshData();
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
      <nav className="w-72 border-r border-zinc-900 bg-black/50 p-8 flex flex-col shadow-2xl">
        <div className="text-[#00ffcc] font-black uppercase text-[10px] mb-8 flex items-center gap-2 tracking-widest">
          <div className="w-2 h-2 bg-[#00ffcc] animate-pulse" /> Shadow_v18.7
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
        <div className="mt-8 bg-black border border-zinc-900 p-4 rounded text-[9px]">
           <p className="text-zinc-600 mb-2 flex items-center gap-2 uppercase tracking-tighter"><Activity size={10}/> Telemetry</p>
           <div className={`font-black uppercase ${liveStatus.stage === 'ERROR' ? 'text-red-500' : 'text-[#00ffcc]'}`}>{liveStatus.stage}</div>
           <div className="text-zinc-500 mt-1 italic leading-tight">{liveStatus.last_event}</div>
        </div>
        <div className="mt-auto pt-8 border-t border-zinc-900">
           <select className="bg-zinc-950 text-[#00ffcc] text-[10px] font-bold w-full p-4 border border-zinc-900" value={activeSeason?.id} onChange={(e) => setActiveSeason(seasons.find(s => s.id === e.target.value))}>
             {seasons.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
           </select>
        </div>
      </nav>

      <main className="flex-1 p-16 overflow-y-auto">
        <header className="mb-16 flex justify-between items-end border-b border-zinc-900 pb-8">
           <h1 className="text-5xl font-black uppercase text-white italic tracking-tighter">{activeTab}</h1>
           <button onClick={() => setShowSeasonModal(true)} className="bg-[#00ffcc] text-black px-10 py-4 text-[10px] font-black uppercase hover:bg-white shadow-lg"><Plus size={14}/> New Arc</button>
        </header>

        {activeTab === 'season' && (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {seasons.map((s, i) => (
               <div key={i} onClick={() => { setActiveSeason(s); setActiveTab('vault'); }} className="border border-zinc-900 bg-zinc-950 p-8 rounded relative group cursor-pointer hover:border-[#00ffcc]/30 transition-all">
                 <button onClick={(e) => deleteSeason(e, s.id)} className="absolute top-4 right-4 text-zinc-800 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16}/></button>
                 <h4 className="text-sm font-black uppercase text-white mb-2">{s.title}</h4>
                 <p className="text-[9px] text-zinc-600 mb-6 italic">{s.relationship}</p>
                 <div className="w-full py-4 bg-zinc-900 text-[#00ffcc] text-[9px] font-black uppercase flex items-center justify-center gap-3 border border-zinc-800 group-hover:bg-[#00ffcc] group-hover:text-black transition-all">
                   <PlayCircle size={14} /> Open_Vault
                 </div>
               </div>
             ))}
           </div>
        )}

        {activeTab === 'vault' && activeSeason && (
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in duration-500">
              <div className="border border-zinc-900 p-12 rounded bg-zinc-950/50">
                <h3 className="text-[#00ffcc] text-xs font-black uppercase mb-8 border-b border-zinc-900 pb-4">Arc_Metadata</h3>
                <div className="text-[10px] space-y-2">
                  <p><span className="text-zinc-600">ID:</span> {activeSeason.id}</p>
                  <p><span className="text-zinc-600">DYNAMIC:</span> {activeSeason.relationship}</p>
                  <p><span className="text-zinc-600">HOSTS:</span> {activeSeason.hosts?.map(h => h.name).join(' & ')}</p>
                </div>
              </div>
              <div className="border border-[#ff4444]/20 p-12 rounded bg-black/80 shadow-2xl">
                <h3 className="text-[#ff4444] text-xs font-black uppercase mb-8 border-b border-[#ff4444]/10 pb-4">Cynical_Lore_Output</h3>
                <div className="text-[13px] text-[#ff6666] font-mono leading-loose uppercase tracking-tighter">
                  {activeSeason.lore || "> NO LORE DATA FOUND"}
                </div>
              </div>
           </div>
        )}
      </main>

      {showSeasonModal && (
        <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-6 backdrop-blur-md">
          <div className="bg-zinc-950 border border-zinc-800 p-12 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowSeasonModal(false)} className="absolute top-8 right-8 text-zinc-700 hover:text-white"><X size={20}/></button>
            <h2 className="text-3xl font-black uppercase mb-10 italic text-white tracking-tighter italic">Establish_Arc</h2>
            
            <div className="space-y-10">
              <input className="w-full bg-zinc-900 p-5 border border-zinc-800 text-[#00ffcc] font-bold outline-none" placeholder="TOPIC_STRING" value={newS.topic} onChange={(e) => setNewS({...newS, topic: e.target.value})} />

              <div className="space-y-4">
                <div className="flex justify-between items-end">
                   <label className="text-[9px] text-zinc-500 uppercase font-black">Identity_Pairing</label>
                   <button onClick={() => setShowInlinePersona(!showInlinePersona)} className="text-[9px] text-[#00ffcc] uppercase font-black hover:underline">{showInlinePersona ? "Back" : "Spawn New +"}</button>
                </div>
                {showInlinePersona ? (
                  <div className="p-6 bg-zinc-900 border border-[#00ffcc]/10 space-y-4">
                    <input className="w-full bg-black p-3 text-[10px] text-[#00ffcc] border border-zinc-800" placeholder="NAME" value={newP.name} onChange={(e) => setNewP({...newP, name: e.target.value})} />
                    <button onClick={handleCreatePersona} className="w-full py-3 bg-[#00ffcc] text-black text-[9px] font-black uppercase">Commit_DNA</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {personas.map(p => (
                      <button key={p.id} onClick={() => {
                        const updated = newS.host_ids.includes(p.id) ? newS.host_ids.filter(id => id !== p.id) : [...newS.host_ids, p.id];
                        setNewS({...newS, host_ids: updated});
                      }} className={`p-4 text-[10px] font-black uppercase border transition-all text-left ${newS.host_ids.includes(p.id) ? 'border-[#00ffcc] text-[#00ffcc] bg-[#00ffcc]/5' : 'border-zinc-800 text-zinc-700 hover:border-zinc-600'}`}>
                        {p.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <select className="w-full bg-zinc-900 p-5 border border-zinc-800 text-[11px] font-bold text-[#00ffcc] appearance-none" value={newS.relationship} onChange={(e) => setNewS({...newS, relationship: e.target.value})}>
                <option value="UST">UNRESOLVED TENSION</option>
                <option value="FRENEMIES">FRENEMIES</option>
                <option value="BUDDY_COP">BUDDY COP</option>
              </select>

              <button onClick={handleCreateSeason} disabled={loading || !newS.topic || newS.host_ids.length === 0} className={`w-full py-6 font-black uppercase transition-all ${loading ? 'bg-zinc-900 text-[#00ffcc] animate-pulse' : 'bg-[#00ffcc] text-black hover:bg-white shadow-lg shadow-[#00ffcc]/10'}`}>
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
