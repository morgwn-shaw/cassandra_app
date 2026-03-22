import React, { useState, useEffect } from 'react';
import { Layers, User, Zap, Plus, Cpu, Database, ShieldCheck, HardDriveUpload, Radio, MessageSquare, PlayCircle } from 'lucide-react';

const API_BASE = "https://cassandrafiles.pythonanywhere.com/api/v2";

const App = () => {
  const [activeTab, setActiveTab] = useState('season');
  const [seasons, setSeasons] = useState([]);
  const [activeSeason, setActiveSeason] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [status, setStatus] = useState('IDLE');

  useEffect(() => { refreshData(); }, []);
  useEffect(() => { if (activeSeason) fetchEpisodes(activeSeason.id); }, [activeSeason]);

  const refreshData = async () => {
    const sRes = await fetch(`${API_BASE}/seasons`);
    const sData = await sRes.json();
    setSeasons(sData);
    if (sData.length > 0 && !activeSeason) setActiveSeason(sData[0]);
    const pRes = await fetch(`${API_BASE}/persona/list`);
    const pData = await pRes.json();
    setPersonas(pData);
  };

  const fetchEpisodes = async (sId) => {
    const res = await fetch(`${API_BASE}/episodes/list/${sId}`);
    const data = await res.json();
    setEpisodes(data);
  };

  const handleRunAudit = async (epId) => {
    setStatus(`RUNNING_${epId}`);
    const res = await fetch(`${API_BASE}/episodes/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ep_id: epId, season_id: activeSeason.id })
    });
    if (res.ok) setStatus('SUCCESS');
    else setStatus('ERROR');
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-mono p-10">
      <header className="mb-10 flex justify-between items-center bg-zinc-900/40 p-6 border border-zinc-800 rounded-xl shadow-2xl">
        <div className="flex gap-6 items-center">
          <Layers className="text-[#00ffcc]" size={32} />
          <div>
            <p className="text-[9px] text-zinc-500 uppercase tracking-widest mb-1">Active_Arc_Context</p>
            <select className="bg-transparent border-none text-xl font-black text-[#00ffcc] outline-none cursor-pointer" value={activeSeason?.id} onChange={(e) => setActiveSeason(seasons.find(s => s.id === e.target.value))}>
              {seasons.map(s => <option key={s.id} value={s.id} className="bg-zinc-900">{s.title}</option>)}
            </select>
          </div>
        </div>
        <div className="text-right">
           <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-tighter">System_Mode</p>
           <p className="text-sm font-black text-[#00ffcc]">{status}</p>
        </div>
      </header>

      <nav className="flex gap-4 mb-12">
        {['season', 'persona', 'source'].map(t => (
          <button key={t} onClick={() => setActiveTab(t)} className={`px-10 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === t ? 'bg-zinc-800 text-[#00ffcc] shadow-xl' : 'text-zinc-600'}`}>{t}</button>
        ))}
      </nav>

      <main>
        {activeTab === 'season' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {episodes.map((ep, idx) => (
              <div key={ep.ep_id} className="group border border-zinc-900 bg-zinc-950 p-6 rounded-lg hover:border-[#00ffcc] transition-all">
                <div className="flex justify-between items-start mb-6">
                  <span className="text-[9px] bg-zinc-900 px-3 py-1 rounded text-zinc-400 font-bold tracking-widest">ARC_EP_{idx+1}</span>
                  <span className="text-[10px] font-black text-[#00ffcc] italic">{ep.wing}</span>
                </div>
                <h4 className="text-sm font-black uppercase mb-2 leading-tight h-10 overflow-hidden">{ep.title}</h4>
                <p className="text-[9px] text-zinc-600 uppercase mb-6 font-bold tracking-tighter">Entity: {ep.entity}</p>
                <button 
                  onClick={() => handleRunAudit(ep.ep_id)}
                  disabled={status.startsWith('RUNNING')}
                  className="w-full py-3 bg-zinc-900 text-zinc-400 text-[10px] font-black uppercase flex items-center justify-center gap-2 hover:bg-[#00ffcc] hover:text-black transition-all"
                >
                  <PlayCircle size={14} /> Start Forensic Audit
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
