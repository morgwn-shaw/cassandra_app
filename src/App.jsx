import React, { useState, useEffect } from 'react';
import { Layers, User, Zap, Plus, Cpu, Database, ShieldCheck, Eye, Terminal, Radio, Info } from 'lucide-react';

const API_BASE = "https://cassandrafiles.pythonanywhere.com/api/v2";

const App = () => {
  const [activeTab, setActiveTab] = useState('season');
  const [seasons, setSeasons] = useState([]);
  const [activeSeason, setActiveSeason] = useState(null);
  const [personas, setPersonas] = useState([]);
  const [vaultData, setVaultData] = useState({ shared_history: [], memories: [], roadmap: [] });
  const [showSeasonModal, setShowSeasonModal] = useState(false);

  useEffect(() => { refreshData(); }, []);
  useEffect(() => { if (activeSeason) fetchVault(activeSeason.id); }, [activeSeason]);

  const refreshData = async () => {
    const sRes = await fetch(`${API_BASE}/seasons`);
    const sData = await sRes.json();
    setSeasons(sData);
    if (sData.length > 0 && !activeSeason) setActiveSeason(sData[0]);
    const pRes = await fetch(`${API_BASE}/persona/list`);
    const pData = await pRes.json();
    setPersonas(pData);
  };

  const fetchVault = async (sId) => {
    const res = await fetch(`${API_BASE}/lore/vault/${sId}`);
    const data = await res.json();
    setVaultData(data);
  };

  const handleSeed = async () => {
    await fetch(`${API_BASE}/dev/seed`, { method: 'POST' });
    refreshData();
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-mono p-10">
      <header className="mb-10 flex justify-between items-center bg-zinc-900/40 p-6 border border-zinc-800 rounded-xl">
        <div className="flex gap-6 items-center">
          <Layers className="text-[#00ffcc]" size={32} />
          <select 
            className="bg-transparent border-none text-xl font-black text-[#00ffcc] outline-none cursor-pointer" 
            value={activeSeason?.id} 
            onChange={(e) => setActiveSeason(seasons.find(s => s.id === e.target.value))}
          >
            {seasons.map(s => <option key={s.id} value={s.id} className="bg-zinc-900">{s.title}</option>)}
          </select>
          <button onClick={() => setShowSeasonModal(true)} className="text-zinc-600 hover:text-[#00ffcc]"><Plus /></button>
        </div>
        <button onClick={handleSeed} className="text-[9px] border border-zinc-800 px-4 py-2 hover:bg-zinc-800 uppercase font-black text-zinc-500">Seed Demo Lore</button>
      </header>

      <nav className="flex gap-4 mb-12">
        {['season', 'persona', 'vault'].map(t => (
          <button key={t} onClick={() => setActiveTab(t)} className={`px-10 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === t ? 'bg-zinc-800 text-[#00ffcc]' : 'text-zinc-600'}`}>
            {t === 'vault' ? <div className="flex items-center gap-2"><Eye size={12}/> Lore Vault</div> : t}
          </button>
        ))}
      </nav>

      <main>
        {activeTab === 'vault' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* SHARED HISTORY (The Invisible Stuff) */}
              <div className="border border-zinc-900 p-8 rounded-xl bg-zinc-950/50">
                <h3 className="text-[#00ffcc] text-xs font-black uppercase mb-6 flex items-center gap-2"><ShieldCheck size={14}/> Invisible_Shared_History</h3>
                <div className="space-y-4">
                  {vaultData.shared_history.length > 0 ? vaultData.shared_history.map((h, i) => (
                    <div key={i} className="text-[11px] text-zinc-400 p-3 bg-zinc-900/30 border-l-2 border-zinc-800 font-bold">{h}</div>
                  )) : <p className="text-[10px] text-zinc-700 italic">No shared history generated for this arc.</p>}
                </div>
              </div>

              {/* HARVESTED MEMORIES (The Active Stuff) */}
              <div className="border border-zinc-900 p-8 rounded-xl bg-zinc-950/50">
                <h3 className="text-zinc-500 text-xs font-black uppercase mb-6 flex items-center gap-2"><Terminal size={14}/> Harvested_Episode_Lore</h3>
                <div className="space-y-4">
                   {vaultData.memories.length > 0 ? vaultData.memories.map((m, i) => (
                    <div key={i} className="text-[11px] text-zinc-500 flex gap-4">
                      <span className="text-[#00ffcc] shrink-0 font-black">{m.persona}:</span>
                      <span>{m.snippet}</span>
                    </div>
                  )) : <p className="text-[10px] text-zinc-700 italic">Run an audit to harvest new lore.</p>}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* (The existing Persona and Season tabs remain here) */}
      </main>
    </div>
  );
};

export default App;
