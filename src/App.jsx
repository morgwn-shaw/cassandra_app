import React, { useState, useEffect, useRef } from 'react';
import { Zap, Activity, Code, Cpu, Layers, Fingerprint, Trash2, Plus, PlayCircle, UserPlus, Database, Quote, X, ShieldCheck, Send, Brain, Dice5, Eye, Terminal } from 'lucide-react';

const API_BASE = "https://shadow-cassandrafiles.pythonanywhere.com/api/v2";

const CONFIG = {
    GENDERS: ["Male", "Female", "Non-Binary", "Random"],
    DYNAMICS: ["Unresolved Sexual Tension (UST)", "UST - High Friction", "Grudging Mutual Respect", "Bitter Rivals"],
    TRAUMAS: ["Witnessed server farm bleed-out.", "Neural-link betrayal.", "Identity stolen.", "Escaped digital cult."]
};

const App = () => {
    const [viewMode, setViewMode] = useState('god');
    const [activeTab, setActiveTab] = useState('season');
    const [activeItem, setActiveItem] = useState(null);
    const [seasons, setSeasons] = useState([]);
    const [personas, setPersonas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ stage: 'IDLE', active_engine: '3.1_Pro' });

    const [newP, setNewP] = useState({ name: '', role: 'Forensic Analyst', trauma: '', gender: 'Random' });
    const [newS, setNewS] = useState({ topic: '', relationship: CONFIG.DYNAMICS[0], host_ids: [], episodes_count: 10 });

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

    return (
        <div className={`h-screen w-screen font-mono flex overflow-hidden ${viewMode === 'god' ? 'bg-[#0d0f11] text-slate-300' : 'bg-[#121416] text-slate-400'}`}>
            
            {/* PANE 1: TELEMETRY (GOD ONLY) */}
            {viewMode === 'god' && (
                <section className="w-[350px] border-r border-slate-800 bg-black/50 p-6 flex flex-col shadow-2xl overflow-hidden">
                    <div className="flex items-center justify-between text-teal-500 font-black text-[10px] mb-8 uppercase tracking-[0.3em]">
                        <div className="flex items-center gap-2">
                            <Zap size={14} className={loading ? "animate-pulse" : ""} /> Kernel_v28.0
                        </div>
                        <div className="text-slate-700 text-[8px]">{status.active_engine?.split('/')[1]}</div>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-2 text-[9px] custom-scrollbar opacity-40">
                        {["Engine Initialized", "Search Protocols Ready", "3.1 Pro Context Caching Active"].map((log, i) => (
                            <div key={i} className="border-l border-slate-800 pl-3 py-1 font-bold uppercase tracking-tighter">{log}</div>
                        ))}
                    </div>
                </section>
            )}

            {/* PANE 2: WORKSPACE */}
            <section className="flex-1 flex flex-col p-10 overflow-y-auto relative">
                
                {/* MODE TOGGLE */}
                <div className="absolute top-10 right-10 flex border border-slate-800 rounded overflow-hidden z-50 shadow-2xl">
                    <button onClick={() => setViewMode('god')} className={`px-4 py-2 text-[9px] font-black ${viewMode === 'god' ? 'bg-teal-500 text-black' : 'bg-slate-900'}`}>FORENSIC</button>
                    <button onClick={() => setViewMode('user')} className={`px-4 py-2 text-[9px] font-black ${viewMode === 'user' ? 'bg-teal-500 text-black' : 'bg-slate-900'}`}>SIMULATION</button>
                </div>

                {/* TABS */}
                <div className="flex gap-4 mb-10 border-b border-slate-800 pb-6">
                    <button onClick={() => handleTabChange('season')} className={`px-10 py-3 text-[10px] font-black tracking-widest transition-all ${activeTab === 'season' && !activeItem ? 'bg-teal-500 text-black shadow-lg shadow-teal-500/20' : 'bg-slate-800 text-slate-500'}`}>SEASONS</button>
                    <button onClick={() => handleTabChange('persona')} className={`px-10 py-3 text-[10px] font-black tracking-widest transition-all ${activeTab === 'persona' && !activeItem ? 'bg-teal-500 text-black shadow-lg shadow-teal-500/20' : 'bg-slate-800 text-slate-500'}`}>DNA_VAULT</button>
                </div>

                {!activeItem ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-300">
                        {(activeTab === 'season' ? seasons : personas).map((item, i) => (
                            <div key={i} className="bg-[#1c1f23] border border-slate-800 p-6 rounded cursor-pointer hover:border-teal-500/50 transition-all flex gap-5 items-center group shadow-xl" onClick={() => setActiveItem(item)}>
                                {item.portrait ? (
                                    <img src={item.portrait} className="w-14 h-14 rounded grayscale group-hover:grayscale-0 border border-slate-800 transition-all" alt="DNA" onError={(e) => e.target.style.display='none'} />
                                ) : (
                                    <div className="w-14 h-14 rounded bg-slate-900 flex items-center justify-center text-slate-700"><Fingerprint size={24}/></div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-white font-black uppercase text-sm tracking-tighter truncate">{item.title || item.name}</h4>
                                    <p className="text-[9px] text-teal-500 uppercase font-black opacity-60 truncate">{item.relationship || item.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* DETAIL VIEW */
                    <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-10">
                        <div className="flex justify-between items-end border-b border-slate-800 pb-8">
                            <div className="flex gap-8 items-center">
                                {activeItem.portrait && <img src={activeItem.portrait} className="w-28 h-28 rounded border border-slate-700 shadow-2xl grayscale" alt="P" />}
                                <div>
                                    <h2 className="text-6xl font-black text-white uppercase italic tracking-tighter mb-2">{activeItem.title || activeItem.name}</h2>
                                    <span className="bg-teal-500 text-black px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded">{activeItem.relationship || activeItem.role}</span>
                                </div>
                            </div>
                            <button onClick={() => setActiveItem(null)} className="bg-slate-800 text-white px-8 py-3 text-[10px] font-black hover:bg-white hover:text-black transition-all border border-slate-700">CLOSE_PROFILE</button>
                        </div>

                        {activeTab === 'persona' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                <div className="bg-black/40 p-10 border border-slate-800 rounded shadow-2xl h-[500px] overflow-y-auto custom-scrollbar">
                                    <h4 className="text-teal-500 text-[10px] font-black uppercase mb-6 flex items-center gap-2 italic border-b border-slate-800 pb-2"><Quote size={14}/> Dossier</h4>
                                    <p className="text-[13px] text-slate-400 font-sans leading-relaxed whitespace-pre-wrap uppercase selection:bg-teal-500/30">
                                        {activeItem.archive?.bio || "SEQUENCING DNA..."}
                                    </p>
                                </div>
                                <div className="bg-black/40 p-10 border border-slate-800 rounded shadow-2xl h-[500px] overflow-y-auto custom-scrollbar">
                                    <h4 className="text-teal-500 text-[10px] font-black uppercase mb-6 italic border-b border-slate-800 pb-2">DNA_Memories</h4>
                                    {(activeItem.archive?.anecdotes || []).map((a, i) => (
                                        <p key={i} className="p-4 bg-white/5 border border-white/5 text-[10px] text-slate-500 italic mb-3 uppercase leading-relaxed hover:text-white transition-all">"{a}"</p>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'season' && (
                            <div className="grid grid-cols-1 gap-4">
                                {activeItem.episodes?.map((ep, idx) => (
                                    <div key={idx} className="p-6 bg-[#1c1f23] border border-slate-800 flex justify-between items-center group hover:border-teal-500 transition-all shadow-xl">
                                        <div className="flex flex-col">
                                            <span className="text-[8px] text-teal-500 font-black">ACT {ep.act}</span>
                                            <span className="text-white font-bold text-sm uppercase tracking-tighter">{ep.title}</span>
                                        </div>
                                        <div className="px-6 py-2 bg-slate-800 text-[10px] font-black uppercase border border-slate-700">Initialize_Signal</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </section>

            {/* PANE 3: COMMAND (GOD ONLY) */}
            {viewMode === 'god' && (
                <section className="w-[400px] bg-[#0b0c0e] p-10 flex flex-col gap-12 border-l border-slate-800 overflow-y-auto shadow-2xl">
                    <div className="space-y-6">
                        <h3 className="text-teal-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><UserPlus size={14}/> Identity_Spawn</h3>
                        <input className="w-full bg-[#1c1f23] p-4 border border-slate-800 text-[12px] text-white font-bold outline-none focus:border-teal-500" placeholder="NAME" value={newP.name} onChange={(e) => setNewP({...newP, name: e.target.value})} />
                        <div className="grid grid-cols-2 gap-2">
                            <select className="bg-[#1c1f23] p-4 border border-slate-800 text-[10px] text-teal-500 font-black outline-none" value={newP.gender} onChange={(e) => setNewP({...newP, gender: e.target.value})}>
                                {CONFIG.GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                            <input className="bg-[#1c1f23] p-4 border border-slate-800 text-[10px] text-slate-500 outline-none" placeholder="ROLE" value={newP.role} onChange={(e) => setNewP({...newP, role: e.target.value})} />
                        </div>
                        <button onClick={spawnPersona} disabled={loading} className="w-full py-4 bg-teal-500 text-black text-[11px] font-black uppercase shadow-2xl disabled:opacity-20 hover:bg-white transition-all">COMMIT_DNA</button>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-teal-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><Database size={14}/> Establish_Season</h3>
                        <input className="w-full bg-[#1c1f23] p-4 border border-slate-800 text-[12px] text-white font-bold outline-none uppercase" placeholder="TOPIC" value={newS.topic} onChange={(e) => setNewS({...newS, topic: e.target.value})} />
                        <div className="grid grid-cols-2 gap-2">
                            {personas.map(p => (
                                <button key={p.id} onClick={() => {
                                    const ids = newS.host_ids.includes(p.id) ? newS.host_ids.filter(id => id !== p.id) : [...newS.host_ids, p.id];
                                    setNewS({...newS, host_ids: ids.slice(0, 2)});
                                }} className={`p-3 text-[9px] font-black border uppercase rounded transition-all truncate ${newS.host_ids.includes(p.id) ? 'border-teal-500 bg-teal-500/10 text-teal-400 shadow-[0_0_15px_#2dd4bf20]' : 'border-slate-800 text-slate-600'}`}>{p.name}</button>
                            ))}
                        </div>
                        <div className="space-y-2">
                            <p className="text-[9px] text-slate-600 uppercase font-black flex justify-between">Node_Length <span>{newS.episodes_count}</span></p>
                            <input type="range" min="4" max="24" step="2" className="w-full accent-teal-500" value={newS.episodes_count} onChange={(e) => setNewS({...newS, episodes_count: e.target.value})} />
                        </div>
                        <button onClick={establishSeason} disabled={loading || newS.host_ids.length !== 2} className="w-full py-4 bg-teal-500 text-black text-[11px] font-black uppercase shadow-2xl disabled:opacity-20 hover:bg-white transition-all">ESTABLISH_SIGNAL</button>
                    </div>
                </section>
            )}
        </div>
    );
};

export default App;
