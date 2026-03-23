import React, { useState, useEffect } from 'react';
import { Layers, Plus, Cpu, Eye, Trash2, PlayCircle, X, Activity, UserPlus, Fingerprint, Database, Zap, Terminal, CheckCircle } from 'lucide-react';

const API_BASE = "https://shadow-cassandrafiles.pythonanywhere.com/api/v2";

const App = () => {
  const [activeTab, setActiveTab] = useState('season');
  const [seasons, setSeasons] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [activeSeason, setActiveSeason] = useState(null);
  const [activePersona, setActivePersona] = useState(null);
  const [showSeasonModal, setShowSeasonModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [liveStatus, setLiveStatus] = useState({ stage: 'IDLE', last_event: 'Ready', history: [], active_engine: '...' });
  
  const [showInlinePersona, setShowInlinePersona] = useState(false);
  const [newS, setNewS] = useState({ topic: '', relationship: 'UST', host_ids: [], episodes_count: 12 });
  const [newP, setNewP] = useState({ name: '', role: 'Auditor', trauma: '' });

  useEffect(() => { refreshData(); }, []);

  // POLLING: Tracks the backend progress in real-time
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/status`);
        const data = await res.json();
        setLiveStatus(data);
        if (loading && (data.stage === 'IDLE' || data.stage === 'ERROR')) {
           // Auto-close overlay on success, or leave it for errors
           if(data.stage === 'IDLE') setTimeout(() => setLoading(false), 1500);
        }
      } catch (e) {}
    }, 1000);
    return () => clearInterval(interval);
  }, [loading]);

  const refreshData = async () => {
    try {
      const sRes = await fetch(`${API_BASE}/season/list`);
      setSeasons(await sRes.json() || []);
      const pRes = await fetch(`${API_BASE}/persona/list`);
      setPersonas(await pRes.json() || []);
    } catch (e) {}
  };

  const handleCreateSeason = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/season/reconcile`, {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(newS)
      });
      if (!res.ok) throw new Error("AI Engine Bounced Request");
      setShowSeasonModal(false);
      await refreshData();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 font-mono flex overflow-hidden">
      
      {/* SIDEBAR */}
      <nav className="w-80 border-r border-zinc-900 bg-black/50 p-8 flex flex-col shadow-2xl z-10">
        <div className="text-[#00ffcc] font-black uppercase text-[11px] mb-8 flex items-center gap-2 tracking-[0.3em]">
          <Zap size={14} className="animate-pulse shadow-[0_0_10px_#00ffcc]" /> Shadow_Console
        </div>
        <div className="flex flex-col gap-2">
          <button onClick={() => setActiveTab('season')} className={`flex items-center gap-4 py-3 px-4 text-[10px] font-bold uppercase rounded ${activeTab === 'season' ? 'text-[#00ffcc] bg-[#00ffcc]/5 border-l-2 border-[#00ffcc]' : 'text-zinc-600'}`}>
            <Layers size={16}/> Season_Arcs
          </button>
          <button onClick={() => setActiveTab('persona')} className={`flex items-center gap-4 py-3 px-4 text-[10px] font-bold uppercase rounded ${activeTab === 'persona' ? 'text-[#00ffcc] bg-[#00ffcc]/5 border-l-2 border-[#00ffcc]' : 'text-zinc-600'}`}>
            <Fingerprint size={16}/> DNA_Vault
          </button>
        </div>
        
        {/* SIDEBAR TELEMETRY MINI-VIEW */}
        <div className="mt-8 p-5 border border-zinc-900 rounded bg-black/80">
           <p className="text-zinc-600 mb-2 flex justify-between uppercase text-[8px] font-black italic">
             <span>Live_Feed</span>
             <span className="text-[#00ffcc]">{liveStatus.active_engine?.split('/')[1] || 'Scanning...'}</span>
           </p>
           <div className={`font-black uppercase text-[10px] mb-1 ${liveStatus.stage === 'ERROR' ? 'text-red-500' : 'text-[#00ffcc]'}`}>{liveStatus.stage}</div>
        </div>
      </nav>

      {/* MAIN VIEW */}
      <main className="flex-1 p-16 overflow-y-auto relative">
        <header className="mb-16 flex justify-between items-end border-b border-zinc-900 pb-8">
           <h1 className="text-6xl font-black uppercase text-white italic tracking-tighter">{activeTab}</h1>
           {/* CREATE SEASON BUTTON RESTORED */}
           <button onClick={() => setShowSeasonModal(true)} className="bg-[#00ffcc] text-black px-12 py-5 text-[11px] font-black uppercase hover:bg-white transition-all shadow-[0_0_20px_#00ffcc20] flex items-center gap-3">
             <Plus size={18}/> Create_New_Season
           </button>
        </header>

        {activeTab === 'season' && (
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {seasons.map((s, i) => (
               <div key={i} className="border border-zinc-900 bg-zinc-950 rounded-lg group hover:border-[#00ffcc]/30 transition-all flex flex-col relative overflow-hidden min-h-[220px]">
                 <button onClick={async (e) => { e.stopPropagation(); await fetch(`${API_BASE}/season/delete/${s.id}`, {method:'DELETE'}); refreshData(); }} className="bg-red-950/20 py-2 text-red-500 text-[8px] font-black uppercase hover:bg-red-500 hover:text-white border-b border-zinc-900 transition-all">Purge_Archive</button>
                 <div className="p-8 flex-1 flex flex-col cursor-pointer" onClick={() => { setActiveSeason(s); setActiveTab('vault'); }}>
                    <h4 className="text-lg font-black text-white uppercase mb-1">{s.title}</h4>
                    <p className="text-[10px] text-zinc-600 italic uppercase mb-8">{s.relationship} // {s.episodes_count} Nodes</p>
                    <div className="mt-auto w-full py-4 bg-zinc-900 text-[#00ffcc] text-[10px] font-black uppercase flex items-center justify-center gap-3 border border-zinc-800 group-hover:bg-[#00ffcc] group-hover:text-black transition-all">
                        <PlayCircle size={14}/> View_Blueprint
                    </div>
                 </div>
               </div>
             ))}
             {seasons.length === 0 && <button onClick={() => setShowSeasonModal(true)} className="col-span-full py-32 border-2 border-dashed border-zinc-900 rounded-3xl text-zinc-800 hover:text-[#00ffcc] hover:border-[#00ffcc]/20 transition-all flex flex-col items-center justify-center gap-4 font-black uppercase text-[10px] tracking-[0.4em]">Initialize_Registry</button>}
           </div>
        )}

        {/* VAULT: VIEWING SHARED LORE */}
        {activeTab === 'vault' && activeSeason && (
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in duration-500">
              <div className="border border-zinc-900 p-12 rounded bg-zinc-950/50">
                <h2 className="text-4xl font-black text-[#00ffcc] uppercase italic mb-8 border-b border-zinc-900 pb-4">{activeSeason.title}</h2>
                <h4 className="text-zinc-600 text-[9px] font-black uppercase mb-6 tracking-widest border-b border-zinc-900 pb-2 italic">Synthesized_Shared_Lore</h4>
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-4">
                    {(activeSeason.shared_lore || []).map((l, i) => (
                        <div key={i} className="text-[12px] text-[#ff6666] font-mono leading-relaxed uppercase border-l-2 border-red-900/40 pl-6 pb-4 italic tracking-tighter">"{l}"</div>
                    ))}
                </div>
              </div>
              <div className="border border-zinc-900 p-12 rounded bg-zinc-950/50">
                <h4 className="text-zinc-600 text-[9px] font-black uppercase mb-8 border-b border-zinc-900 pb-2 italic">3-Act_Structure</h4>
                <div className="space-y-4">
                    {activeSeason.episodes?.map((ep, idx) => (
                      <div key={idx} className="p-4 border border-zinc-800 bg-black/40 flex justify-between items-center group hover:border-[#00ffcc]/40 transition-all">
                        <div>
                            <p className="text-[8px] text-[#00ffcc] font-black uppercase mb-1 opacity-50 italic">Act {ep.act} // Node {idx+1}</p>
                            <h5 className="text-[11px] font-black text-white uppercase group-hover:text-[#00ffcc] transition-all">{ep.title}</h5>
                            <p className="text-[10px] text-zinc-500 italic mt-1 uppercase tracking-tighter">{ep.sub_topic}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
           </div>
        )}
      </main>

      {/* TELEMETRY TERMINAL OVERLAY */}
      {loading && (
        <div className="fixed inset-0 bg-black/95 z-[500] flex flex-col items-center justify-center p-12 backdrop-blur-xl">
           <div className="w-full max-w-2xl border border-zinc-800 bg-black rounded-2xl p-10 shadow-[0_0_50px_rgba(0,0,0,1)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00ffcc] to-transparent animate-pulse" />
              
              <div className="flex justify-between items-start mb-10">
                <div>
                   <h3 className="text-[#00ffcc] font-black uppercase text-xs tracking-[0.4em] mb-2">Forensic_Processing_Core</h3>
                   <div className="flex items-center gap-3 text-zinc-600 text-[10px] font-bold">
                      <Terminal size={14} className="animate-pulse text-[#00ffcc]" />
                      <span>ENGINE: <span className="text-white">{liveStatus.active_engine}</span></span>
                   </div>
                </div>
                {liveStatus.stage === 'ERROR' && (
                  <button onClick={() => setLoading(false)} className="bg-red-500 text-white px-6 py-2 rounded font-black uppercase text-[10px] flex items-center gap-2 shadow-lg">
                    <X size={14}/> Abort_Archive
                  </button>
                )}
                {liveStatus.stage === 'IDLE' && (
                  <button onClick={() => setLoading(false)} className="bg-[#00ffcc] text-black px-6 py-2 rounded font-black uppercase text-[10px] flex items-center gap-2 shadow-[0_0_15px_#00ffcc]">
                    <CheckCircle size={14}/> Finalize_View
                  </button>
                )}
              </div>

              <div className="bg-zinc-950 border border-zinc-900 p-8 rounded-lg font-mono text-[11px] h-72 overflow-y-auto space-y-3">
                 {liveStatus.history.map((log, i) => (
                   <div key={i} className={`flex gap-4 ${i === liveStatus.history.length - 1 ? 'text-[#00ffcc] animate-in fade-in slide-in-from-left-2' : 'text-zinc-700'}`}>
                      <span className="opacity-30 whitespace-nowrap">{i + 1}</span>
                      <span className="font-bold">{log}</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      )}

      {/* ESTABLISH ARC MODAL */}
      {showSeasonModal && (
        <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-6 backdrop-blur-md">
          <div className="bg-zinc-950 border border-zinc-800 p-12 rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto relative">
            <button onClick={() => setShowSeasonModal(false)} className="absolute top-8 right-8 text-zinc-700 hover:text-white transition-all"><X size={24}/></button>
            <h2 className="text-4xl font-black uppercase mb-10 text-white italic tracking-tighter italic">Establish_Season</h2>
            <div className="space-y-10">
              <input className="w-full bg-zinc-900 p-5 border border-zinc-800 text-[#00ffcc] font-bold outline-none" placeholder="TOPIC_STRING" value={newS.topic} onChange={(e) => setNewS({...newS, topic: e.target.value})} />
              
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[9px] text-zinc-600 uppercase font-black tracking-widest">DNA_Archive_Pairing</label>
                  <button onClick={() => setShowInlinePersona(!showInlinePersona)} className="text-[10px] text-[#00ffcc] font-black uppercase flex items-center gap-2 hover:underline"><UserPlus size={12}/> Spawn_New</button>
                </div>

                {showInlinePersona ? (
                  <div className="p-6 bg-zinc-900 border border-[#00ffcc]/10 space-y-4 rounded-xl">
                    <input className="w-full bg-black p-4 text-[11px] text-[#00ffcc] border border-zinc-800" placeholder="NAME" value={newP.name} onChange={(e) => setNewP({...newP, name: e.target.value})} />
                    <input className="w-full bg-black p-4 text-[11px] text-zinc-500 border border-zinc-800" placeholder="TRAUMA" value={newP.trauma} onChange={(e) => setNewP({...newP, trauma: e.target.value})} />
                    <button onClick={async () => { setLoading(true); await fetch(`${API_BASE}/persona/create`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(newP)}); await refreshData(); setShowInlinePersona(false); }} className="w-full py-4 bg-[#00ffcc] text-black text-[10px] font-black uppercase">Commit_DNA</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {personas.map(p => (
                      <button key={p.id} onClick={() => {
                        const updated = newS.host_ids.includes(p.id) ? newS.host_ids.filter(id => id !== p.id) : [...newS.host_ids, p.id];
                        setNewS({...newS, host_ids: updated});
                      }} className={`p-5 text-[10px] font-black uppercase border transition-all text-left rounded-lg ${newS.host_ids.includes(p.id) ? 'border-[#00ffcc] text-[#00ffcc] bg-[#00ffcc]/5 shadow-[0_0_20px_#00ffcc10]' : 'border-zinc-800 text-zinc-700'}`}>
                        {p.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <label className="text-[9px] text-zinc-600 uppercase font-black">Node_Count ({newS.episodes_count})</label>
                <input type="range" min="4" max="24" step="2" className="w-full accent-[#00ffcc]" value={newS.episodes_count} onChange={(e) => setNewS({...newS, episodes_count: e.target.value})} />
              </div>

              <button onClick={handleCreateSeason} disabled={loading || !newS.topic || newS.host_ids.length < 2} className={`w-full py-7 font-black uppercase tracking-widest transition-all rounded-xl ${loading ? 'bg-zinc-900 text-zinc-800 animate-pulse cursor-not-allowed' : 'bg-[#00ffcc] text-black hover:bg-white shadow-xl shadow-[#00ffcc]/10'}`}>
                Establish_Signal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
