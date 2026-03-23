import React, { useState, useEffect } from 'react';
import { Layers, User, Zap, Plus, Cpu, Database, Eye, HardDriveUpload, PlayCircle, Loader } from 'lucide-react';

// POINT TO SHADOW
const API_BASE = "https://shadow-cassandrafiles.pythonanywhere.com/api/v2";

const App = () => {
  const [activeTab, setActiveTab] = useState('season');
  const [seasons, setSeasons] = useState([]);
  const [activeSeason, setActiveSeason] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [vault, setVault] = useState({ shared: [], roadmap: [], memories: [] });
  const [loading, setLoading] = useState(false);

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
      const cleanSeasons = Array.isArray(sData) ? sData : [];
      setSeasons(cleanSeasons);
      if (cleanSeasons.length > 0) setActiveSeason(cleanSeasons[0]);
      
      const pRes = await fetch(`${API_BASE}/persona/list`);
      const pData = await pRes.json();
      setPersonas(Array.isArray(pData) ? pData : []);
    } catch (e) { console.error("OFFLINE", e); }
  };

  const fetchEpisodes = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/episodes/list/${id}`);
      const data = await res.json();
      setEpisodes(Array.isArray(data) ? data : []);
    } catch (e) { setEpisodes([]); }
  };

  const fetchVault = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/vault/${id}`);
      const data = await res.json();
      setVault(data || { shared: [], roadmap: [], memories: [] });
    } catch (e) { setVault({ shared: [], roadmap: [], memories: [] }); }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 font-mono flex">
      <nav className="w-64 border-r border-zinc-900 bg-black/50 p-8 flex flex-col gap-8 shadow-2xl">
        <div className="text-[#00ffcc] font-black tracking-widest uppercase text-xs mb-4 flex items-center gap-2">
          <div className="w-2 h-2 bg-[#00ffcc] animate-pulse" /> Cassandra_Shadow_v18
        </div>
        {['season', 'persona', 'vault'].map(t => (
          <button key={t} onClick={() => setActiveTab(t)} className={`flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === t ? 'text-[#00ffcc]' : 'text-zinc-600 hover:text-zinc-400'}`}>
            {t === 'season' && <Layers size={18}/>}
            {t === 'persona' && <User size={18}/>}
            {t === 'vault' && <Eye size={18}/>}
            {t}
          </button>
        ))}
      </nav>

      <main className="flex-1 p-12 overflow-y-auto">
        <header className="mb-12">
           <h1 className="text-3xl font-black uppercase text-white tracking-tighter italic">{activeTab}_Protocol</h1>
           <p className="text-[10px] text-zinc-500 mt-2">Connected to Shadow Stack</p>
        </header>

        {activeTab === 'season' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(episodes || []).map((ep, i) => (
              <div key={i} className="border border-zinc-900 bg-zinc-950 p-6 rounded-lg">
                <h4 className="text-xs font-black uppercase text-white">{ep.title || "Untitled Episode"}</h4>
              </div>
            ))}
            {episodes.length === 0 && <div className="text-zinc-700 text-[10px] uppercase font-black">No Episodes Reconciled In This Arc.</div>}
          </div>
        )}

        {activeTab === 'persona' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(personas || []).map((p, i) => (
              <div key={i} className="border border-zinc-900 bg-zinc-950 p-8 rounded-xl border-l-4 border-l-[#00ffcc]">
                <h3 className="text-xl font-black uppercase text-white">{p.name}</h3>
                <p className="text-[10px] text-zinc-500 italic mt-4">{p.trauma}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'vault' && (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="border border-zinc-900 p-10 rounded bg-zinc-950/50">
                <h3 className="text-[#00ffcc] text-xs font-black uppercase mb-8 italic border-b border-zinc-900 pb-4">Shared History</h3>
                {(vault?.shared || []).map((s, i) => <div key={i} className="text-[10px] text-zinc-500 mb-3 p-3 bg-black/40">{s}</div>)}
              </div>
           </div>
        )}
      </main>
    </div>
  );
};

export default App;
