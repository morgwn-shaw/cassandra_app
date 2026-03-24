import React, { useState, useEffect } from 'react';
import { Zap, Activity, Trash2, Database, Quote, Brain, Loader2, Fingerprint, ChevronRight, ScrollText, ShieldCheck } from 'lucide-react';

const API_BASE = "https://shadow-cassandrafiles.pythonanywhere.com/api/v2";

const App = () => {
    const [viewMode, setViewMode] = useState('god'); 
    const [activeTab, setActiveTab] = useState('season');
    const [activeItem, setActiveItem] = useState(null);
    const [activeBrief, setActiveBrief] = useState(null);
    const [seasons, setSeasons] = useState([]);
    const [personas, setPersonas] = useState([]);
    const [loading, setLoading] = useState(false);

    const [newP, setNewP] = useState({ name: '', role: 'Forensic Investigator', trauma: '', gender: 'Male' });
    const [newS, setNewS] = useState({ topic: '', relationship: 'UST - High Friction', host_ids: [], episodes_count: 10 });

    useEffect(() => { refreshData(); }, []);

    const refreshData = async () => {
        try {
            const sRes = await fetch(`${API_BASE}/season/list`);
            setSeasons(await sRes.json() || []);
            const pRes = await fetch(`${API_BASE}/persona/list`);
            setPersonas(await pRes.json() || []);
        } catch (e) {}
    };

    const runAction = async (endpoint, body) => {
        setLoading(true);
        try {
            await fetch(`${API_BASE}${endpoint}`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body) });
            await refreshData();
        } finally { setLoading(false); }
    };

    const getBrief = async (seasonId, idx) => {
        setActiveBrief(null);
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/showrunner/brief`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ season_id: seasonId, node_index: idx }) });
            setActiveBrief(await res.json());
        } finally { setLoading(false); }
    };

    return (
        <div className="h-screen w-screen font-mono flex overflow-hidden bg-[#0d0f11] text-slate-400">
            {loading && (
                <div className="fixed inset-0 bg-black/95 z-[100] flex flex-col items-center justify-center backdrop-blur-xl text-center p-20">
                    <Loader2 className="w-16 h-16 text-teal-500 animate-spin mb-4" />
                    <p className="text-teal-400 text-xs font-black uppercase tracking-[0.8em] animate-pulse">Showrunner_Grounded_Fact_Checking</p>
                </div>
            )}

            {/* PANE 1: TELEMETRY */}
            {viewMode === 'god' && (
                <section className="w-[320px] border-r border-slate-800 bg-black/40 p-6 flex flex-col gap-6 shadow-2xl">
                    <div className="flex items-center gap-2 text-teal-500 font-black text-[10px] uppercase tracking-widest border-b border-slate-900 pb-4"><Zap size={14} /> Telemetry_v30.0</div>
                    <div className="flex-1 opacity-30 text-[9px] uppercase italic leading-loose">
                        - Spine: 3.1 Pro Apex<br/>- Grounding: Search Enabled<br/>- Arc: 10/70/20 Rule<br/>- Brief: 6-Act Production
                    </div>
                </section>
            )}

            {/* PANE 2: WORKSPACE */}
            <section className="flex-1 flex flex-col p-10 overflow-y-auto relative bg-[#121416]">
                <div className="absolute top-10 right-10 flex border border-slate-800 rounded overflow-hidden z-50">
                    <button onClick={() => setViewMode('god')} className={`px-4 py-2 text-[9px] font-black ${viewMode === 'god' ? 'bg-teal-500 text-black' : 'bg-slate-900'}`}>GOD</button>
                    <button onClick={() => setViewMode('user')} className={`px-4 py-2 text-[9px] font-black ${viewMode === 'user' ? 'bg-teal-500 text-black' : 'bg-slate-900'}`}>USER</button>
                </div>

                <div className="flex gap-4 mb-10 border-b border-slate-800 pb-6">
                    <button onClick={() => { setActiveItem(null); setActiveTab('season'); }} className={`px-10 py-3 text-[10px] font-black ${activeTab === 'season' && !activeItem ? 'bg-teal-500 text-black shadow-lg' : 'bg-slate-800'}`}>SEASONS</button>
                    <button onClick={() => { setActiveItem(null); setActiveTab('persona'); }} className={`px-10 py-3 text-[10px] font-black ${activeTab === 'persona' && !activeItem ? 'bg-teal-500 text-black shadow-lg' : 'bg-slate-800'}`}>PERSONAS</button>
                </div>

                {!activeItem ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in">
                        {(activeTab === 'season' ? seasons : personas).map((item, i) => (
                            <div key={i} className="bg-[#1c1f23] border border-slate-800 p-8 rounded-lg cursor-pointer hover:border-teal-500 transition-all flex gap-6 items-center shadow-2xl" onClick={() => setActiveItem(item)}>
                                {item.portrait ? <img src={item.portrait} className="w-14 h-14 rounded grayscale border border-slate-800" alt="P" /> : <div className="w-14 h-14 rounded bg-slate-900 flex items-center justify-center"><Fingerprint size={24}/></div>}
                                <div>
                                    <h4 className="text-white font-black uppercase text-sm italic tracking-tighter">{item.title || item.name}</h4>
                                    <p className="text-[9px] text-teal-500 uppercase font-black opacity-60 tracking-widest">{item.archetype || item.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-10">
                        <div className="flex justify-between items-end border-b border-slate-800 pb-8">
                            <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter">{activeItem.title || activeItem.name}</h2>
                            <button onClick={() => {setActiveItem(null); setActiveBrief(null);}} className="bg-teal-500 text-black px-8 py-3 text-[10px] font-black">CLOSE</button>
                        </div>

                        {activeTab === 'season' && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                                {/* COLUMN 1: SEASON SUMMARY */}
                                <div className="space-y-6">
                                    <div className="bg-teal-500/5 p-8 border border-teal-500/20 rounded shadow-2xl">
                                        <h4 className="text-teal-400 text-[10px] font-black uppercase mb-4 flex items-center gap-2"><ScrollText size={14}/> Season_Summary</h4>
                                        <p className="text-[12px] text-slate-400 font-sans leading-relaxed uppercase">{activeItem.summary}</p>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4">
                                        <h4 className="text-teal-500 text-[10px] font-black uppercase italic border-b border-slate-800 pb-2">Narrative_Nodes</h4>
                                        {activeItem.episodes?.map((ep, idx) => (
                                            <div key={idx} className="p-6 bg-[#1c1f23] border border-slate-800 group hover:border-teal-500 transition-all shadow-xl flex flex-col gap-4">
                                                <div className="flex justify-between">
                                                    <span className="text-[9px] text-teal-500 font-black tracking-widest">ACT {ep.act}</span>
                                                    <button onClick={() => getBrief(activeItem.id, idx)} className="text-[8px] bg-slate-800 px-2 py-1 text-teal-500 font-black uppercase">Run_Brief</button>
                                                </div>
                                                <h4 className="text-white font-black text-base uppercase italic tracking-tighter">{ep.title}</h4>
                                                <p className="text-[10px] text-slate-500 uppercase leading-tight italic">{ep.topic_summary}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* COLUMN 2-3: SHOWRUNNER BRIEF */}
                                <div className="lg:col-span-2 bg-black/40 border border-slate-800 rounded p-10 h-[800px] overflow-y-auto shadow-2xl">
                                    <h4 className="text-teal-500 text-[11px] font-black uppercase mb-8 border-b border-slate-900 pb-4 flex items-center gap-3"><ShieldCheck size={18}/> Grounded_Production_Brief</h4>
                                    {activeBrief ? (
                                        Object.entries(activeBrief.acts || activeBrief).map(([key, val], i) => (
                                            <div key={i} className="mb-10 animate-in slide-in-from-right-4 duration-500">
                                                <span className="text-[9px] text-teal-400 font-black uppercase mb-3 block tracking-[0.2em]">{key.replace(/_/g, ' ')}</span>
                                                <p className="text-[14px] text-slate-400 font-sans leading-relaxed uppercase selection:bg-teal-500/20">"{typeof val === 'string' ? val : JSON.stringify(val)}"</p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-slate-800 text-[10px] font-black uppercase tracking-[0.3em]">Initialize_Node_Signal</div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </section>

            {/* PANE 3: COMMAND */}
            {viewMode === 'god' && (
                <section className="w-[450px] bg-[#0b0c0e] p-10 flex flex-col gap-10 border-l border-slate-800 overflow-y-auto shadow-2xl">
                    <div className="space-y-6">
                        <h3 className="text-teal-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border-b border-slate-900 pb-2"><Database size={16}/> Establish_Season</h3>
                        <input className="w-full bg-[#1c1f23] p-4 border border-slate-800 text-[12px] text-white font-bold outline-none uppercase" placeholder="TOPIC" value={newS.topic} onChange={(e) => setNewS({...newS, topic: e.target.value})} />
                        <div className="grid grid-cols-2 gap-2">{personas.map(p => <button key={p.id} onClick={() => { const ids = newS.host_ids.includes(p.id) ? newS.host_ids.filter(id => id !== p.id) : [...newS.host_ids, p.id]; setNewS({...newS, host_ids: ids.slice(0, 2)}); }} className={`p-4 text-[9px] font-black border uppercase rounded truncate transition-all ${newS.host_ids.includes(p.id) ? 'border-teal-500 bg-teal-500/10 text-teal-400 shadow-xl' : 'border-slate-800 text-slate-600'}`}>{p.name}</button>)}</div>
                        <button onClick={() => runAction('/season/reconcile', newS)} disabled={newS.host_ids.length !== 2} className="w-full py-6 bg-teal-500 text-black text-[11px] font-black uppercase shadow-2xl hover:bg-white transition-all">ESTABLISH_SIGNAL</button>
                    </div>
                </section>
            )}
        </div>
    );
};

export default App;
