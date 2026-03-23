import React, { useState, useEffect } from 'react';
import { Layers, User, Plus, Cpu, Eye, HardDriveUpload, PlayCircle, X, ChevronRight } from 'lucide-react';

// TARGETING THE NEW SHADOW BUNKER
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

  // Initial State for Creators
  const [newS, setNewS] = useState({ topic: '', relationship: 'UST', host_ids: [] });
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
    } catch (e) { console.error("SIGNAL_LOST", e); }
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

  const handleCreateSeason = async () => {
    if (!newS.topic || newS.host_ids.length === 0) return alert("Select a topic and at least one host.");
    setLoading(true);
    await fetch(`${API_BASE}/season/reconcile`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newS)
    });
    setLoading(false);
    setShowSeasonModal(false);
    setNewS({ topic: '', relationship: 'UST', host_ids: [] });
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
    setNewP({ name: '', role: 'Forensic Analyst', trauma: '' });
    refreshData();
  };

  const toggleHost = (id) => {
    const current = newS.host_ids || [];
    const updated = current.includes(id) ? current.filter(i => i !== id) : [...current, id];
    setNewS({...newS, host_ids: updated});
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 font-mono flex selection:bg-[#00ffcc] selection:text-black">
      
      {/* LEFT_TERMINAL: NAVIGATION */}
      <nav className="w-72 border-r border-zinc-900 bg-black/50 p-8 flex flex-col gap-8 shadow-2xl backdrop-blur-md">
        <div className="text-[#00ffcc] font-black tracking-[0.2em] uppercase text-[10px] mb-4 flex items-center gap-3">
          <div className="w-2 h-2 bg-[#00ffcc] animate-pulse shadow-[0_0_8px_#00ffcc]" /> 
          Cassandra_Shadow_v18
        </div>
        
        <div className="flex flex-col gap-2">
          {['season', 'persona', 'vault'].map(t => (
            <button key={t} onClick={() => setActiveTab(t)} className={`flex items-center gap-4 py-3 px-4 text-[10px] font-bold uppercase tracking-widest transition-all rounded ${activeTab === t ? 'text-[#00ffcc] bg-[#00ffcc]/5 border-l-2 border-[#00ffcc]' : 'text-zinc-600 hover:text-zinc-300'}`}>
              {t === 'season' && <Layers size={16}/>}
              {t === 'persona' && <User size={16}/>}
              {t === 'vault' && <Eye size={16}/>}
              {t}_Protocol
            </button>
          ))}
        </div>
        
        <div className="mt-auto border-t border-zinc-900 pt-8">
           <p className="text-[8px] text-zinc-600 uppercase font-black mb-3 ml-1 tracking-widest">Active_Audit_Arc</p>
           <select className="bg-zinc-950 text-[#00ffcc] text-[10px] font-bold w-full p-4 rounded outline-none border border-zinc-900 hover:border-zinc-700 transition-all cursor-pointer appearance-none" value={activeSeason?.id} onChange={(e) => setActiveSeason(seasons.find(s => s.id === e.target.value))}>
             {seasons.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
             {seasons.length === 0 && <option>No Arcs Found</option>}
           </select>
        </div>
      </nav>

      {/* MAIN_FORENSIC_VIEW */}
      <main className="flex-1 p-16 overflow-y-auto relative">
        {loading && (
          <div className="absolute top-10 right-10 flex items-center gap-4 bg-zinc-900 border border-[#00ffcc]/30 px-8 py-4 rounded shadow-2xl text-[#00ffcc] text-[10px] font-black uppercase animate-pulse z-50">
            <Cpu size={14} /> [AI_RECONCILING_SIGNAL...]
          </div>
        )}

        <header className="mb-16 flex justify-between items-end border-b border-zinc-900 pb-8">
           <div>
             <h1 className="text-5xl font-black uppercase text-white tracking-tighter italic leading-none">{activeTab}</h1>
             <p className="text-[10px] text-zinc-600 mt-4 uppercase tracking-[0.3em]">Bunker_Status: <span className="text-[#00ffcc]">Encrypted</span></p>
           </div>
           <div className="flex gap-4">
             <button onClick={() => setShowSeasonModal(true)} className="bg-[#00ffcc] text-black px-10 py-4 text-[10px] font-black uppercase flex items-center gap-3 hover:bg-white transition-all shadow-[0_0_20px_rgba(0,255,204,0.2)] active:scale-95"><Plus size={14}/> New Arc</button>
             <button className="bg-zinc-950 text-zinc-700 px-6 py-4 text-[10px] font-black uppercase flex items-center gap-3 border border-zinc-900 hover:text-white transition-all"><HardDriveUpload size={14}/> Source</button>
           </div>
        </header>

        {/* TAB: SEASON (EPISODES) */}
        {activeTab === 'season' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {episodes.map((ep, i) => (
              <div key={i} className="border border-zinc-900 bg-zinc-950 p-8 rounded border-t-2 border-t-zinc-800 hover:border-[#00ffcc]/50 transition-all group relative overflow-hidden">
                <div className="flex justify-between text-[8px] font-black mb-6">
                  <span className="text-zinc-700 uppercase tracking-widest italic">Signal_Node_{i+1}</span>
                  <span className="text-[#00ffcc] opacity-0 group-hover:opacity-100 transition-all underline">UNPATCHED</span>
                </div>
                <h4 className="text-sm font-black uppercase mb-10 leading-tight text-zinc-100 group-hover:text-white">{ep.title || "Unknown Transmission"}</h4>
                <button className="w-full py-4 bg-zinc-900/50 text-zinc-600 text-[9px] font-black uppercase flex items-center justify-center gap-3 hover:bg-[#00ffcc] hover:text-black transition-all border border-zinc-800 group-hover:border-transparent">
                  <PlayCircle size={14} /> Start Audit
                </button>
              </div>
            ))}
            {episodes.length === 0 && (
              <div className="col-span-full py-32 border border-dashed border-zinc-900 flex flex-col items-center justify-center gap-6 rounded-xl">
                 <div className="w-12 h-1 bg-zinc-900" />
                 <p className="text-[10px] text-zinc-700 font-black uppercase tracking-[0.4em]">Arc_Registry_Empty</p>
              </div>
            )}
          </div>
        )}

        {/* TAB: PERSONA (THE VAULT) */}
        {activeTab === 'persona' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
            {personas.map(p => (
              <div key={p.id} className="border border-zinc-900 bg-zinc-950 p-10 rounded border-l-4 border-l-[#00ffcc] shadow-xl hover:bg-black transition-all group">
                <p className="text-[9px] text-[#00ffcc] font-black uppercase mb-2 tracking-[0.2em]">{p.role}</p>
                <h3 className="text-2xl font-black uppercase mb-8 text-white group-hover:italic transition-all">{p.name}</h3>
                <div className="h-px w-10 bg-zinc-800 mb-6 group-hover:w-full transition-all duration-700" />
                <p className="text-[11px] text-zinc-500 italic leading-relaxed font-bold">"{p.trauma}"</p>
              </div>
            ))}
            <button onClick={() => setShowPersonaModal(true)} className="border-2 border-dashed border-zinc-900 p-10 flex flex-col items-center justify-center gap-6 text-zinc-800 hover:text-[#00ffcc] hover:border-[#00ffcc]/30 transition-all bg-black/20">
              <Plus size={40} strokeWidth={1}/>
              <span className="text-[10px] font-black uppercase tracking-widest">Spawn_Identity</span>
            </button>
          </div>
        )}

        {/* TAB: VAULT (LORE & HISTORY) */}
        {activeTab === 'vault' && (
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in duration-500">
              <div className="space-y-12">
                <div className="border border-zinc-900 p-12 rounded bg-zinc-950/50 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10"><Eye size={60}/></div>
                  <h3 className="text-[#00ffcc] text-xs font-black uppercase mb-10 italic tracking-widest border-b border-zinc-900 pb-4 flex items-center gap-3">
                    <ChevronRight size={14}/> Shared_History
                  </h3>
                  <div className="space-y-4">
                    {(vault.shared || []).map((s, i) => (
                      <div key={i} className="text-[11px] text-zinc-500 p-5 bg-black/60 border-l border-zinc-800 font-bold leading-relaxed">
                        {s}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="border border-[#ff4444]/30 p-12 rounded bg-black/80 shadow-[0_0_40px_rgba(255,68,68,0.05)]">
                <h3 className="text-[#ff4444] text-xs font-black uppercase mb-10 italic tracking-widest border-b border-[#ff4444]/10 pb-4">Lore_Decryption</h3>
                <div className="text-[13px] text-[#ff6666] font-mono leading-loose uppercase tracking-tighter whitespace-pre-wrap">
                  {activeSeason?.lore || "> Awaiting signal establishment..."}
                </div>
              </div>
           </div>
        )}
      </main>

      {/* MODAL: INITIALIZE ARC */}
      {showSeasonModal && (
        <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-6 backdrop-blur-md animate-in fade-in">
          <div className="bg-zinc-950 border border-zinc-800 p-12 rounded-2xl max-w-xl w-full shadow-[0_0_100px_rgba(0,0,0,1)] relative">
            <button onClick={() => setShowSeasonModal(false)} className="absolute top-8 right-8 text-zinc-700 hover:text-white"><X size={20}/></button>
            <h2 className="text-3xl font-black uppercase mb-2 italic text-white tracking-tighter">Initialize_Arc</h2>
            <p className="text-[9px] text-zinc-600 uppercase mb-10 tracking-widest">Constructing narrative parameters...</p>
            
            <div className="space-y-10">
              <div className="space-y-3">
                <label className="text-[9px] text-zinc-500 uppercase font-black ml-1">Audit_Target</label>
                <input className="w-full bg-zinc-900 p-5 border border-zinc-800 outline-none text-[#00ffcc] font-bold focus:border-[#00ffcc] transition-all" placeholder="TOPIC_STRING" value={newS.topic} onChange={(e) => setNewS({...newS, topic: e.target.value})} />
              </div>

              <div className="space-y-4">
                <label className="text-[9px] text-zinc-500 uppercase font-black ml-1">Select_Persona_Pairing</label>
                <div className="grid grid-cols-2 gap-3">
                  {personas.map(p => (
                    <button key={p.id} onClick={() => toggleHost(p.id)} className={`p-4 text-[10px] font-black uppercase border transition-all text-left ${newS.host_ids?.includes(p.id) ? 'border-[#00ffcc] text-[#00ffcc] bg-[#00ffcc]/5' : 'border-zinc-800 text-zinc-700 hover:border-zinc-600'}`}>
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[9px] text-zinc-500 uppercase font-black ml-1">Relationship_Dynamic</label>
                <select className="w-full bg-zinc-900 p-5 border border-zinc-800 text-[11px] font-bold text-[#00ffcc] outline-none appearance-none" value={newS.relationship} onChange={(e) => setNewS({...newS, relationship: e.target.value})}>
                  <option value="UST">UNRESOLVED TENSION</option>
                  <option value="FRENEMIES">FRENEMIES</option>
                  <option value="BUDDY_COP">BUDDY COP</option>
                  <option value="VETERAN_ROOKIE">VETERAN / ROOKIE</option>
                </select>
              </div>

              <div className="flex gap-4 pt-6">
                <button onClick={() => setShowSeasonModal(false)} className="flex-1 py-5 border border-zinc-800 text-[10px] uppercase font-black text-zinc-600 hover:text-zinc-300 transition-all">Abort</button>
                <button onClick={handleCreateSeason} className="flex-2 py-5 bg-[#00ffcc] text-black font-black uppercase tracking-widest hover:bg-white transition-all shadow-[0_0_30px_rgba(0,255,204,0.15)]">Establish_Signal</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SPAWN IDENTITY */}
      {showPersonaModal && (
        <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-6 backdrop-blur-md animate-in fade-in">
          <div className="bg-zinc-950 border border-zinc-800 p-12 rounded-2xl max-w-md w-full shadow-2xl">
            <h2 className="text-3xl font-black uppercase mb-10 italic text-white tracking-widest text-center">Spawn_Identity</h2>
            <div className="space-y-6">
              <input className="w-full bg-zinc-900 p-5 border border-zinc-800 text-[#00ffcc] font-bold outline-none focus:border-[#00ffcc]" placeholder="IDENTITY_NAME" value={newP.name} onChange={(e) => setNewP({...newP, name: e.target.value})} />
              <input className="w-full bg-zinc-900 p-5 border border-zinc-800 text-zinc-400 font-bold outline-none focus:border-zinc-600" placeholder="ROLE / EXPERTISE" value={newP.role} onChange={(e) => setNewP({...newP, role: e.target.value})} />
              <textarea className="w-full bg-zinc-900 p-5 border border-zinc-800 h-32 text-xs outline-none text-zinc-500 focus:border-zinc-700 font-bold" placeholder="CORE_BIAS // TRAUMA_STRING" value={newP.trauma} onChange={(e) => setNewP({...newP, trauma: e.target.value})} />
              <div className="flex gap-4 pt-4">
                <button onClick={() => setShowPersonaModal(false)} className="flex-1 py-5 border border-zinc-800 text-[10px] uppercase font-black text-zinc-600 hover:text-zinc-300 transition-all">Cancel</button>
                <button onClick={handleCreatePersona} className="flex-1 py-5 bg-[#00ffcc] text-black font-black uppercase tracking-widest hover:bg-white transition-all">Commit_DNA</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
