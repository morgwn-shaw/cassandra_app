import React, { useState, useEffect } from 'react';
import { Layers, Plus, Cpu, Eye, Trash2, PlayCircle, X, Activity, UserPlus, Fingerprint, Database, Zap, Terminal, Code } from 'lucide-react';

const API_BASE = "https://shadow-cassandrafiles.pythonanywhere.com/api/v2";

const App = () => {
  const [activeTab, setActiveTab] = useState('season');
  const [seasons, setSeasons] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [activeSeason, setActiveSeason] = useState(null);
  const [showSeasonModal, setShowSeasonModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [liveStatus, setLiveStatus] = useState({ stage: 'IDLE', last_event: 'Ready', history: [], active_engine: '...', request_monitor: '{}', response_monitor: '{}' });
  
  const [newS, setNewS] = useState({ topic: '', relationship: 'UST', host_ids: [], episodes_count: 10 });
  const [newP, setNewP] = useState({ name: '', role: 'Auditor', trauma: '' });

  // POLLING: Aggressive 1s poll for the God-Mode Console
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/status`);
        const data = await res.json();
        setLiveStatus(data);
      } catch (e) { console.error("Poll Failed"); }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => { refreshData(); }, []);

  const refreshData = async () => {
    const sRes = await fetch(`${API_BASE}/season/list`);
    setSeasons(await sRes.json() || []);
    const pRes = await fetch(`${API_BASE}/persona/list`);
    setPersonas(await pRes.json() || []);
  };

  const handleCreatePersona = async () => {
    setLoading(true);
    console.log("SENDING PERSONA REQ:", newP);
    await fetch(`${API_BASE}/persona/create`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(newP) });
    await refreshData();
    setLoading(false);
  };

  const handleCreateSeason = async () => {
    setLoading(true);
    console.log("SENDING SEASON REQ:", newS);
    await fetch(`${API_BASE}/season/reconcile`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(newS) });
    await refreshData();
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#020202] text-zinc-300 font-mono flex overflow-hidden">
      
      {/* GOD-MODE SIDEBAR (EXPANDED) */}
      <nav className="w-[450px] border-r border-zinc-800 bg-black p-6 flex flex-col shadow-2xl overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between mb-8">
            <div className="text-[#00ffcc] font-black uppercase text-[10px] tracking-[0.4em] flex items-center gap-2">
                <Zap size={14} className="animate-pulse" /> Shadow_God_Mode
            </div>
            <div className="px-2 py-1 bg-zinc-900 rounded text-[8px] text-zinc-500 font-bold border border-zinc-800">
                v22.0
            </div>
        </div>
        
        <div className="flex gap-2 mb-8">
          <button onClick={() => setActiveTab('season')} className={`flex-1 py-3 text-[9px] font-black uppercase border transition-all ${activeTab === 'season' ? 'border-[#00ffcc] text-[#00ffcc] bg-[#00ffcc]/5' : 'border-zinc-900 text-zinc-700'}`}>Arcs</button>
          <button onClick={() => setActiveTab('persona')} className={`flex-1 py-3 text-[9px] font-black uppercase border transition-all ${activeTab === 'persona' ? 'border-[#00ffcc] text-[#00ffcc] bg-[#00ffcc]/5' : 'border-zinc-900 text-zinc-700'}`}>DNA</button>
        </div>

        {/* THE TERMINAL LOG */}
        <div className="flex-1 flex flex-col gap-4">
            <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-lg">
                <p className="text-[#00ffcc] text-[9px] font-black uppercase mb-4 flex items-center gap-2"><Activity size={12}/> System_Status: {liveStatus.stage}</p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                    {liveStatus.history.map((log, i) => (
                        <div key={i} className="text-[10px] text-zinc-500 font-bold border-l border-zinc-800 pl-3 py-1">
                            {log}
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-lg overflow-hidden">
                <p className="text-purple-400 text-[9px] font-black uppercase mb-3 flex items-center gap-2"><Code size={12}/> Raw_Inbound_Payload</p>
                <pre className="text-[9px] text-zinc-600 bg-black/40 p-3 rounded overflow-x-auto whitespace-pre-wrap leading-tight h-32">
                    {liveStatus.request_monitor}
                </pre>
            </div>

            <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-lg overflow-hidden">
                <p className="text-blue-400 text-[9px] font-black uppercase mb-3 flex items-center gap-2"><Cpu size={12}/> Engine_Response</p>
                <pre className="text-[9px] text-zinc-600 bg-black/40 p-3 rounded overflow-x-auto whitespace-pre-wrap leading-tight h-32">
                    {liveStatus.response_monitor}
                </pre>
            </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-16 overflow-y-auto bg-zinc-950/20 relative">
        <header className="mb-12 flex justify-between items-end border-b border-zinc-900 pb-8">
           <h1 className="text-5xl font-black uppercase text-white italic tracking-tighter">{activeTab}</h1>
           <button onClick={() => setShowSeasonModal(true)} className="bg-[#00ffcc] text-black px-12 py-5 text-[11px] font-black uppercase shadow-[0_0_20px_#00ffcc30] hover:bg-white transition-all">
             Initialize_Signal
           </button>
        </header>

        {activeTab === 'season' && (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             {seasons.map((s, i) => (
               <div key={i} className="border border-zinc-900 bg-black p-8 rounded-lg group hover:border-[#00ffcc]/30 transition-all flex flex-col relative overflow-hidden">
                 <button onClick={async (e) => { e.stopPropagation(); await fetch(`${API_BASE}/season/delete/${s.id}`, {method:'DELETE'}); refreshData(); }} className="absolute top-4 right-4 text-red-900 hover:text-red-500 transition-all"><Trash2 size={20}/></button>
                 <h4 className="text-xl font-black text-white uppercase mb-1">{s.title}</h4>
                 <p className="text-[10px] text-zinc-600 italic uppercase mb-6">{s.relationship}</p>
                 <button onClick={() => { setActiveSeason(s); setActiveTab('vault'); }} className="w-full py-4 bg-zinc-900 text-[#00ffcc] text-[10px] font-black uppercase flex items-center justify-center gap-3 border border-zinc-800 group-hover:bg-[#00ffcc] group-hover:text-black">Open_Vault</button>
               </div>
             ))}
           </div>
        )}
      </main>

      {/* MODAL: ESTABLISH ARC (NO OVERLAY DURING LOADING) */}
      {showSeasonModal && (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-end p-12 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-zinc-800 p-12 rounded-3xl max-w-xl w-full shadow-2xl relative">
            <button onClick={() => setShowSeasonModal(false)} className="absolute top-8 right-8 text-zinc-700 hover:text-white"><X size={24}/></button>
            <h2 className="text-4xl font-black uppercase mb-10 text-white italic tracking-tighter italic">Establish_Arc</h2>
            
            <div className="space-y-10">
              <input className="w-full bg-zinc-900 p-5 border border-zinc-800 text-[#00ffcc] font-bold outline-none" placeholder="TOPIC_STRING" value={newS.topic} onChange={(e) => setNewS({...newS, topic: e.target.value})} />
              
              <div className="space-y-4">
                 <div className="flex justify-between items-center bg-zinc-900 p-4 border border-zinc-800">
                    <input className="bg-transparent text-[#00ffcc] text-xs font-bold outline-none" placeholder="NEW IDENTITY NAME" value={newP.name} onChange={(e) => setNewP({...newP, name: e.target.value})} />
                    <button onClick={handleCreatePersona} className="text-[#00ffcc] font-black uppercase text-[10px] flex items-center gap-2 hover:underline"><UserPlus size={14}/> Spawn</button>
                 </div>
                 <div className="grid grid-cols-2 gap-3">
                    {personas.map(p => (
                      <button key={p.id} onClick={() => {
                        const updated = newS.host_ids.includes(p.id) ? newS.host_ids.filter(id => id !== p.id) : [...newS.host_ids, p.id];
                        setNewS({...newS, host_ids: updated});
                      }} className={`p-5 text-[10px] font-black uppercase border transition-all text-left rounded-lg ${newS.host_ids.includes(p.id) ? 'border-[#00ffcc] text-[#00ffcc] bg-[#00ffcc]/5' : 'border-zinc-800 text-zinc-700'}`}>
                        {p.name}
                      </button>
                    ))}
                  </div>
              </div>

              <button onClick={handleCreateSeason} className={`w-full py-7 font-black uppercase tracking-widest transition-all rounded-xl ${loading ? 'bg-zinc-800 text-zinc-600 animate-pulse' : 'bg-[#00ffcc] text-black hover:bg-white shadow-xl'}`}>
                {loading ? 'PROCESSING_DNA...' : 'Establish_Signal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
