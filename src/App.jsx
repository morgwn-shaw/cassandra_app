import React, { useState, useEffect } from 'react';
import { Layers, User, Plus, Cpu, Eye, Trash2, PlayCircle, X, Activity, Database, ChevronDown, ListFilter, Fingerprint } from 'lucide-react';

const API_BASE = "https://shadow-cassandrafiles.pythonanywhere.com/api/v2";

const App = () => {
  const [activeTab, setActiveTab] = useState('season');
  const [seasons, setSeasons] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [activeSeason, setActiveSeason] = useState(null);
  const [activePersona, setActivePersona] = useState(null);
  const [showSeasonModal, setShowSeasonModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => { refreshData(); }, []);

  const refreshData = async () => {
    const sRes = await fetch(`${API_BASE}/season/list`);
    setSeasons(await sRes.json() || []);
    const pRes = await fetch(`${API_BASE}/persona/list`);
    setPersonas(await pRes.json() || []);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 font-mono flex">
      {/* SIDEBAR */}
      <nav className="w-80 border-r border-zinc-900 bg-black/50 p-8 flex flex-col shadow-2xl">
        <div className="text-[#00ffcc] font-black uppercase text-[10px] mb-8 flex items-center gap-2">
          <div className="w-2 h-2 bg-[#00ffcc] animate-pulse" /> Shadow_v20.7
        </div>
        <div className="flex flex-col gap-2">
          {['season', 'persona', 'vault'].map(t => (
            <button key={t} onClick={() => setActiveTab(t)} className={`flex items-center gap-4 py-3 px-4 text-[10px] font-bold uppercase rounded ${activeTab === t ? 'text-[#00ffcc] bg-[#00ffcc]/5 border-l-2 border-[#00ffcc]' : 'text-zinc-600'}`}>
              {t === 'season' && <Layers size={16}/>}
              {t === 'persona' && <Fingerprint size={16}/>}
              {t === 'vault' && <Eye size={16}/>}
              {t === 'persona' ? 'DNA_Vault' : t}
            </button>
          ))}
        </div>
      </nav>

      {/* MAIN VIEW */}
      <main className="flex-1 p-16 overflow-y-auto">
        {activeTab === 'persona' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 animate-in fade-in duration-700">
            <div className="lg:col-span-1 space-y-4">
              <h3 className="text-zinc-600 text-[9px] font-black uppercase mb-6 tracking-widest">Active_Profiles</h3>
              {personas.map(p => (
                <button key={p.id} onClick={() => setActivePersona(p)} className={`w-full p-6 border text-left rounded transition-all ${activePersona?.id === p.id ? 'border-[#00ffcc] bg-[#00ffcc]/5 shadow-[0_0_15px_#00ffcc10]' : 'border-zinc-900 bg-zinc-950'}`}>
                  <h4 className="font-black text-white uppercase mb-1">{p.name}</h4>
                  <p className="text-[8px] text-[#00ffcc] uppercase font-black opacity-60">Archive Density: {p.archive?.anecdotes?.length || 0}/30</p>
                </button>
              ))}
            </div>

            <div className="lg:col-span-2">
              {activePersona ? (
                <div className="border border-zinc-900 p-12 rounded bg-zinc-950/50">
                  <div className="flex justify-between items-start border-b border-zinc-900 pb-8 mb-8">
                    <div>
                        <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">{activePersona.name}</h2>
                        <p className="text-[#00ffcc] text-[10px] uppercase font-black mt-2 tracking-widest">Core_Trauma: {activePersona.trauma}</p>
                    </div>
                    <Cpu className="text-zinc-800" size={32}/>
                  </div>

                  <div className="space-y-12">
                    <div>
                        <h5 className="text-zinc-500 text-[10px] font-black uppercase mb-6 italic tracking-widest border-l-2 border-[#ff4444] pl-4">Forensic_Anecdotes</h5>
                        <div className="grid grid-cols-1 gap-3 overflow-y-auto max-h-[500px] pr-4 custom-scrollbar">
                            {(activePersona.archive?.anecdotes || []).map((a, i) => (
                                <div key={i} className="p-5 bg-black/60 border border-zinc-900 text-[11px] text-zinc-400 italic leading-relaxed hover:border-zinc-700 transition-all">
                                    "{a}"
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div>
                        <h5 className="text-zinc-500 text-[10px] font-black uppercase mb-4 italic tracking-widest border-l-2 border-zinc-700 pl-4">Linguistic_Preferences</h5>
                        <div className="flex flex-wrap gap-2">
                            {(activePersona.archive?.preferences || []).map((pref, i) => (
                                <span key={i} className="px-3 py-1 bg-zinc-900 border border-zinc-800 text-zinc-500 text-[9px] uppercase font-bold">{pref}</span>
                            ))}
                        </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center border border-dashed border-zinc-900 rounded py-40">
                    <Fingerprint className="text-zinc-900 mb-6" size={48}/>
                    <p className="text-zinc-800 text-[10px] font-black uppercase tracking-[0.5em]">Awaiting_DNA_Selection</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* (Other tabs: season and vault remain the same as v20.6) */}
      </main>
    </div>
  );
};

export default App;
