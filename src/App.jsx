import React, { useState, useEffect } from 'react';
import { Layers, User, Plus, Cpu, Eye, HardDriveUpload, PlayCircle, X, ChevronRight, Terminal, Save } from 'lucide-react';

const API_BASE = "https://shadow-cassandrafiles.pythonanywhere.com/api/v2";

const App = () => {
  const [activeTab, setActiveTab] = useState('season');
  const [seasons, setSeasons] = useState([]);
  const [activeSeason, setActiveSeason] = useState(null);
  const [personas, setPersonas] = useState([]);
  const [vault, setVault] = useState({ shared: [], memories: [] });
  const [showSeasonModal, setShowSeasonModal] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Debug State
  const [debugLog, setDebugLog] = useState([]);

  // Persistent Draft State
  const [newS, setNewS] = useState(() => {
    const saved = localStorage.getItem('cassandra_draft');
    return saved ? JSON.parse(saved) : { topic: '', relationship: 'UST', host_ids: [] };
  });

  const [showInlinePersona, setShowInlinePersona] = useState(false);
  const [newP, setNewP] = useState({ name: '', role: 'Forensic Analyst', trauma: '' });

  // Save draft whenever it changes
  useEffect(() => {
    localStorage.setItem('cassandra_draft', JSON.stringify(newS));
  }, [newS]);

  useEffect(() => { refreshData(); }, []);
  
  const addLog = (msg) => setDebugLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 5));

  const refreshData = async () => {
    try {
      addLog("Fetching databases...");
      const sRes = await fetch(`${API_BASE}/season/list`);
      const sData = await sRes.json();
      setSeasons(Array.isArray(sData) ? sData : []);
      if (sData.length > 0 && !activeSeason) setActiveSeason(sData[0]);
      
      const pRes = await fetch(`${API_BASE}/persona/list`);
      const pData = await pRes.json();
      setPersonas(pData || []);
      addLog(`Sync Complete: ${pData.length} personas found.`);
    } catch (e) { addLog(`Connection Error: ${e.message}`); }
  };

  const handleCreateSeason = async () => {
    setLoading(true);
    addLog(`Establishing Signal: ${newS.topic}...`);
    try {
      const res = await fetch(`${API_BASE}/season/reconcile`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newS)
      });
      const data = await res.json();
      addLog(`Signal established. ID: ${data.id}`);
      setShowSeasonModal(false);
      localStorage.removeItem('cassandra_draft');
      setNewS({ topic: '', relationship: 'UST', host_ids: [] });
      refreshData();
    } catch (e) { addLog(`Reconcile Failed: ${e.message}`); }
    finally { setLoading(false); }
  };

  const handleCreatePersona = async () => {
    setLoading(true);
    addLog(`Spawning Identity: ${newP.name}...`);
    try {
      const res = await fetch(`${API_BASE}/persona/create`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newP)
      });
      const data = await res.json();
      addLog(`Identity committed: ${data.persona.id}`);
      setNewP({ name: '', role: 'Forensic Analyst', trauma: '' });
      await refreshData();
      // Automatically select the new persona
      setNewS(prev => ({...prev, host_ids: [...prev.host_ids, data.persona.id]}));
      setShowInlinePersona(false);
    } catch (e) { addLog(`Spawn Error: ${e.message}`); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 font-mono flex">
      {/* SIDEBAR */}
      <nav className="w-72 border-r border-zinc-900 bg-black/50 p-8 flex flex-col shadow-2xl">
        <div className="text-[#00ffcc] font-black tracking-widest uppercase text-[10px] mb-8 flex items-center gap-2">
          <div className="w-2 h-2 bg-[#00ffcc] animate-pulse" /> Cassandra_Shadow_v18.5
        </div>
        
        <div className="flex flex-col gap-2">
          {['season', 'persona', 'vault'].map(t => (
            <button key={t} onClick={() => setActiveTab(t)} className={`flex items-center gap-4 py-3 px-4 text-[10px] font-bold uppercase transition-all rounded ${activeTab === t ? 'text-[#00ffcc] bg-[#00ffcc]/5' : 'text-zinc-600 hover:text-zinc-300'}`}>
              {t === 'season' && <Layers size={16}/>}
              {t === 'persona' && <User size={16}/>}
              {t === 'vault' && <Eye size={16}/>}
              {t}
            </button>
          ))}
        </div>

        {/* DEBUGGER OVERLAY */}
        <div className="mt-8 bg-black/80 border border-zinc-800 p-4 rounded text-[8px] font-bold">
           <p className="text-zinc-600 mb-2 flex items-center gap-2"><Terminal size={10}/> TERMINAL_LOG</p>
           {debugLog.map((log, i) => <div key={i} className="mb-1 text-zinc-500 truncate">{log}</div>)}
        </div>
        
        <div className="mt-auto border-t border-zinc-900 pt-8">
           <p className="text-[8px] text-zinc-600 uppercase font-black mb-2 ml-1">Archive_Selector</p>
           <select className="bg-zinc-950 text-[#00ffcc] text-[10px] font-bold w-full p-4 rounded outline-none border border-zinc-900" value={activeSeason?.id} onChange={(e) => setActiveSeason(seasons.find(s => s.id === e.target.value))}>
             {seasons.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
           </select>
        </div>
      </nav>

      <main className="flex-1 p-16 overflow-y-auto">
        <header className="mb-16 flex justify-between items-end border-b border-zinc-900 pb-8">
           <h1 className="text-5xl font-black uppercase text-white tracking-tighter italic">{activeTab}</h1>
           <button onClick={() => setShowSeasonModal(true)} className="bg-[#00ffcc] text-black px-10 py-4 text-[10px] font-black uppercase flex items-center gap-3 hover:bg-white transition-all"><Plus size={14}/> New Arc</button>
        </header>

        {/* Mapped Content (Standard) */}
        {activeTab === 'season' && (
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {seasons.map((s, i) => (
               <div key={i} className="border border-zinc-900 bg-zinc-950 p-8 rounded hover:border-[#00ffcc]/30 transition-all">
                 <h4 className="text-sm font-black uppercase text-white mb-4">{s.title}</h4>
                 <p className="text-[9px] text-zinc-600 uppercase font-bold mb-6 italic">{s.relationship}</p>
                 <button className="w-full py-4 bg-zinc-900 text-zinc-500 text-[9px] font-black uppercase flex items-center justify-center gap-3 hover:bg-[#00ffcc] hover:text-black transition-all">
                   <PlayCircle size={14} /> Open Audit
                 </button>
               </div>
             ))}
           </div>
        )}
      </main>

      {/* THE UNIFIED MODAL */}
      {showSeasonModal && (
        <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-6 backdrop-blur-md">
          <div className="bg-zinc-950 border border-zinc-800 p-12 rounded-2xl max-w-xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowSeasonModal(false)} className="absolute top-8 right-8 text-zinc-700 hover:text-white"><X size={20}/></button>
            <h2 className="text-3xl font-black uppercase mb-2 italic text-white tracking-tighter">Initialize_Arc</h2>
            <div className="flex items-center gap-2 text-[8px] text-[#00ffcc] uppercase font-black mb-10"><Save size={10}/> Progress_Cached_Locally</div>
            
            <div className="space-y-10">
              {/* 1. TOPIC */}
              <div className="space-y-3">
                <label className="text-[9px] text-zinc-500 uppercase font-black">Audit_Target</label>
                <input className="w-full bg-zinc-900 p-5 border border-zinc-800 text-[#00ffcc] font-bold outline-none focus:border-[#00ffcc]" placeholder="TOPIC_STRING" value={newS.topic} onChange={(e) => setNewS({...newS, topic: e.target.value})} />
              </div>

              {/* 2. PERSONA SELECTION / INLINE ADD */}
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <label className="text-[9px] text-zinc-500 uppercase font-black">Pair_Identities ({newS.host_ids.length})</label>
                  <button onClick={() => setShowInlinePersona(!showInlinePersona)} className="text-[9px] text-[#00ffcc] uppercase font-black hover:underline underline-offset-4">
                    {showInlinePersona ? "Back to Library" : "Spawn New Identity +"}
                  </button>
                </div>

                {showInlinePersona ? (
                  <div className="p-6 bg-zinc-900 border border-[#00ffcc]/10 rounded-lg space-y-4 animate-in fade-in zoom-in-95">
                    <input className="w-full bg-black p-3 text-[10px] text-[#00ffcc] border border-zinc-800" placeholder="NAME" value={newP.name} onChange={(e) => setNewP({...newP, name: e.target.value})} />
                    <textarea className="w-full bg-black p-3 text-[10px] text-zinc-500 border border-zinc-800 h-20" placeholder="BIAS // TRAUMA" value={newP.trauma} onChange={(e) => setNewP({...newP, trauma: e.target.value})} />
                    <button onClick={handleCreatePersona} disabled={loading} className="w-full py-3 bg-[#00ffcc] text-black text-[9px] font-black uppercase disabled:opacity-50">Commit_Identity</button>
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

              {/* 3. DYNAMIC */}
              <div className="space-y-3">
                <label className="text-[9px] text-zinc-500 uppercase font-black">Relationship_Dynamic</label>
                <select className="w-full bg-zinc-900 p-5 border border-zinc-800 text-[11px] font-bold text-[#00ffcc]" value={newS.relationship} onChange={(e) => setNewS({...newS, relationship: e.target.value})}>
                  <option value="UST">UNRESOLVED TENSION</option>
                  <option value="FRENEMIES">FRENEMIES</option>
                  <option value="BUDDY_COP">BUDDY COP</option>
                </select>
              </div>

              <button 
                onClick={handleCreateSeason} 
                disabled={loading || !newS.topic || newS.host_ids.length === 0}
                className="w-full py-5 bg-[#00ffcc] text-black font-black uppercase tracking-widest hover:bg-white transition-all disabled:opacity-20 shadow-lg"
              >
                {loading ? "Establishing_Signal..." : "Establish_Signal"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
