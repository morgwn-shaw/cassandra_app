import React, { useState, useEffect } from 'react';
import { Layers, User, Plus, Cpu, Eye, Trash2, PlayCircle, X, Terminal, Activity } from 'lucide-react';

const API_BASE = "https://shadow-cassandrafiles.pythonanywhere.com/api/v2";

const App = () => {
  const [activeTab, setActiveTab] = useState('season');
  const [seasons, setSeasons] = useState([]);
  const [activeSeason, setActiveSeason] = useState(null);
  const [personas, setPersonas] = useState([]);
  const [showSeasonModal, setShowSeasonModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [liveStatus, setLiveStatus] = useState({ stage: 'IDLE', last_event: '' });

  // Draft State (Persistent)
  const [newS, setNewS] = useState(() => JSON.parse(localStorage.getItem('draft')) || { topic: '', relationship: 'UST', host_ids: [] });
  useEffect(() => localStorage.setItem('draft', JSON.stringify(newS)), [newS]);

  useEffect(() => { refreshData(); }, []);

  // POLLING LOGIC: Check server status while loading
  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(async () => {
        const res = await fetch(`${API_BASE}/status`);
        const status = await res.json();
        setLiveStatus(status);
      }, 1000);
    } else {
      setLiveStatus({ stage: 'IDLE', last_event: '' });
    }
    return () => clearInterval(interval);
  }, [loading]);

  const refreshData = async () => {
    try {
      const sRes = await fetch(`${API_BASE}/season/list`);
      const sData = await sRes.json();
      setSeasons(Array.isArray(sData) ? sData : []);
      if (sData.length > 0 && !activeSeason) setActiveSeason(sData[0]);
      
      const pRes = await fetch(`${API_BASE}/persona/list`);
      setPersonas(await pRes.json() || []);
    } catch (e) { console.error("OFFLINE", e); }
  };

  const handleCreateSeason = async () => {
    setLoading(true);
    try {
      await fetch(`${API_BASE}/season/reconcile`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newS)
      });
      setShowSeasonModal(false);
      setNewS({ topic: '', relationship: 'UST', host_ids: [] });
      refreshData();
    } finally { setLoading(false); }
  };

  const handleDeleteSeason = async (id) => {
    if (!window.confirm("ARE YOU SURE? This data will be purged from the archive.")) return;
    await fetch(`${API_BASE}/season/delete/${id}`, { method: 'DELETE' });
    refreshData();
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 font-mono flex">
      {/* SIDEBAR */}
      <nav className="w-72 border-r border-zinc-900 bg-black/50 p-8 flex flex-col shadow-2xl">
        <div className="text-[#00ffcc] font-black tracking-widest text-[10px] mb-8 flex items-center gap-2">
          <div className="w-2 h-2 bg-[#00ffcc] animate-pulse" /> Shadow_Terminal_v18.6
        </div>
        
        <div className="flex flex-col gap-2">
          {['season', 'persona', 'vault'].map(t => (
            <button key={t} onClick={() => setActiveTab(t)} className={`flex items-center gap-4 py-3 px-4 text-[10px] font-bold uppercase rounded ${activeTab === t ? 'text-[#00ffcc] bg-[#00ffcc]/5' : 'text-zinc-600 hover:text-zinc-300'}`}>
              {t === 'season' && <Layers size={16}/>}
              {t === 'persona' && <User size={16}/>}
              {t === 'vault' && <Eye size={16}/>}
              {t}
            </button>
          ))}
        </div>

        {/* LIVE TELEMETRY LOG */}
        <div className="mt-8 bg-black border border-zinc-900 p-4 rounded text-[9px]">
           <p className="text-zinc-600 mb-2 flex items-center gap-2 uppercase"><Activity size={10}/> Telemetry</p>
           <div className="text-[#00ffcc] font-black underline uppercase">{liveStatus.stage}</div>
           <div className="text-zinc-500 mt-1 italic">{liveStatus.last_event || "System Idle"}</div>
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
           <button onClick={() => setShowSeasonModal(true)} className="bg-[#00ffcc] text-black px-10 py-4 text-[10px] font-black uppercase hover:bg-white transition-all shadow-lg"><Plus size={14}/> New Arc</button>
        </header>

        {activeTab === 'season' && (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {seasons.map((s, i) => (
               <div key={i} className="border border-zinc-900 bg-zinc-950 p-8 rounded relative group">
                 <button onClick={() => handleDeleteSeason(s.id)} className="absolute top-4 right-4 text-zinc-800 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"><Trash2 size={16}/></button>
                 <h4 className="text-sm font-black uppercase text-white mb-2">{s.title}</h4>
                 <p className="text-[9px] text-zinc-600 mb-6">{s.relationship}</p>
                 <button className="w-full py-4 bg-zinc-900 text-zinc-500 text-[9px] font-black uppercase flex items-center justify-center gap-3 hover:bg-[#00ffcc] hover:text-black transition-all border border-zinc-800">
                   <PlayCircle size={14} /> Audit_Signal
                 </button>
               </div>
             ))}
           </div>
        )}
      </main>

      {/* MODAL: INITIALIZE ARC */}
      {showSeasonModal && (
        <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-6 backdrop-blur-md">
          <div className="bg-zinc-950 border border-zinc-800 p-12 rounded-2xl max-w-xl w-full shadow-2xl relative">
            <button onClick={() => setShowSeasonModal(false)} className="absolute top-8 right-8 text-zinc-700 hover:text-white"><X size={20}/></button>
            <h2 className="text-3xl font-black uppercase mb-10 italic text-white tracking-tighter">Initialize_Arc</h2>
            
            <div className="space-y-10">
              <input className="w-full bg-zinc-900 p-5 border border-zinc-800 text-[#00ffcc] font-bold outline-none" placeholder="TOPIC_STRING" value={newS.topic} onChange={(e) => setNewS({...newS, topic: e.target.value})} />

              <div className="space-y-4">
                <label className="text-[9px] text-zinc-500 uppercase font-black ml-1 text-zinc-600">Assign Host_DNA</label>
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

              <select className="w-full bg-zinc-900 p-5 border border-zinc-800 text-[11px] font-bold text-[#00ffcc] appearance-none" value={newS.relationship} onChange={(e) => setNewS({...newS, relationship: e.target.value})}>
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
