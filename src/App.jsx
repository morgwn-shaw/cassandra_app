import React, { useState, useEffect } from 'react';
import { Layers, User, Zap, Plus, Cpu, Database, ShieldCheck, Eye, HardDriveUpload, PlayCircle } from 'lucide-react';

const API_BASE = "https://cassandrafiles.pythonanywhere.com/api/v2";

const App = () => {
  const [activeTab, setActiveTab] = useState('season');
  const [seasons, setSeasons] = useState([]);
  const [activeSeason, setActiveSeason] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [vault, setVault] = useState({ shared: [], roadmap: [], memories: [] });
  const [showSeasonModal, setShowSeasonModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form States
  const [newS, setNewS] = useState({ topic: '', episodes: 10, relationship: 'UST' });

  useEffect(() => { refreshData(); }, []);
  useEffect(() => { if (activeSeason) { fetchEpisodes(activeSeason.id); fetchVault(activeSeason.id); } }, [activeSeason, activeTab]);

  const refreshData = async () => {
    const sRes = await fetch(`${API_BASE}/season/list`);
    const sData = await sRes.json();
    setSeasons(sData);
    if (sData.length > 0 && !activeSeason) setActiveSeason(sData[0]);
    const pRes = await fetch(`${API_BASE}/persona/list`);
    setPersonas(await pRes.json());
  };

  const fetchEpisodes = async (id) => {
    const res = await fetch(`${API_BASE}/episodes/list/${id}`);
    setEpisodes(await res.json());
  };

  const fetchVault = async (id) => {
    const res = await fetch(`${API_BASE}/vault/${id}`);
    setVault(await res.json());
  };

  const handleCreateSeason = async () => {
    setLoading(true);
    await fetch(`${API_BASE}/season/reconcile`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newS)
    });
    setLoading(false); setShowSeasonModal(false); refreshData();
  };

  const handleRunAudit = async (epId) => {
    setLoading(true);
    await fetch(`${API_BASE}/episodes/run`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ep_id: epId, season_id: activeSeason.id })
    });
    setLoading(false); fetchVault(activeSeason.id);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 font-mono flex">
      {/* SIDEBAR */}
      <nav className="w-64 border-r border-zinc-900 bg-black/50 p-6 flex flex-col gap-8">
        <div className="text-[#00ffcc] font-black tracking-widest uppercase text-xs mb-4">Cassandra_Engine</div>
        {['season', 'persona', 'vault', 'source'].map(t => (
          <button key={t} onClick={() => setActiveTab(t)} className={`flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest ${activeTab === t ? 'text-[#00ffcc]' : 'text-zinc-600'}`}>
            {t === 'season' && <Layers size={18}/>}
            {t === 'persona' && <User size={18}/>}
            {t === 'vault' && <Eye size={18}/>}
            {t === 'source' && <HardDriveUpload size={18}/>}
            {t}
          </button>
        ))}
        <div className="mt-auto border-t border-zinc-900 pt-6">
           <p className="text-[8px] text-zinc-600 uppercase mb-2">Active_Arc</p>
           <select className="bg-zinc-900 text-[#00ffcc] text-[10px] w-full p-2 rounded outline-none" value={activeSeason?.id} onChange={(e) => setActiveSeason(seasons.find(s => s.id === e.target.value))}>
             {seasons.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
           </select>
        </div>
      </nav>

      {/* MAIN */}
      <main className="flex-1 p-12">
        <header className="mb-12 flex justify-between">
           <h1 className="text-3xl font-black uppercase text-white tracking-tighter">{activeTab}_Protocol</h1>
           <button onClick={() => setShowSeasonModal(true)} className="bg-[#00ffcc] text-black px-6 py-2 text-[10px] font-black uppercase flex items-center gap-2"><Plus size={14}/> New Arc</button>
        </header>

        {activeTab === 'season' && activeSeason && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {episodes.map(ep => (
              <div key={ep.ep_id} className="border border-zinc-900 p-6 rounded bg-zinc-950/40">
                <div className="flex justify-between text-[8px] font-bold mb-4">
                  <span className="text-zinc-600 uppercase">Act_{ep.act}</span>
                  <span className="text-[#00ffcc] italic">{ep.wing}</span>
                </div>
                <h4 className="text-xs font-black uppercase mb-6 leading-tight h-8">{ep.title}</h4>
                <button onClick={() => handleRunAudit(ep.ep_id)} className="w-full py-3 bg-zinc-900 text-zinc-500 text-[9px] font-black uppercase hover:bg-[#00ffcc] hover:text-black transition-all flex items-center justify-center gap-2">
                  <PlayCircle size={14} /> Start Forensic Audit
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'vault' && (
           <div className="grid grid-cols-2 gap-10">
              <div className="border border-zinc-900 p-8 rounded bg-zinc-950/50">
                <h3 className="text-[#00ffcc] text-xs font-black uppercase mb-6 italic tracking-widest">Shared Lore</h3>
                {vault.shared.map((s, i) => <div key={i} className="text-[10px] text-zinc-500 mb-2 p-2 bg-black/40 border-l border-zinc-800 font-bold">{s}</div>)}
              </div>
              <div className="border border-zinc-900 p-8 rounded bg-zinc-950/50">
                <h3 className="text-zinc-500 text-xs font-black uppercase mb-6 italic tracking-widest">Harvested Memory</h3>
                {vault.memories.map((m, i) => <div key={i} className="text-[10px] text-zinc-600 mb-2 border-b border-zinc-900 pb-2"><span className="text-[#00ffcc] mr-2">{m.persona}:</span>{m.snippet}</div>)}
              </div>
           </div>
        )}
      </main>

      {/* MODAL: NEW SEASON */}
      {showSeasonModal && (
        <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center">
          <div className="bg-zinc-950 border border-zinc-800 p-10 rounded-2xl max-w-md w-full">
            <h2 className="text-2xl font-black uppercase mb-8 italic">Initialize Arc</h2>
            <div className="space-y-6">
              <input className="w-full bg-zinc-900 p-4 border border-zinc-800 outline-none" placeholder="TOPIC" onChange={(e) => setNewS({...newS, topic: e.target.value})} />
              <div className="space-y-2">
                <label className="text-[9px] text-zinc-500 uppercase font-bold">Episodes: {newS.episodes}</label>
                <input type="range" min="1" max="15" className="w-full accent-[#00ffcc]" onChange={(e) => setNewS({...newS, episodes: e.target.value})} />
              </div>
              <select className="w-full bg-zinc-900 p-4 border border-zinc-800 text-[10px]" onChange={(e) => setNewS({...newS, relationship: e.target.value})}>
                <option value="UST">UNRESOLVED TENSION</option>
                <option value="FRENEMIES">FRENEMIES</option>
                <option value="BUDDY_COP">BUDDY COP</option>
              </select>
              <button onClick={handleCreateSeason} className="w-full py-4 bg-[#00ffcc] text-black font-black uppercase">Establish Signal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
