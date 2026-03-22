import React, { useState, useEffect } from 'react';
import { 
  User, Layers, HardDriveUpload, Radio, Play, Cpu, ShieldCheck, 
  Terminal, Plus, ChevronRight, X, Check, Database, Trash2, Zap, Search, AlertCircle
} from 'lucide-react';

const API_BASE = "https://cassandrafiles.pythonanywhere.com/api/v2";

const App = () => {
  const [activeTab, setActiveTab] = useState('season');
  const [seasons, setSeasons] = useState([]);
  const [activeSeason, setActiveSeason] = useState(null);
  const [personas, setPersonas] = useState([]);
  const [showSeasonModal, setShowSeasonModal] = useState(false);
  const [showPersonaModal, setShowPersonaModal] = useState(false);
  
  const [newSeason, setNewSeason] = useState({ title: '', description: '' });
  const [newPersona, setNewPersona] = useState({ name: '', role: '', trauma: '', voiceId: 'Marcus_v1' });

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    try {
      const sRes = await fetch(`${API_BASE}/seasons`);
      const sData = await sRes.json();
      setSeasons(sData);
      // Automatically select the first season if none is active
      if (sData.length > 0 && !activeSeason) {
        setActiveSeason(sData[0]);
      }
      
      const pRes = await fetch(`${API_BASE}/persona/list`);
      const pData = await pRes.json();
      setPersonas(pData);
    } catch (e) {
      console.error("Signal Lost", e);
    }
  };

  const handleCreateSeason = async () => {
    if (!newSeason.title) return;
    const res = await fetch(`${API_BASE}/seasons/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSeason)
    });
    if (res.ok) {
      const result = await res.json();
      setNewSeason({ title: '', description: '' });
      setShowSeasonModal(false);
      
      // Re-fetch and set the new season as active
      const updatedRes = await fetch(`${API_BASE}/seasons`);
      const updatedData = await updatedRes.json();
      setSeasons(updatedData);
      const created = updatedData.find(s => s.id === result.id);
      if (created) setActiveSeason(created);
    }
  };

  const handleCreatePersona = async () => {
    if (!newPersona.name) return;
    const res = await fetch(`${API_BASE}/persona/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPersona)
    });
    if (res.ok) {
      setNewPersona({ name: '', role: '', trauma: '', voiceId: 'Marcus_v1' });
      setShowPersonaModal(false);
      refreshData();
    }
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-mono p-4 lg:p-10">
      
      {/* HEADER: MULTI-ARC SELECTOR */}
      <header className="mb-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex items-center gap-4 w-full lg:w-auto">
          <div className="flex items-center gap-6 bg-zinc-900/40 p-5 border border-zinc-800 rounded-lg shadow-2xl flex-1">
            <Layers className="text-[#00ffcc]" size={28} />
            <div className="flex-1 min-w-[200px]">
              <p className="text-[9px] text-zinc-500 uppercase tracking-[0.3em] mb-1">Active_Arc</p>
              {seasons.length > 0 ? (
                <select 
                  className="bg-transparent border-none text-lg font-black focus:ring-0 p-0 cursor-pointer text-[#00ffcc] w-full"
                  value={activeSeason?.id || ''}
                  onChange={(e) => setActiveSeason(seasons.find(s => s.id === e.target.value))}
                >
                  {seasons.map(s => <option key={s.id} value={s.id} className="bg-zinc-900">{s.title}</option>)}
                </select>
              ) : (
                <p className="text-zinc-600 text-sm italic">No Arcs Initialized</p>
              )}
            </div>
          </div>
          <button 
            onClick={() => setShowSeasonModal(true)}
            className="p-5 bg-[#00ffcc] text-black rounded-lg hover:brightness-110 transition-all flex items-center justify-center"
            title="Create New Season Arc"
          >
            <Plus size={24} strokeWidth={3} />
          </button>
        </div>
        
        <div className="flex gap-6 opacity-40 text-[9px] uppercase tracking-widest font-bold">
          <div className="flex items-center gap-2"><Cpu size={14} className="text-[#00ffcc]"/> Node_Status: Active</div>
          <div className="flex items-center gap-2"><Database size={14} className="text-[#00ffcc]"/> DB: SQLITE_SHADOW</div>
        </div>
      </header>

      {/* PRIMARY NAVIGATION */}
      <nav className="flex gap-2 mb-10 bg-zinc-900/20 p-1.5 border border-zinc-900 rounded-xl w-fit">
        {[
          { id: 'season', label: 'Season Architect', icon: Layers },
          { id: 'persona', label: 'Persona Lab', icon: User },
          { id: 'source', label: 'Source Injector', icon: HardDriveUpload }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-3 px-8 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-zinc-800 text-[#00ffcc] shadow-[0_0_20px_rgba(0,255,204,0.1)]' : 'text-zinc-600 hover:text-zinc-400'}`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </nav>

      {/* MAIN CONTENT AREA */}
      <main className="grid gap-10">
        
        {/* SEASON ARCHITECT VIEW */}
        {activeTab === 'season' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeSeason ? (
              <>
                <div className="flex justify-between items-end mb-8 border-b border-zinc-900 pb-6">
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter italic">Blueprint // {activeSeason.title}</h2>
                    <p className="text-[10px] text-zinc-500 mt-2 uppercase tracking-widest">Arc_ID: <span className="text-zinc-300">{activeSeason.id}</span></p>
                  </div>
                  <button className="flex items-center gap-3 bg-[#00ffcc] text-black px-6 py-3 text-[11px] font-black uppercase hover:brightness-110 active:scale-95 transition-all">
                    <Zap size={16} /> Generate Episodes
                  </button>
                </div>
                
                {/* PLACEHOLDER FOR EPISODE LIST */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 opacity-20">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="border border-zinc-800 p-6 rounded-lg bg-zinc-900/10">
                      <div className="flex justify-between mb-4"><span className="text-[10px] bg-zinc-800 px-2 py-1 rounded">ACT_{i}</span></div>
                      <div className="h-4 w-3/4 bg-zinc-800 rounded mb-2"></div>
                      <div className="h-4 w-1/2 bg-zinc-900 rounded"></div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-20 border-2 border-dashed border-zinc-900 rounded-3xl">
                <AlertCircle className="mx-auto mb-4 text-zinc-700" size={48} />
                <h2 className="text-xl font-black uppercase mb-2 text-zinc-400">No Arcs Found</h2>
                <p className="text-xs text-zinc-600 mb-8 uppercase">Initialize your first investigation to begin.</p>
                <button 
                  onClick={() => setShowSeasonModal(true)}
                  className="bg-[#00ffcc] text-black px-8 py-4 text-[11px] font-black uppercase flex items-center gap-2 mx-auto"
                >
                  <Plus size={16} /> Create Your First Arc
                </button>
              </div>
            )}
          </div>
        )}

        {/* PERSONA LAB VIEW */}
        {activeTab === 'persona' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex justify-between items-center mb-10">
                <h2 className="text-xl font-black uppercase italic tracking-widest">Active_Persona_Vault</h2>
                <button 
                  onClick={() => setShowPersonaModal(true)}
                  className="flex items-center gap-2 border border-[#00ffcc] text-[#00ffcc] px-6 py-2.5 text-[10px] font-black uppercase hover:bg-[#00ffcc] hover:text-black transition-all"
                >
                  <Plus size={14} /> New Identity
                </button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {personas.map(p => (
                 <div key={p.id} className="group border border-zinc-800 bg-zinc-900/30 p-6 rounded-lg hover:border-[#00ffcc] transition-all">
                    <div className="flex items-start justify-between mb-6">
                      <div className="bg-zinc-800 p-3 rounded-lg text-[#00ffcc]"><User size={20} /></div>
                      <div className="text-right">
                        <p className="text-[9px] text-zinc-500 uppercase">Voice_ID</p>
                        <p className="text-[10px] font-bold text-zinc-300">{p.voiceId}</p>
                      </div>
                    </div>
                    <h3 className="text-lg font-black uppercase mb-1">{p.name}</h3>
                    <p className="text-[10px] text-[#00ffcc] uppercase font-bold mb-4 tracking-widest">{p.role}</p>
                    <p className="text-[11px] text-zinc-500 italic border-t border-zinc-800 pt-4 leading-relaxed">"{p.trauma}"</p>
                 </div>
               ))}
             </div>
          </div>
        )}

        {/* SOURCE INJECTOR VIEW */}
        {activeTab === 'source' && (
          <div className="max-w-2xl mx-auto w-full py-10 text-center">
            <div className="bg-zinc-900/40 border-2 border-dashed border-zinc-800 p-16 rounded-3xl">
              <HardDriveUpload size={48} className="mx-auto mb-6 text-zinc-700" />
              <h2 className="text-xl font-black uppercase mb-2">Ingest Signal Data</h2>
              <p className="text-[10px] text-zinc-600 mb-8 uppercase tracking-widest">Target Arc: {activeSeason?.title || 'NONE'}</p>
              <button className="bg-zinc-800 text-white px-10 py-4 text-[10px] font-black uppercase border border-zinc-700">
                Browse Files
              </button>
            </div>
          </div>
        )}

      </main>

      {/* MODAL: NEW SEASON ARC */}
      {showSeasonModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 p-10 rounded-2xl max-w-md w-full">
            <h2 className="text-2xl font-black uppercase mb-2 italic">Initialize_Arc</h2>
            <p className="text-[10px] text-zinc-500 mb-8 uppercase tracking-widest">Define the investigative scope.</p>
            <div className="space-y-6">
              <div>
                <label className="text-[9px] uppercase font-black text-zinc-400 mb-2 block">Arc Title</label>
                <input 
                  autoFocus
                  className="w-full bg-zinc-900/50 border border-zinc-800 p-4 rounded-lg text-sm text-[#00ffcc] outline-none"
                  placeholder="e.g. THE TASMANIAN FLUCTUATION"
                  value={newSeason.title}
                  onChange={(e) => setNewSeason({...newSeason, title: e.target.value})}
                />
              </div>
              <div>
                <label className="text-[9px] uppercase font-black text-zinc-400 mb-2 block">Description</label>
                <textarea 
                  className="w-full bg-zinc-900/50 border border-zinc-800 p-4 rounded-lg text-sm h-24 outline-none"
                  placeholder="The investigation aims to..."
                  value={newSeason.description}
                  onChange={(e) => setNewSeason({...newSeason, description: e.target.value})}
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button onClick={() => setShowSeasonModal(false)} className="flex-1 py-4 border border-zinc-800 text-[10px] uppercase font-black">Abort</button>
                <button onClick={handleCreateSeason} className="flex-1 py-4 bg-[#00ffcc] text-black text-[10px] uppercase font-black">Initialize</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NEW PERSONA */}
      {showPersonaModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 p-10 rounded-2xl max-w-md w-full">
            <h2 className="text-2xl font-black uppercase mb-2 italic">Spawn_Identity</h2>
            <div className="space-y-4 mt-8">
              <input 
                className="w-full bg-zinc-900/50 border border-zinc-800 p-4 rounded-lg text-sm outline-none"
                placeholder="NAME"
                value={newPersona.name}
                onChange={(e) => setNewPersona({...newPersona, name: e.target.value})}
              />
              <input 
                className="w-full bg-zinc-900/50 border border-zinc-800 p-4 rounded-lg text-sm outline-none"
                placeholder="ROLE"
                value={newPersona.role}
                onChange={(e) => setNewPersona({...newPersona, role: e.target.value})}
              />
              <textarea 
                className="w-full bg-zinc-900/50 border border-zinc-800 p-4 rounded-lg text-sm h-24 outline-none"
                placeholder="CORE BIAS / TRAUMA"
                value={newPersona.trauma}
                onChange={(e) => setNewPersona({...newPersona, trauma: e.target.value})}
              />
              <div className="flex gap-4 pt-4">
                <button onClick={() => setShowPersonaModal(false)} className="flex-1 py-4 border border-zinc-800 text-[10px] uppercase font-black">Cancel</button>
                <button onClick={handleCreatePersona} className="flex-1 py-4 bg-[#00ffcc] text-black text-[10px] uppercase font-black">Commit</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default App;
