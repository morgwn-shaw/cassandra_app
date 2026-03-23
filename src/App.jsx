import React, { useState, useEffect } from 'react';
import { Layers, User, Plus, Cpu, Eye, HardDriveUpload, PlayCircle, Loader } from 'lucide-react';

const API_BASE = "https://shadow-cassandrafiles.pythonanywhere.com/api/v2";

const App = () => {
  const [activeTab, setActiveTab] = useState('season');
  const [seasons, setSeasons] = useState([]);
  const [activeSeason, setActiveSeason] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [vault, setVault] = useState({ shared: [], roadmap: [], memories: [] });
  const [showSeasonModal, setShowSeasonModal] = useState(false);
  const [showPersonaModal, setShowPersonaModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [newS, setNewS] = useState({ topic: '', episodes: 10, relationship: 'UST' });
  const [newP, setNewP] = useState({ name: '', role: 'Forensic Analyst', trauma: '' });

  useEffect(() => { refreshData(); }, []);
  
  useEffect(() => { 
    if (activeSeason?.id) { 
      fetchEpisodes(activeSeason.id); 
      fetchVault(activeSeason.id); 
    } 
  }, [activeSeason, activeTab]);

  const refreshData = async () => {
    try {
      const sRes = await fetch(`${API_BASE}/season/list`);
      const sData = await sRes.json();
      const cleanS = Array.isArray(sData) ? sData : [];
      setSeasons(cleanS);
      if (cleanS.length > 0 && !activeSeason) setActiveSeason(cleanS[0]);
      
      const pRes = await fetch(`${API_BASE}/persona/list`);
      const pData = await pRes.json();
      setPersonas(Array.isArray(pData) ? pData : []);
    } catch (e) { console.error("API_OFFLINE", e); }
  };

  const fetchEpisodes = async (id) => {
    const res = await fetch(`${API_BASE}/episodes/list/${id}`);
    const data = await res.json();
    setEpisodes(Array.isArray(data) ? data : []);
  };

  const fetchVault = async (id) => {
    const res = await fetch(`${API_BASE}/vault/${id}`);
    const data = await res.json();
    setVault(data || { shared: [], roadmap: [], memories: [] });
  };

  const handleCreateSeason = async () => {
    setLoading(true);
    await fetch(`${API_BASE}/season/reconcile`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newS)
    });
    setLoading(false);
    setShowSeasonModal(false);
    refreshData();
  };

  const handleCreatePersona = async () => {
    setLoading(true);
    await fetch(`${API_BASE}/persona/create`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newP)
    });
    setLoading(false);
    setShowPersonaModal(false);
    refreshData();
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 font-mono flex">
      {/* SIDEBAR */}
      <nav className="w-64 border-r border-zinc-900 bg-black/50 p-8 flex flex-col gap-8 shadow-2xl">
        <div className="text-[#00ffcc] font-black tracking-widest uppercase text-xs mb-4 flex items-center gap-2">
          <div className="w-2 h-2 bg-[#00ffcc] animate-pulse" /> Cassandra_Shadow
        </div>
        {['season', 'persona', 'vault'].map(t => (
          <button key={t} onClick={() => setActiveTab(t)} className={`flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === t ? 'text-[#00ffcc]' : 'text-zinc-600 hover:text-zinc-400'}`}>
            {t === 'season' && <Layers size={18}/>}
            {t === 'persona' && <User size={18}/>}
            {t === 'vault' && <Eye size={18}/>}
            {t}
          </button>
        ))}
        
        <div className="mt-auto border-t border-zinc-900 pt-6">
           <p className="text-[8px] text-zinc-600 uppercase mb-2 ml-1">Active_Arc</p>
           <select className="bg-zinc-900 text-[#00ffcc] text-[10px] font-bold w-full p-3 rounded outline-none border border-zinc-800" value={activeSeason?.id} onChange={(e) => setActiveSeason(seasons.find(s => s.id === e.target.value))}>
             {seasons.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
           </select>
        </div>
      </nav>

      <main className="flex-1 p-12 overflow-y-auto relative">
        {loading && (
          <div className="absolute top-10 right-10 flex items-center gap-3 bg-zinc-900 border border-zinc-800 px-6 py-3 rounded text-[#00ffcc] text-[10px] font-black uppercase animate-pulse">
            <Cpu size={14} /> Reconciling_Signal...
          </div>
        )}

        <header className="mb-12 flex justify-between">
           <h1 className="text-3xl font-black uppercase text-white tracking-tighter italic">{activeTab}_Protocol</h1>
           <div className="flex gap-4">
             <button onClick={() => setShowSeasonModal(true)} className="bg-[#00ffcc] text-black px-8 py-3 text-[10px] font-black uppercase flex items-center gap-2 hover:bg-white transition-all shadow-lg"><Plus size={14}/> New Arc</button>
             <button className="bg-zinc-900 text-zinc-500 px-6 py-3 text-[10px] font-black uppercase flex items-center gap-2 border border-zinc-800 hover:text-white transition-all"><HardDriveUpload size={14}/> Source</button>
           </div>
        </header>

        {activeTab === 'season' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in">
            {episodes.map((ep, i) => (
              <div key={i} className="border border-zinc-900 bg-zinc-950 p-6 rounded-lg hover:border-[#00ffcc] transition-all group">
                <div className="flex justify-between text-[8px] font-bold mb-4">
                  <span className="text-zinc-600 uppercase tracking-widest font-black">Act_0{i+1}</span>
                  <span className="text-[#00ffcc] italic tracking-tighter">NODE_{i+1}</span>
                </div>
                <h4 className="text-xs font-black uppercase mb-6 leading-tight h-8">{ep.title}</h4>
                <button className="w-full py-4 bg-zinc-900 text-zinc-500 text-[9px] font-black uppercase flex items-center justify-center gap-2 hover:bg-[#00ffcc] hover:text-black transition-all">
                  <PlayCircle size={14} /> Start Audit
                </button>
              </div>
            ))}
            {episodes.length === 0 && <div className="col-span-full py-20 border border-dashed border-zinc-900 flex items-center justify-center text-[10px] text-zinc-700 font-black uppercase">Arc Registry Empty. Establishment Pending.</div>}
          </div>
        )}

        {activeTab === 'persona' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in">
            {personas.map(p => (
              <div key={p.id} className="border border-zinc-900 bg-zinc-950 p-8 rounded-xl border-l-4 border-l-[#00ffcc]">
                <p className="text-[9px] text-[#00ffcc] font-black uppercase mb-1 tracking-widest">{p.role}</p>
                <h3 className="text-xl font-black uppercase mb-6 text-white">{p.name}</h3>
                <p className="text-[10px] text-zinc-500 italic leading-loose">"{p.trauma}"</p>
              </div>
            ))}
            <button onClick={() => setShowPersonaModal(true)} className="border-2 border-dashed border-zinc-900 p-10 flex flex-col items-center justify-center gap-4 text-zinc-700 hover:text-[#00ffcc] transition-all"><Plus size={32}/><span className="text-[10px] font-black uppercase">Spawn Identity</span></button>
          </div>
        )}

        {activeTab === 'vault' && (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in fade-in">
              <div className="border border-zinc-900 p-10 rounded bg-zinc-950/50">
                <h3 className="text-[#00ffcc] text-xs font-black uppercase mb-8 italic border-b border-zinc-900 pb-4">Invisible Shared History</h3>
                {(vault.shared || []).map((s, i) => <div key={i} className="text-[10px] text-zinc-500 mb-3 p-3 bg-black/40 border-l border-zinc-800 font-bold">{s}</div>)}
              </div>
              <div className="border border-zinc-900 p-10 rounded bg-zinc-950/50">
                <h3 className="text-zinc-500 text-xs font-black uppercase mb-8 italic border-b border-zinc-900 pb-4">Lore Fragment</h3>
                <div className="text-[11px] text-[#ff4444] font-mono leading-relaxed uppercase tracking-tighter">
                  {activeSeason?.lore || "Awaiting decryption..."}
                </div>
              </div>
           </div>
        )}
      </main>

      {/* MODAL: NEW SEASON */}
      {showSeasonModal && (
        <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-6 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-zinc-800 p-10 rounded-2xl max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-black uppercase mb-2 italic text-white tracking-tighter">Initialize Arc</h2>
            <div className="space-y-8 mt-10">
              <input className="w-full bg-zinc-900 p-4 border border-zinc-800 outline-none text-[#00ffcc] font-bold" placeholder="TARGET TOPIC" onChange={(e) => setNewS({...newS, topic: e.target.value})} />
              <select className="w-full bg-zinc-900 p-4 border border-zinc-800 text-[10px] font-bold" onChange={(e) => setNewS({...newS, relationship: e.target.value})}>
                <option value="UST">UNRESOLVED TENSION</option>
                <option value="FRENEMIES">FRENEMIES</option>
                <option value="BUDDY_COP">BUDDY COP</option>
              </select>
              <div className="flex gap-4 pt-4">
                <button onClick={() => setShowSeasonModal(false)} className="flex-1 py-4 border border-zinc-800 text-[10px] uppercase font-black text-zinc-500">Abort</button>
                <button onClick={handleCreateSeason} className="flex-1 py-4 bg-[#00ffcc] text-black font-black uppercase tracking-widest">Establish_Signal</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NEW PERSONA */}
      {showPersonaModal && (
        <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-6 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-zinc-800 p-10 rounded-2xl max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-black uppercase mb-2 italic text-white tracking-widest">Spawn Identity</h2>
            <div className="space-y-6 mt-10">
              <input className="w-full bg-zinc-900 p-4 border border-zinc-800 text-[#00ffcc] font-bold" placeholder="NAME" onChange={(e) => setNewP({...newP, name: e.target.value})} />
              <textarea className="w-full bg-zinc-900 p-4 border border-zinc-800 h-28 text-sm outline-none" placeholder="CORE BIAS / TRAUMA" onChange={(e) => setNewP({...newP, trauma: e.target.value})} />
              <div className="flex gap-4 pt-4">
                <button onClick={() => setShowPersonaModal(false)} className="flex-1 py-4 border border-zinc-800 text-[10px] uppercase font-black text-zinc-500">Cancel</button>
                <button onClick={handleCreatePersona} className="flex-1 py-4 bg-[#00ffcc] text-black font-black uppercase tracking-widest">Commit_DNA</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
