import React, { useState, useEffect } from 'react';
import { Layers, User, Plus, Cpu, Eye, Trash2, PlayCircle, X, Activity, UserPlus, Fingerprint, Database, Zap, Quote } from 'lucide-react';

const API_BASE = "https://shadow-cassandrafiles.pythonanywhere.com/api/v2";

const App = () => {
  const [activeTab, setActiveTab] = useState('season');
  const [seasons, setSeasons] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [activeSeason, setActiveSeason] = useState(null);
  const [activePersona, setActivePersona] = useState(null);
  const [showSeasonModal, setShowSeasonModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [liveStatus, setLiveStatus] = useState({ stage: 'IDLE', last_event: 'Ready' });
  
  const [showInlinePersona, setShowInlinePersona] = useState(false);
  const [newS, setNewS] = useState({ topic: '', relationship: 'UST', host_ids: [], episodes_count: 10 });
  const [newP, setNewP] = useState({ name: '', role: 'Auditor', trauma: '' });

  useEffect(() => { refreshData(); }, []);

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
    } finally { setLoading(false); }
  };

  const handleCreateSeason = async () => {
    setLoading(true);
    try {
      await fetch(`${API_BASE}/season/reconcile`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newS)
      });
      setShowSeasonModal(false);
      refreshData();
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 font-mono flex">
      <nav className="w-80 border-r border-zinc-900 bg-black/50 p-8 flex flex-col shadow-2xl">
        <div className="text-[#00ffcc] font-black uppercase text-[11px] mb-8 flex items-center gap-2 tracking-[0.3em]">
          <Zap size={14} className="text-[#00ffcc]" /> Cassandra_Shadow
        </div>
        <div className="flex flex-col gap-2">
          <button onClick={() => setActiveTab('season')} className={`flex items-center gap-4 py-3 px-4 text-[10px] font-bold uppercase rounded ${activeTab === 'season' ? 'text-[#00ffcc] bg-[#00ffcc]/5 border-l-2 border-[#00ffcc]' : 'text-zinc-600'}`}>
            <Layers size={16}/> Season_Arcs
          </button>
          <button onClick={() => setActiveTab('persona')} className={`flex items-center gap-4 py-3 px-4 text-[10px] font-bold uppercase rounded ${activeTab === 'persona' ? 'text-[#00ffcc] bg-[#00ffcc]/5 border-l-2 border-[#00ffcc]' : 'text-zinc-600'}`}>
            <Fingerprint size={16}/> DNA_Vault
          </button>
        </div>
        <div className="mt-8 p-5 border border-zinc-900 rounded bg-black/80">
           <div className={`font-black uppercase text-[10px] ${loading ? 'text-[#00ffcc] animate-pulse' : 'text-zinc-600'}`}>{liveStatus.stage}</div>
           <div className="text-zinc-500 text-[9px] mt-2 italic leading-tight">{liveStatus.last_event}</div>
        </div>
      </nav>

      <main className="flex-1 p-16 overflow-y-auto">
        <header className="mb-16 flex justify-between items-end border-b border-zinc-900 pb-8">
           <h1 className="text-6xl font-black uppercase text-white italic tracking-tighter">{activeTab}</h1>
           {/* THE CREATE SEASON BUTTON - ALWAYS HERE */}
           <button onClick={() => setShowSeasonModal(true)} className="bg-[#00ffcc] text-black px-12 py-5 text-[11px] font-black uppercase shadow-[0_0_20px_#00ffcc30] hover:bg-white transition-all flex items-center gap-3">
             <Plus size={18}/> Create_New_Season
           </button>
        </header>

        {activeTab === 'persona' && (
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 animate-in fade-in duration-700">
              <div className="space-y-4">
                {personas.map(p => (
                  <button key={p.id} onClick={() => setActivePersona(p)} className={`w-full p-6 border text-left rounded transition-all ${activePersona?.id === p.id ? 'border-[#00ffcc] bg-[#00ffcc]/5' : 'border-zinc-900 bg-zinc-950'}`}>
                    <h4 className="font-black text-white uppercase">{p.name}</h4>
                    <p className="text-[9px] text-zinc-500 italic mt-1">{p.role}</p>
                  </button>
                ))}
              </div>
              <div className="lg:col-span-2">
                {activePersona ? (
                  <div className="border border-zinc-900 p-12 rounded bg-zinc-950/50 space-y-12">
                    <h2 className="text-4xl font-black text-[#00ffcc] uppercase italic">{activePersona.name}</h2>
                    <div>
                        <h4 className="text-zinc-600 text-[10px] font-black uppercase mb-4 tracking-widest border-b border-zinc-900 pb-2 flex items-center gap-2"><Quote size={12}/> Character_Dossier</h4>
                        <div className="text-[12px] text-zinc-400 leading-relaxed whitespace-pre-wrap font-sans">{activePersona.archive?.bio}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <h4 className="text-zinc-600 text-[10px] font-black uppercase mb-4">Verbal_DNA</h4>
                            <div className="text-[11px] text-[#00ffcc] italic">Ticks: {activePersona.archive?.linguistic_profile?.ticks?.join(', ')}</div>
                            <div className="text-[11px] text-zinc-500 mt-2 uppercase font-black">Reading_Level: {activePersona.archive?.linguistic_profile?.reading_level}/10</div>
                        </div>
                        <div>
                            <h4 className="text-zinc-600 text-[10px] font-black uppercase mb-4">Likes_Matrix</h4>
                            <div className="text-[10px] flex flex-wrap gap-2">
                                {activePersona.archive?.likes?.slice(0, 15).map((l, i) => <span key={i} className="px-2 py-1 bg-zinc-900 border border-zinc-800 text-zinc-500">+{l}</span>)}
                            </div>
                        </div>
                    </div>
                  </div>
                ) : <div className="h-full flex items-center justify-center border border-zinc-900 rounded py-40 text-zinc-800 font-black uppercase">Select_DNA_Profile</div>}
              </div>
           </div>
        )}

        {activeTab === 'season' && (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {seasons.map((s, i) => (
               <div key={i} className="border border-zinc-900 bg-zinc-950 p-8 rounded relative hover:border-[#00ffcc]/40 transition-all cursor-pointer group">
                  <button onClick={async (e) => { e.stopPropagation(); await fetch(`${API_BASE}/season/delete/${s.id}`, {method:'DELETE'}); refreshData(); }} className="absolute top-4 right-4 text-zinc-800 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16}/></button>
                  <h4 className="text-xl font-black text-white uppercase mb-1">{s.title}</h4>
                  <p className="text-[10px] text-zinc-600 italic uppercase mb-8">{s.relationship}</p>
                  <div onClick={() => { setActiveSeason(s); setActiveTab('vault'); }} className="w-full py-4 bg-zinc-900 text-[#00ffcc] text-[10px] font-black uppercase flex items-center justify-center gap-3 group-hover:bg-[#00ffcc] group-hover:text-black">
                    <PlayCircle size={14}/> Open_Vault
                  </div>
               </div>
             ))}
           </div>
        )}

        {/* VAULT: VIEWING SHARED LORE & BLUEPRINT */}
        {activeTab === 'vault' && activeSeason && (
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in duration-500">
              <div className="border border-zinc-900 p-12 rounded bg-zinc-950/50">
                <h2 className="text-4xl font-black text-[#00ffcc] uppercase italic mb-8 border-b border-zinc-900 pb-4">{activeSeason.title}</h2>
                <h4 className="text-zinc-600 text-[10px] font-black uppercase mb-6 tracking-widest italic underline decoration-red-900 underline-offset-8">Synthesized_Shared_Lore</h4>
                <div className="space-y-4">
                    {(activeSeason.shared_lore || []).map((l, i) => (
                        <div key={i} className="text-[12px] text-[#ff6666] font-mono leading-relaxed uppercase border-l border-red-900/30 pl-4">{l}</div>
                    ))}
                </div>
              </div>
              <div className="border border-zinc-900 p-12 rounded bg-zinc-950/50">
                <h4 className="text-zinc-600 text-[10px] font-black uppercase mb-8 border-b border-zinc-900 pb-4 italic tracking-widest">3-Act_Nodes</h4>
                <div className="space-y-4">
                    {activeSeason.episodes?.map((ep, idx) => (
                      <div key={idx} className="p-4 border border-zinc-800 bg-black/40 flex justify-between items-center group hover:border-[#00ffcc]/30 transition-all">
                        <div>
                            <p className="text-[8px] text-[#00ffcc] font-black uppercase mb-1 opacity-50">Act {ep.act} // Node {idx+1}</p>
                            <h5 className="text-[11px] font-black text-white uppercase">{ep.title}</h5>
                            <p className="text-[9px] text-zinc-500 italic mt-1 uppercase">{ep.sub_topic}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
           </div>
        )}
      </main>

      {/* MODAL: CREATE SEASON */}
      {showSeasonModal && (
        <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-6 backdrop-blur-md">
          <div className="bg-zinc-950 border border-zinc-800 p-12 rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl">
            <button onClick={() => setShowSeasonModal(false)} className="absolute top-8 right-8 text-zinc-700 hover:text-white transition-all"><X size={24}/></button>
            <h2 className="text-4xl font-black uppercase mb-10 text-white italic tracking-tighter">Initialize_Season</h2>
            
            <div className="space-y-10">
              <input className="w-full bg-zinc-900 p-5 border border-zinc-800 text-[#00ffcc] font-bold outline-none" placeholder="TOPIC_STRING" value={newS.topic} onChange={(e) => setNewS({...newS, topic: e.target.value})} />
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[9px] text-zinc-600 uppercase font-black">DNA_Selection</label>
                  <button onClick={() => setShowInlinePersona(!showInlinePersona)} className="text-[10px] text-[#00ffcc] font-black uppercase flex items-center gap-2 hover:underline"><UserPlus size={12}/> {showInlinePersona ? 'Cancel' : 'Spawn_Identity'}</button>
                </div>

                {showInlinePersona ? (
                  <div className="p-6 bg-zinc-900 border border-[#00ffcc]/10 space-y-4 rounded-xl">
                    <input className="w-full bg-black p-4 text-[11px] text-[#00ffcc] border border-zinc-800" placeholder="NAME" value={newP.name} onChange={(e) => setNewP({...newP, name: e.target.value})} />
                    <input className="w-full bg-black p-4 text-[11px] text-zinc-500 border border-zinc-800" placeholder="TRAUMA" value={newP.trauma} onChange={(e) => setNewP({...newP, trauma: e.target.value})} />
                    <button onClick={handleCreatePersona} className="w-full py-4 bg-[#00ffcc] text-black text-[10px] font-black uppercase">Commit_DNA</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {personas.map(p => (
                      <button key={p.id} onClick={() => {
                        const updated = newS.host_ids.includes(p.id) ? newS.host_ids.filter(id => id !== p.id) : [...newS.host_ids, p.id];
                        setNewS({...newS, host_ids: updated});
                      }} className={`p-5 text-[10px] font-black uppercase border transition-all text-left rounded-lg ${newS.host_ids.includes(p.id) ? 'border-[#00ffcc] text-[#00ffcc] bg-[#00ffcc]/5 shadow-[0_0_20px_#00ffcc10]' : 'border-zinc-800 text-zinc-700 hover:border-zinc-500'}`}>
                        {p.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button onClick={handleCreateSeason} disabled={loading || !newS.topic || newS.host_ids.length < 2} className={`w-full py-7 font-black uppercase transition-all rounded-xl ${loading ? 'bg-zinc-900 text-[#00ffcc] animate-pulse' : 'bg-[#00ffcc] text-black hover:bg-white shadow-xl shadow-[#00ffcc]/10'}`}>
                {loading ? `[ SYNTHESIZING_SEASON ]` : "Establish_Signal"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
