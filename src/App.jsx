import React, { useState, useEffect } from 'react';
import { Layers, User, Zap, Plus, Cpu, Database, ShieldCheck, HardDriveUpload } from 'lucide-react';

const API_BASE = "https://cassandrafiles.pythonanywhere.com/api/v2";

const App = () => {
  const [activeTab, setActiveTab] = useState('season');
  const [seasons, setSeasons] = useState([]);
  const [activeSeason, setActiveSeason] = useState(null);
  const [personas, setPersonas] = useState([]);
  const [showSeasonModal, setShowSeasonModal] = useState(false);
  const [showPersonaModal, setShowPersonaModal] = useState(false);

  // Form States
  const [newSeason, setNewSeason] = useState({ title: '', description: '', length: 10, relationship: 'UST' });
  const [newPersona, setNewPersona] = useState({ name: '', role: '', trauma: '', voiceId: 'Marcus_v1' });

  useEffect(() => { refreshData(); }, []);

  const refreshData = async () => {
    const sRes = await fetch(`${API_BASE}/seasons`);
    const sData = await sRes.json();
    setSeasons(sData);
    if (sData.length > 0 && !activeSeason) setActiveSeason(sData[0]);

    const pRes = await fetch(`${API_BASE}/persona/list`);
    const pData = await pRes.json();
    setPersonas(pData);
  };

  const handleCreateSeason = async () => {
    const res = await fetch(`${API_BASE}/seasons/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSeason)
    });
    if (res.ok) { setShowSeasonModal(false); refreshData(); }
  };

  const handleCreatePersona = async () => {
    const res = await fetch(`${API_BASE}/persona/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPersona)
    });
    if (res.ok) { setShowPersonaModal(false); refreshData(); }
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-mono p-10">
      <header className="mb-10 flex justify-between items-center">
        <div className="flex gap-4 items-center bg-zinc-900/40 p-5 border border-zinc-800 rounded-lg">
          <Layers className="text-[#00ffcc]" size={28} />
          <select 
            className="bg-transparent border-none text-lg font-black text-[#00ffcc] outline-none"
            value={activeSeason?.id}
            onChange={(e) => setActiveSeason(seasons.find(s => s.id === e.target.value))}
          >
            {seasons.map(s => <option key={s.id} value={s.id} className="bg-zinc-900">{s.title}</option>)}
          </select>
          <button onClick={() => setShowSeasonModal(true)} className="ml-4 text-zinc-500 hover:text-[#00ffcc]"><Plus /></button>
        </div>
        <div className="flex gap-6 opacity-40 text-[9px] uppercase font-bold tracking-widest">
           <div className="flex items-center gap-2"><Cpu size={14}/> Node: Active</div>
           <div className="flex items-center gap-2"><Database size={14}/> DB: SQLITE_SHADOW</div>
        </div>
      </header>

      <nav className="flex gap-4 mb-10">
        {['season', 'persona', 'source'].map(t => (
          <button key={t} onClick={() => setActiveTab(t)} className={`px-8 py-2 text-[10px] font-black uppercase tracking-widest ${activeTab === t ? 'bg-zinc-800 text-[#00ffcc]' : 'text-zinc-500'}`}>{t}</button>
        ))}
      </nav>

      <main>
        {activeTab === 'persona' && (
          <div className="grid grid-cols-3 gap-6">
            {personas.map(p => (
              <div key={p.id} className="border border-zinc-800 p-6 rounded bg-zinc-900/20">
                <p className="text-[#00ffcc] text-[10px] font-bold uppercase mb-2">{p.role}</p>
                <h3 className="text-xl font-black mb-4">{p.name}</h3>
                <p className="text-xs text-zinc-500 italic">"{p.trauma}"</p>
              </div>
            ))}
            <button onClick={() => setShowPersonaModal(true)} className="border-2 border-dashed border-zinc-900 p-6 text-zinc-700 hover:text-[#00ffcc] hover:border-[#00ffcc] transition-all uppercase font-black text-xs"> + Spawn Identity</button>
          </div>
        )}
      </main>

      {/* SEASON MODAL */}
      {showSeasonModal && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[100]">
          <div className="bg-zinc-950 border border-zinc-800 p-10 rounded-2xl max-w-md w-full">
            <h2 className="text-2xl font-black uppercase mb-8 italic">Initialize_Arc</h2>
            <div className="space-y-6">
              <input className="w-full bg-zinc-900 p-4 rounded outline-none border border-zinc-800" placeholder="ARC TITLE" onChange={(e) => setNewSeason({...newSeason, title: e.target.value})} />
              <div className="space-y-2">
                <label className="text-[9px] text-zinc-500 uppercase">Season Length: {newSeason.length}</label>
                <input type="range" min="1" max="15" className="w-full accent-[#00ffcc]" onChange={(e) => setNewSeason({...newSeason, length: e.target.value})} />
              </div>
              <select className="w-full bg-zinc-900 p-4 rounded text-xs border border-zinc-800" onChange={(e) => setNewSeason({...newSeason, relationship: e.target.value})}>
                <option value="UST">UNRESOLVED TENSION</option>
                <option value="FRENEMIES">FRENEMIES</option>
                <option value="BUDDY_COP">BUDDY COP</option>
                <option value="ENEMIES">ENEMIES</option>
              </select>
              <button onClick={handleCreateSeason} className="w-full py-4 bg-[#00ffcc] text-black font-black uppercase">Establish_Signal</button>
            </div>
          </div>
        </div>
      )}

      {/* PERSONA MODAL */}
      {showPersonaModal && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[100]">
          <div className="bg-zinc-950 border border-zinc-800 p-10 rounded-2xl max-w-md w-full">
            <h2 className="text-2xl font-black uppercase mb-8 italic">Spawn_Identity</h2>
            <div className="space-y-4">
              <input className="w-full bg-zinc-900 p-4 rounded outline-none border border-zinc-800" placeholder="NAME" onChange={(e) => setNewPersona({...newPersona, name: e.target.value})} />
              <input className="w-full bg-zinc-900 p-4 rounded outline-none border border-zinc-800" placeholder="ROLE" onChange={(e) => setNewPersona({...newPersona, role: e.target.value})} />
              <textarea className="w-full bg-zinc-900 p-4 rounded outline-none border border-zinc-800 h-24" placeholder="CORE TRAUMA" onChange={(e) => setNewPersona({...newPersona, trauma: e.target.value})} />
              <button onClick={handleCreatePersona} className="w-full py-4 bg-[#00ffcc] text-black font-black uppercase">Commit_DNA</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
