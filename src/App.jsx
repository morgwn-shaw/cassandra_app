import React, { useState, useEffect } from 'react';
import { Layers, User, Plus, Cpu, Eye, Trash2, PlayCircle, X, Activity, UserPlus, Database } from 'lucide-react';

const API_BASE = "https://shadow-cassandrafiles.pythonanywhere.com/api/v2";

const App = () => {
  const [activeTab, setActiveTab] = useState('season');
  const [seasons, setSeasons] = useState([]);
  const [activeSeason, setActiveSeason] = useState(null);
  const [personas, setPersonas] = useState([]);
  const [showSeasonModal, setShowSeasonModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [liveStatus, setLiveStatus] = useState({ stage: 'IDLE', last_event: 'Ready', active_engine: '...' });
  
  const [showInlinePersona, setShowInlinePersona] = useState(false);
  const [newS, setNewS] = useState({ topic: '', relationship: 'UST', host_ids: [], episodes_count: 12 });
  const [newP, setNewP] = useState({ name: '', role: 'Auditor', trauma: '' });

  useEffect(() => { refreshData(); }, []);

  useEffect(() => {
    let interval;
    if (loading || liveStatus.stage === 'IDLE') {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`${API_BASE}/status`);
          const data = await res.json();
          setLiveStatus(data);
        } catch (e) {}
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const refreshData = async () => {
    const sRes = await fetch(`${API_BASE}/season/list`);
    setSeasons(await sRes.json() || []);
    const pRes = await fetch(`${API_BASE}/persona/list`);
    setPersonas(await pRes.json() || []);
  };

  const handleCreatePersona = async () => {
    setLoading(true);
    try {
        const res = await fetch(`${API_BASE}/persona/create`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newP)
        });
        const created = await res.json();
        await refreshData();
        setNewS(prev => ({ ...prev, host_ids: [...prev.host_ids, created.id] }));
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
      if (!res.ok) throw new Error("Apex Model Rejected Signal");
      setShowSeasonModal(false);
      refreshData();
    } catch (e) { setLiveStatus({ stage: 'ERROR', last_event: e.message }); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 font-mono flex">
      {/* SIDEBAR */}
      <nav className="w-80 border-r border-zinc-900 bg-black/50 p-8 flex flex-col shadow-2xl">
        <div className="text-[#00ffcc] font-black uppercase text-[10px] mb-8 tracking-[0.3em] flex items-center gap-2">
          <div className="w-2 h-2 bg-[#00ffcc] animate-pulse" /> Shadow_Console_v20.5
        </div>
        
        <div className="flex flex-col gap-2">
          {['season', 'persona', 'vault'].map(t => (
            <button key={t} onClick={() => setActiveTab(t)} className={`flex items-center gap-4 py-3 px-4 text-[10px] font-bold uppercase rounded transition-all ${activeTab === t ? 'text-[#00ffcc] bg-[#00ffcc]/5 border-l-2 border-[#00ffcc]' : 'text-zinc-600'}`}>
              {t === 'season' && <Layers size={16}/>}
              {t === 'persona' && <User size={16}/>}
              {t === 'vault' && <Eye size={16}/>}
              {t}
            </button>
          ))}
        </div>
        
        {/* TELEMETRY WITH ENGINE DISCOVERY */}
        <div className={`mt-8 p-5 border rounded bg-black/80 ${liveStatus.stage === 'ERROR' ? 'border-red-500' : 'border-zinc-900'}`}>
           <div className="text-zinc-600 mb-2 flex justify-between uppercase text-[8px] font-black italic">
             <span>Telemetry</span>
             <span className="text-[#00ffcc] font-mono tracking-tighter">{liveStatus.active_engine?.split('/')[1] || 'Scanning...'}</span>
           </div>
           <div className={`font-black uppercase text-[10px] mb-1 ${liveStatus.stage === 'ERROR' ? 'text-red-500' : 'text-[#00ffcc]'}`}>{liveStatus.stage}</div>
           <div className="text-zinc-500 text-[9px] leading-tight italic">{liveStatus.last_event}</div>
        </div>
      </nav>

      <main className="flex-1 p-16 overflow-y-auto">
        <header className="mb-16 flex justify-between items-end border-b border-zinc-900 pb-8">
           <h1 className="text-5xl font-black uppercase text-white tracking-tighter italic">{activeTab}</h1>
           <button onClick={() => setShowSeasonModal(true)} className="bg-[#00ffcc] text-black px-10 py-4 text-[10px] font-black uppercase hover:bg-white shadow-lg shadow-[#00ffcc]/10"><Plus size={14}/> Establish Arc</button>
        </header>

        {activeTab === 'season' && (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {seasons.map((s, i) => (
               <div key={i} className="border border-zinc-900 bg-zinc-950 rounded relative group hover:border-[#00ffcc]/30 transition-all cursor-pointer overflow-hidden flex flex-col">
                 <button onClick={async (e) => { e.stopPropagation(); if(window.confirm("Purge?")) { await fetch(`${API_BASE}/season/delete/${s.id}`, {method:'DELETE'}); refreshData(); }}} className="w-full bg-red-950/10 py-2 text-red-500 text-[8px] font-black uppercase hover:bg-red-500 border-b border-zinc-900">Purge_Archive</button>
                 <div className="p-8" onClick={() => { setActiveSeason(s); setActiveTab('vault'); }}>
                    <h4 className="text-sm font-black text-white mb-2">{s.title}</h4>
                    <p className="text-[9px] text-zinc-600 italic uppercase">{s.relationship} // {s.episodes_count} NODES</p>
                    <div className="w-full mt-6 py-4 bg-zinc-900 text-[#00ffcc] text-[9px] font-black uppercase flex items-center justify-center gap-3 border border-zinc-800 group-hover:bg-[#00ffcc] group-hover:text-black">
                        <PlayCircle size={14}/> Open_Vault
                    </div>
                 </div>
               </div>
             ))}
           </div>
        )}

        {activeTab === 'vault' && activeSeason && (
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="border border-zinc-900 p-12 rounded bg-zinc-950/50">
                <div className="flex justify-between items-start mb-8">
                    <h2 className="text-2xl font-black text-[#00ffcc] italic">{activeSeason.title}</h2>
                    <span className="text-[8px] text-zinc-700 font-bold border border-zinc-800 px-2 py-1 uppercase">{activeSeason.engine}</span>
                </div>
                <div className="text-[13px] text-[#ff6666] font-mono leading-relaxed uppercase whitespace-pre-wrap border-t border-zinc-900/50 pt-8">{activeSeason.lore}</div>
              </div>
              <div className="border border-zinc-900 p-12 rounded bg-zinc-950/50">
                <h3 className="text-zinc-500 text-xs font-black uppercase mb-8 border-b border-zinc-900 pb-4 italic tracking-widest">Blueprint</h3>
                <div className="space-y-6">
                    {(activeSeason.episodes || []).map((ep, idx) => (
                      <div key={idx} className="border-l-2 border-zinc-800 pl-4 py-2 hover:border-[#00ffcc] group">
                        <p className="text-[8px] text-[#00ffcc] font-black uppercase mb-1 opacity-50 tracking-tighter">ACT {ep.act} // Node {idx+1}</p>
                        <h5 className="text-[11px] font-black text-white uppercase group-hover:text-[#00ffcc]">{ep.title}</h5>
                        <p className="text-[10px] text-zinc-500 italic">{ep.sub_topic}</p>
                      </div>
                    ))}
                </div>
              </div>
           </div>
        )}
      </main>

      {/* ESTABLISH MODAL */}
      {showSeasonModal && (
        <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-6 backdrop-blur-md">
          <div className="bg-zinc-950 border border-zinc-800 p-12 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowSeasonModal(false)} className="absolute top-8 right-8 text-zinc-700 hover:text-white"><X size={20}/></button>
            <h2 className="text-3xl font-black uppercase mb-10 text-white italic tracking-tighter italic">Establish_Arc</h2>
            
            <div className="space-y-8">
              <input className="w-full bg-zinc-900 p-5 border border-zinc-800 text-[#00ffcc] font-bold outline-none" placeholder="TOPIC_STRING" value={newS.topic} onChange={(e) => setNewS({...newS, topic: e.target.value})} />
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[9px] text-zinc-500 uppercase font-black">Identities</label>
                  <button onClick={() => setShowInlinePersona(!showInlinePersona)} className="text-[9px] text-[#00ffcc] flex items-center gap-2 hover:underline"><UserPlus size={12}/> {showInlinePersona ? 'Cancel' : 'Spawn New'}</button>
                </div>

                {showInlinePersona ? (
                  <div className="p-6 bg-zinc-900 border border-[#00ffcc]/10 space-y-4">
                    <input className="w-full bg-black p-3 text-[10px] text-[#00ffcc] border border-zinc-800 font-bold" placeholder="NAME" value={newP.name} onChange={(e) => setNewP({...newP, name: e.target.value})} />
                    <input className="w-full bg-black p-3 text-[10px] text-zinc-500 border border-zinc-800" placeholder="CORE_TRAUMA" value={newP.trauma} onChange={(e) => setNewP({...newP, trauma: e.target.value})} />
                    <button onClick={handleCreatePersona} className="w-full py-3 bg-[#00ffcc] text-black text-[9px] font-black uppercase">Commit_DNA</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {personas.map(p => (
                      <button key={p.id} onClick={() => {
                        const updated = newS.host_ids.includes(p.id) ? newS.host_ids.filter(id => id !== p.id) : [...newS.host_ids, p.id];
                        setNewS({...newS, host_ids: updated});
                      }} className={`p-4 text-[10px] font-black uppercase border transition-all text-left ${newS.host_ids.includes(p.id) ? 'border-[#00ffcc] text-[#00ffcc] bg-[#00ffcc]/5' : 'border-zinc-800 text-zinc-700'}`}>
                        {p.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <label className="text-[9px] text-zinc-500 uppercase font-black">Nodes ({newS.episodes_count})</label>
                <input type="range" min="4" max="24" step="2" className="w-full accent-[#00ffcc]" value={newS.episodes_count} onChange={(e) => setNewS({...newS, episodes_count: e.target.value})} />
              </div>

              <button onClick={handleCreateSeason} disabled={loading || !newS.topic || newS.host_ids.length === 0} className={`w-full py-6 font-black uppercase tracking-widest transition-all ${loading ? 'bg-zinc-900 text-[#00ffcc] animate-pulse' : 'bg-[#00ffcc] text-black hover:bg-white'}`}>
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
