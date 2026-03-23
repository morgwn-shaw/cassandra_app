import React, { useState, useEffect } from 'react';
import { Layers, User, Plus, Cpu, Eye, Trash2, PlayCircle, X, Activity, UserPlus, Fingerprint, Database, Zap } from 'lucide-react';

const API_BASE = "https://shadow-cassandrafiles.pythonanywhere.com/api/v2";

const App = () => {
  const [activeTab, setActiveTab] = useState('season');
  const [seasons, setSeasons] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [activeSeason, setActiveSeason] = useState(null);
  const [activePersona, setActivePersona] = useState(null);
  const [showSeasonModal, setShowSeasonModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [liveStatus, setLiveStatus] = useState({ stage: 'IDLE', last_event: 'Ready', active_engine: '...' });
  
  const [showInlinePersona, setShowInlinePersona] = useState(false);
  const [newS, setNewS] = useState({ topic: '', relationship: 'UST', host_ids: [], episodes_count: 10 });
  const [newP, setNewP] = useState({ name: '', role: 'Auditor', trauma: '' });

  useEffect(() => { refreshData(); }, []);

  // Poll for AI status
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/status`);
        setLiveStatus(await res.json());
      } catch (e) {}
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const refreshData = async () => {
    try {
      const sRes = await fetch(`${API_BASE}/season/list`);
      setSeasons(await sRes.json() || []);
      const pRes = await fetch(`${API_BASE}/persona/list`);
      setPersonas(await pRes.json() || []);
    } catch (e) {}
  };

  const handleCreatePersona = async () => {
    setLoading(true);
    try {
        await fetch(`${API_BASE}/persona/create`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newP)
        });
        await refreshData();
        setShowInlinePersona(false);
        setNewP({ name: '', role: 'Auditor', trauma: '' });
    } finally { setLoading(false); }
  };

  const handleCreateSeason = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/season/reconcile`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newS)
      });
      if (!res.ok) throw new Error("AI Signal Rejected");
      setShowSeasonModal(false);
      setNewS({ topic: '', relationship: 'UST', host_ids: [], episodes_count: 10 });
      refreshData();
    } catch (e) { alert(e.message); }
    finally { setLoading(false); }
  };

  const deleteArc = async (id) => {
    if (window.confirm("Purge Arc?")) {
      await fetch(`${API_BASE}/season/delete/${id}`, { method: 'DELETE' });
      refreshData();
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 font-mono flex">
      {/* SIDEBAR */}
      <nav className="w-80 border-r border-zinc-900 bg-black/50 p-8 flex flex-col shadow-2xl">
        <div className="text-[#00ffcc] font-black uppercase text-[11px] mb-8 flex items-center gap-2 tracking-[0.3em]">
          <Zap size={14} className="text-[#00ffcc] animate-pulse" /> Shadow_Console
        </div>
        
        <div className="flex flex-col gap-2">
          <button onClick={() => setActiveTab('season')} className={`flex items-center gap-4 py-3 px-4 text-[10px] font-bold uppercase rounded ${activeTab === 'season' ? 'text-[#00ffcc] bg-[#00ffcc]/5 border-l-2 border-[#00ffcc]' : 'text-zinc-600'}`}>
            <Layers size={16}/> Season_Arcs
          </button>
          <button onClick={() => setActiveTab('persona')} className={`flex items-center gap-4 py-3 px-4 text-[10px] font-bold uppercase rounded ${activeTab === 'persona' ? 'text-[#00ffcc] bg-[#00ffcc]/5 border-l-2 border-[#00ffcc]' : 'text-zinc-600'}`}>
            <Fingerprint size={16}/> DNA_Vault
          </button>
        </div>

        {/* TELEMETRY */}
        <div className={`mt-8 p-5 border rounded bg-black/80 ${liveStatus.stage === 'ERROR' ? 'border-red-950' : 'border-zinc-900'}`}>
           <p className="text-zinc-600 mb-3 flex items-center gap-2 uppercase text-[8px] font-black tracking-widest"><Activity size={10}/> Telemetry</p>
           <div className={`font-black uppercase text-[10px] mb-1 ${liveStatus.stage === 'ERROR' ? 'text-red-500' : 'text-[#00ffcc]'}`}>{liveStatus.stage}</div>
           <div className="text-zinc-500 text-[9px] italic leading-tight">{liveStatus.last_event}</div>
           <div className="mt-4 pt-4 border-t border-zinc-900 text-[8px] text-zinc-800 font-bold uppercase">Engine: {liveStatus.active_engine}</div>
        </div>
      </nav>

      {/* MAIN VIEW */}
      <main className="flex-1 p-16 overflow-y-auto relative">
        <header className="mb-16 flex justify-between items-end border-b border-zinc-900 pb-8">
           <h1 className="text-6xl font-black uppercase text-white italic tracking-tighter">{activeTab}</h1>
           <button onClick={() => setShowSeasonModal(true)} className="bg-[#00ffcc] text-black px-12 py-5 text-[11px] font-black uppercase shadow-[0_0_20px_#00ffcc30] hover:bg-white transition-all flex items-center gap-3">
             <Plus size={18}/> Establish_New_Arc
           </button>
        </header>

        {activeTab === 'season' && (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {seasons.map((s, i) => (
               <div key={i} className="border border-zinc-900 bg-zinc-950 rounded-lg overflow-hidden group hover:border-[#00ffcc]/50 transition-all flex flex-col">
                 <button onClick={() => deleteArc(s.id)} className="bg-red-950/20 py-2 text-red-500 text-[8px] font-black uppercase border-b border-zinc-900 hover:bg-red-500 hover:text-white transition-all">
                    [ Purge_Archive ]
                 </button>
                 <div className="p-8 flex-1" onClick={() => { setActiveSeason(s); setActiveTab('vault'); }}>
                    <h4 className="text-lg font-black text-white uppercase mb-1">{s.title}</h4>
                    <p className="text-[10px] text-zinc-600 italic uppercase mb-8 tracking-widest">{s.relationship} // {s.episodes_count} Nodes</p>
                    <div className="w-full py-4 bg-zinc-900 text-[#00ffcc] text-[10px] font-black uppercase flex items-center justify-center gap-3 group-hover:bg-[#00ffcc] group-hover:text-black transition-all">
                        <PlayCircle size={14}/> Open_Vault
                    </div>
                 </div>
               </div>
             ))}
             {seasons.length === 0 && (
                <button onClick={() => setShowSeasonModal(true)} className="col-span-full py-32 border-2 border-dashed border-zinc-900 rounded-2xl flex flex-col items-center justify-center gap-6 group hover:border-[#00ffcc]/30 transition-all">
                    <Database size={48} className="text-zinc-800 group-hover:text-[#00ffcc] transition-all" />
                    <p className="text-zinc-700 text-xs font-black uppercase tracking-[0.5em] group-hover:text-white transition-all">Initialize_First_Arc</p>
                </button>
             )}
           </div>
        )}

        {activeTab === 'persona' && (
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="space-y-4">
                <h3 className="text-zinc-600 text-[9px] font-black uppercase mb-6 tracking-widest">DNA_Profiles</h3>
                {personas.map(p => (
                  <button key={p.id} onClick={() => setActivePersona(p)} className={`w-full p-6 border text-left rounded transition-all ${activePersona?.id === p.id ? 'border-[#00ffcc] bg-[#00ffcc]/5 shadow-[0_0_15px_#00ffcc10]' : 'border-zinc-900 bg-zinc-950'}`}>
                    <h4 className="font-black text-white uppercase">{p.name}</h4>
                    <p className="text-[9px] text-zinc-500 italic mt-1">{p.role}</p>
                  </button>
                ))}
              </div>
              <div className="lg:col-span-2">
                {activePersona ? (
                  <div className="border border-zinc-900 p-12 rounded bg-zinc-950/50">
                    <h2 className="text-4xl font-black text-[#00ffcc] uppercase italic mb-8">{activePersona.name}</h2>
                    <div className="space-y-8">
                       <p className="text-zinc-500 text-[11px] leading-relaxed italic border-l-2 border-[#ff4444] pl-6 uppercase">"{activePersona.trauma}"</p>
                       <div className="grid grid-cols-1 gap-4">
                          {activePersona.archive?.anecdotes?.slice(0, 10).map((a, i) => (
                             <div key={i} className="p-5 bg-black/40 border border-zinc-900 text-[10px] text-zinc-400 italic">"{a}"</div>
                          ))}
                       </div>
                    </div>
                  </div>
                ) : <div className="h-full flex items-center justify-center border border-zinc-900 rounded py-40 text-zinc-800 font-black uppercase text-[10px] tracking-widest">Select DNA for Audit</div>}
              </div>
           </div>
        )}

        {activeTab === 'vault' && activeSeason && (
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="border border-zinc-900 p-12 rounded bg-zinc-950/50">
                <h2 className="text-4xl font-black text-[#00ffcc] uppercase italic mb-8">{activeSeason.title}</h2>
                <div className="text-[14px] text-[#ff6666] font-mono leading-relaxed uppercase whitespace-pre-wrap pt-8 border-t border-zinc-900/50">{activeSeason.lore}</div>
              </div>
              <div className="border border-zinc-900 p-12 rounded bg-zinc-950/50">
                <h3 className="text-zinc-600 text-xs font-black uppercase mb-8 border-b border-zinc-900 pb-4 italic tracking-widest">3-Act_Nodes</h3>
                <div className="space-y-4">
                    {activeSeason.episodes?.map((ep, idx) => (
                      <div key={idx} className="p-4 border border-zinc-900 bg-zinc-950 flex justify-between items-center group hover:border-[#00ffcc]/40 transition-all">
                        <div>
                            <p className="text-[8px] text-[#00ffcc] font-black uppercase mb-1 opacity-50 italic">Act {ep.act} // Node {idx+1}</p>
                            <h5 className="text-[11px] font-black text-white uppercase">{ep.title}</h5>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
           </div>
        )}
      </main>

      {/* ESTABLISH ARC MODAL */}
      {showSeasonModal && (
        <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-6 backdrop-blur-md">
          <div className="bg-zinc-950 border border-zinc-800 p-12 rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl">
            <button onClick={() => setShowSeasonModal(false)} className="absolute top-8 right-8 text-zinc-700 hover:text-white transition-all"><X size={24}/></button>
            <h2 className="text-4xl font-black uppercase mb-10 text-white italic tracking-tighter">Initialize_Arc</h2>
            
            <div className="space-y-10">
              <div className="space-y-2">
                <label className="text-[9px] text-zinc-600 uppercase font-black ml-1">Topic_String</label>
                <input className="w-full bg-zinc-900 p-5 border border-zinc-800 text-[#00ffcc] font-bold outline-none focus:border-[#00ffcc] transition-all" placeholder="AUDIT_SUBJECT" value={newS.topic} onChange={(e) => setNewS({...newS, topic: e.target.value})} />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[9px] text-zinc-600 uppercase font-black ml-1">DNA_Pairing</label>
                  <button onClick={() => setShowInlinePersona(!showInlinePersona)} className="text-[10px] text-[#00ffcc] font-black uppercase flex items-center gap-2 hover:underline"><UserPlus size={12}/> {showInlinePersona ? 'Cancel' : 'Spawn_Identity'}</button>
                </div>

                {showInlinePersona ? (
                  <div className="p-6 bg-zinc-900 border border-[#00ffcc]/10 space-y-4 rounded-xl">
                    <input className="w-full bg-black p-4 text-[11px] text-[#00ffcc] border border-zinc-800" placeholder="NAME" value={newP.name} onChange={(e) => setNewP({...newP, name: e.target.value})} />
                    <input className="w-full bg-black p-4 text-[11px] text-zinc-500 border border-zinc-800" placeholder="TRAUMA" value={newP.trauma} onChange={(e) => setNewP({...newP, trauma: e.target.value})} />
                    <button onClick={handleCreatePersona} disabled={loading} className="w-full py-4 bg-[#00ffcc] text-black text-[10px] font-black uppercase shadow-lg">Commit_DNA</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {personas.map(p => (
                      <button key={p.id} onClick={() => {
                        const updated = newS.host_ids.includes(p.id) ? newS.host_ids.filter(id => id !== p.id) : [...newS.host_ids, p.id];
                        setNewS({...newS, host_ids: updated});
                      }} className={`p-5 text-[10px] font-black uppercase border transition-all text-left rounded-lg ${newS.host_ids.includes(p.id) ? 'border-[#00ffcc] text-[#00ffcc] bg-[#00ffcc]/5' : 'border-zinc-800 text-zinc-700 hover:border-zinc-500'}`}>
                        {p.name}
                      </button>
                    ))}
                    {personas.length === 0 && <div className="col-span-2 p-6 border border-dashed border-zinc-800 text-center text-[9px] text-zinc-600 uppercase font-black">No DNA Detected. Spawn Identity Above.</div>}
                  </div>
                )}
              </div>

              <button onClick={handleCreateSeason} disabled={loading || !newS.topic || newS.host_ids.length === 0} className={`w-full py-7 font-black uppercase tracking-widest transition-all text-sm rounded-xl ${loading ? 'bg-zinc-900 text-[#00ffcc] animate-pulse' : 'bg-[#00ffcc] text-black hover:bg-white shadow-xl shadow-[#00ffcc]/10'}`}>
                {loading ? `[ ${liveStatus.stage} ]` : "Establish_Signal"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
