import React, { useState, useEffect, useRef } from 'react';
import { Zap, Activity, Code, Cpu, Layers, Fingerprint, Trash2, Plus, PlayCircle, UserPlus, Database, Quote, X, ShieldCheck, Send, Brain, Dice5, Eye, Terminal, Loader2 } from 'lucide-react';

const API_BASE = "https://shadow-cassandrafiles.pythonanywhere.com/api/v2";

const CONFIG = {
    GENDERS: ["Male", "Female", "Non-Binary", "Random"],
    DYNAMICS: ["Unresolved Sexual Tension (UST)", "UST - High Friction", "Strategic Tension", "Grudging Mutual Respect", "Bitter Rivals"],
    TRAUMAS: ["Witnessed server farm bleed-out.", "Neural-link betrayal.", "Exposed data laundering."]
};

const App = () => {
    const [viewMode, setViewMode] = useState('god');
    const [activeTab, setActiveTab] = useState('season');
    const [activeItem, setActiveItem] = useState(null);
    const [activeBrief, setActiveBrief] = useState(null);
    const [seasons, setSeasons] = useState([]);
    const [personas, setPersonas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ stage: 'IDLE', history: [] });

    const [newP, setNewP] = useState({ name: '', role: 'Forensic Analyst', trauma: '', gender: 'Random' });
    const [newS, setNewS] = useState({ topic: '', relationship: CONFIG.DYNAMICS[0], host_ids: [], episodes_count: 10 });

    const logEndRef = useRef(null);

    useEffect(() => {
        refreshData();
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`${API_BASE}/status`);
                setStatus(await res.json());
            } catch (e) {}
        }, 3000);
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

    const handleTabChange = (tab) => {
        setActiveItem(null);
        setActiveBrief(null);
        setActiveTab(tab);
    };

    const spawnPersona = async () => {
        if (!newP.name) return;
        setLoading(true);
        try {
            await fetch(`${API_BASE}/persona/create`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(newP) });
            await refreshData();
        } finally { 
            setLoading(false); 
            setNewP({ name: '', role: 'Forensic Analyst', trauma: '', gender: 'Random' });
        }
    };

    const establishSeason = async () => {
        if (!newS.topic || newS.host_ids.length !== 2) return;
        setLoading(true);
        try {
            await fetch(`${API_BASE}/season/reconcile`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(newS) });
            await refreshData();
        } finally { setLoading(false); }
    };

    const deleteItem = async (e, type, id) => {
        e.stopPropagation();
        if (!window.confirm("FATAL: Purge from Vault?")) return;
        await fetch(`${API_BASE}/${type}/delete/${id}`, { method: 'DELETE' });
        if (activeItem?.id === id) setActiveItem(null);
        refreshData();
    };

    const runBrief = async (seasonId, idx) => {
        setActiveBrief(null);
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/showrunner/brief`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ season_id: seasonId, node_index: idx }) });
            setActiveBrief(await res.json());
        } finally { setLoading(false); }
    };

    return (
        <div className={`h-screen w-screen font-mono flex overflow-hidden ${viewMode === 'god' ? 'bg-[#0d0f11] text-slate-300' : 'bg-[#121416] text-slate-400'}`}>
            
            {loading && (
                <div className="fixed inset-0 bg-black/90 z-[100] flex flex-col items-center justify-center backdrop-blur-md">
                    <Loader2 className="w-12 h-12 text-teal-500 animate-spin mb-4" />
                    <p className="text-teal-400 text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">DNA_Baking_In_Progress</p>
                </div>
            )}

            {viewMode === 'god' && (
                <section className="w-[320px] border-r border-slate-800 bg-black/50 p-6 flex flex-col shadow-2xl overflow-hidden">
                    <div className="flex items-center gap-2 text-teal-500 font-black text-[10px] mb-8 uppercase tracking-[0.3em] border-b border-slate-900 pb-4">
                        <Zap size={14} /> Kernel_v28.4
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-2 text-[9px] opacity-40 custom-scrollbar">
                        {status.history?.map((log, i) => (
                            <div key={i} className="border-l border-slate-800 pl-3 py-1 font-bold uppercase">{log}</div>
                        ))}
                    </div>
                </section>
            )}

            <section className="flex-1 flex flex-col p-10 overflow-y-auto relative bg-[#121416]">
                <div className="absolute top-10 right-10 flex border border-slate-800 rounded overflow-hidden z-50">
                    <button onClick={() => setViewMode('god')} className={`px-4 py-2 text-[9px] font-black ${viewMode === 'god' ? 'bg-teal-500 text-black' : 'bg-slate-900'}`}>GOD</button>
                    <button onClick={() => setViewMode('user')} className={`px-4 py-2 text-[9px] font-black ${viewMode === 'user' ? 'bg-teal-500 text-black' : 'bg-slate-900'}`}>USER</button>
                </div>

                <div className="flex gap-4 mb-10 border-b border-slate-800 pb-6">
                    <button onClick={() => handleTabChange('season')} className={`px-10 py-3 text-[10px] font-black ${activeTab === 'season' && !activeItem ? 'bg-teal-500 text-black shadow-lg shadow-teal-500/20' : 'bg-slate-800 text-slate-500'}`}>SEASONS</button>
                    <button onClick={() => handleTabChange('persona')} className={`px-10 py-3 text-[10px] font-black ${activeTab === 'persona' && !activeItem ? 'bg-teal-500 text-black shadow-lg shadow-teal-500/20' : 'bg-slate-800 text-slate-500'}`}>DNA_VAULT</button>
                </div>

                {!activeItem ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-300">
                        {(activeTab === 'season' ? seasons : personas).map((item, i) => (
                            <div key={i} className="bg-[#1c1f23] border border-slate-800 p-6 rounded cursor-pointer hover:border-teal-500 transition-all flex gap-5 items-center group relative shadow-2xl" onClick={() => setActiveItem(item)}>
                                {viewMode === 'god' && (
                                    <button onClick={(e) => deleteItem(e, activeTab, item.id)} className="absolute top-4 right-4 text-red-500 p-2 bg-red-950/20 rounded hover:bg-red-600 hover:text-white transition-all"><Trash2 size={16}/></button>
                                )}
                                {item.portrait ? (
                                    <img src={item.portrait} className="w-16 h-16 rounded grayscale group-hover:grayscale-0 border border-slate-800 transition-all" alt="P" onError={(e) => e.target.src='https://via.placeholder.com/64?text=DNA'} />
                                ) : <div className="w-16 h-16 rounded bg-slate-900 flex items-center justify-center"><Fingerprint size={28}/></div>}
                                <div className="flex-1">
                                    <h4 className="text-white font-black uppercase text-sm italic tracking-tighter">{item.title || item.name}</h4>
                                    <p className="text-[9px] text-teal-500 uppercase font-black opacity-60">{item.relationship || item.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-10">
                        <div className="flex justify-between items-end border-b border-slate-800 pb-8">
                            <div className="flex gap-8 items-center">
                                {activeItem.portrait && <img src={activeItem.portrait} className="w-28 h-28 rounded border border-slate-700 shadow-2xl grayscale" alt="P" />}
                                <div>
                                    <h2 className="text-6xl font-black text-white uppercase italic tracking-tighter mb-2">{activeItem.title || activeItem.name}</h2>
                                    <span className="bg-teal-500 text-black px-3 py-1 text-[9px] font-black uppercase rounded">{activeItem.relationship || activeItem.role}</span>
                                </div>
                            </div>
                            <button onClick={() => setActiveItem(null)} className="bg-slate-800 text-white px-8 py-3 text-[10px] font-black hover:bg-white hover:text-black border border-slate-700">BACK</button>
                        </div>

                        {activeTab === 'persona' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                <div className="bg-black/40 p-10 border border-slate-800 rounded shadow-2xl h-[550px] overflow-y-auto">
                                    <h4 className="text-teal-500 text-[10px] font-black uppercase mb-6 italic border-b border-slate-800 pb-2">Forensic Dossier</h4>
                                    <p className="text-[13px] text-slate-400 font-sans leading-relaxed whitespace-pre-wrap uppercase">{activeItem.archive?.bio || "DNA_SEQUENCING_IN_PROGRESS"}</p>
                                </div>
                                <div className="bg-black/40 p-10 border border-slate-800 rounded shadow-2xl h-[550px] overflow-y-auto">
                                    <h4 className="text-teal-500 text-[10px] font-black uppercase mb-6 italic border-b border-slate-800 pb-2">Memory Buffer</h4>
                                    {(activeItem.archive?.anecdotes || []).map((a, i) => <p key={i} className="p-4 bg-white/5 text-[10px] text-slate-500 italic mb-3 uppercase leading-relaxed hover:text-white transition-all">"{a}"</p>)}
                                </div>
                            </div>
                        )}

                        {activeTab === 'season' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                <div className="space-y-4">
                                    <h4 className="text-teal-500 text-[10px] font-black uppercase italic border-b border-slate-800 pb-2">Episode Nodes</h4>
                                    {(activeItem.episodes || []).map((ep, idx) => (
                                        <div key={idx} className="p-6 bg-[#1c1f23] border border-slate-800 flex justify-between items-center group hover:border-teal-500 transition-all">
                                            <div className="flex flex-col"><span className="text-[8px] text-teal-500 font-black uppercase tracking-widest">ACT {ep.act}</span><span className="text-white font-bold text-sm uppercase">{ep.title}</span></div>
                                            <button onClick={() => runBrief(activeItem.id, idx)} className="px-6 py-2 bg-slate-800 text-[9px] font-black uppercase border border-slate-700 hover:bg-teal-500 hover:text-black transition-all">Run_Brief</button>
                                        </div>
                                    ))}
                                </div>
                                <div className="bg-black/40 p-10 border border-slate-800 rounded h-[600px] overflow-y-auto">
                                    <h4 className="text-teal-500 text-[10px] font-black uppercase italic border-b border-slate-800 pb-2">6-Act_Orchestration</h4>
                                    {activeBrief ? Object.entries(activeBrief).map(([k, v], i) => (
                                        <div key={i} className="border-l-2 border-teal-500/30 pl-4 py-3 mb-6 bg-black/30 rounded-r shadow-lg animate-in slide-in-from-right-4">
                                            <span className="text-[8px] text-teal-400 font-black uppercase mb-1 block opacity-60">{k.replace(/_/g, ' ')}</span>
                                            <p className="text-[11px] text-slate-400 font-sans italic leading-relaxed uppercase">"{typeof v === 'string' ? v : JSON.stringify(v)}"</p>
                                        </div>
                                    )) : <div className="h-64 flex items-center justify-center text-slate-800 text-[9px] font-black tracking-widest uppercase">Select Node to View Orchestration</div>}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </section>

            {viewMode === 'god' && (
                <section className="w-[420px] bg-[#0b0c0e] p-10 flex flex-col gap-10 border-l border-slate-800 overflow-y-auto shadow-2xl">
                    <div className="space-y-6">
                        <h3 className="text-teal-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border-b border-slate-900 pb-2"><UserPlus size={14}/> Identity_Spawn</h3>
                        <input className="w-full bg-[#1c1f23] p-4 border border-slate-800 text-[12px] text-white font-bold outline-none uppercase" placeholder="NAME" value={newP.name} onChange={(e) => setNewP({...newP, name: e.target.value})} />
                        <div className="grid grid-cols-2 gap-2">
                            <select className="bg-[#1c1f23] p-4 border border-slate-800 text-[10px] text-teal-500 font-black" value={newP.gender} onChange={(e) => setNewP({...newP, gender: e.target.value})}>{CONFIG.GENDERS.map(g => <option key={g} value={g}>{g}</option>)}</select>
                            <input className="bg-[#1c1f23] p-4 border border-slate-800 text-[10px] text-slate-500 outline-none uppercase" placeholder="ROLE" value={newP.role} onChange={(e) => setNewP({...newP, role: e.target.value})} />
                        </div>
                        <button onClick={spawnPersona} disabled={loading} className="w-full py-4 bg-teal-500 text-black text-[11px] font-black uppercase shadow-2xl hover:bg-white transition-all">COMMIT_DNA</button>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-teal-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border-b border-slate-900 pb-2"><Database size={14}/> Establish_Season</h3>
                        <input className="w-full bg-[#1c1f23] p-4 border border-slate-800 text-[12px] text-white font-bold outline-none uppercase" placeholder="TOPIC" value={newS.topic} onChange={(e) => setNewS({...newS, topic: e.target.value})} />
                        <div className="grid grid-cols-2 gap-2">{personas.map(p => <button key={p.id} onClick={() => { const ids = newS.host_ids.includes(p.id) ? newS.host_ids.filter(id => id !== p.id) : [...newS.host_ids, p.id]; setNewS({...newS, host_ids: ids.slice(0, 2)}); }} className={`p-3 text-[9px] font-black border uppercase rounded truncate ${newS.host_ids.includes(p.id) ? 'border-teal-500 bg-teal-500/10 text-teal-400 shadow-[0_0_15px_#2dd4bf20]' : 'border-slate-800 text-slate-600'}`}>{p.name}</button>)}</div>
                        <select className="w-full bg-[#1c1f23] p-4 border border-slate-800 text-[10px] text-teal-400 font-bold" value={newS.relationship} onChange={(e) => setNewS({...newS, relationship: e.target.value})}>{CONFIG.DYNAMICS.map(d => <option key={d} value={d}>{d}</option>)}</select>
                        <div className="space-y-2"><p className="text-[9px] text-slate-600 uppercase font-black flex justify-between tracking-widest">Node_Count <span>{newS.episodes_count}</span></p><input type="range" min="4" max="24" step="2" className="w-full accent-teal-500" value={newS.episodes_count} onChange={(e) => setNewS({...newS, episodes_count: e.target.value})} /></div>
                        <button onClick={establishSeason} disabled={loading || newS.host_ids.length !== 2} className="w-full py-4 bg-teal-500 text-black text-[11px] font-black uppercase shadow-2xl hover:bg-white transition-all">ESTABLISH_SIGNAL</button>
                    </div>
                </section>
            )}
        </div>
    );
};

export default App;
