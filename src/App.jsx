import React, { useState, useEffect, useRef } from 'react';
import { Zap, Activity, Code, Cpu, Layers, Fingerprint, Trash2, Plus, PlayCircle, UserPlus, Database, Quote, X, ShieldCheck, Send, Brain, Dice5, Eye, Terminal, Loader2, AlertTriangle } from 'lucide-react';

const API_BASE = "https://shadow-cassandrafiles.pythonanywhere.com/api/v2";

const CONFIG = {
    GENDERS: ["Male", "Female", "Non-Binary", "Random"],
    DYNAMICS: ["Unresolved Sexual Tension (UST)", "UST - High Friction", "Grudging Mutual Respect", "Bitter Rivals"]
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

    const deleteItem = async (e, type, id) => {
        e.stopPropagation(); // Prevents opening the detail view
        const confirmation = window.confirm(`FATAL: Purge this ${type} from the DNA Vault?`);
        if (!confirmation) return;
        
        try {
            await fetch(`${API_BASE}/${type}/delete/${id}`, { method: 'DELETE' });
            if (activeItem?.id === id) setActiveItem(null);
            await refreshData();
        } catch (e) {
            window.alert("Purge sequence failed.");
        }
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
            
            {/* LOADING OVERLAY */}
            {loading && (
                <div className="fixed inset-0 bg-black/90 z-[100] flex flex-col items-center justify-center backdrop-blur-md">
                    <Loader2 className="w-16 h-16 text-teal-500 animate-spin mb-6" />
                    <p className="text-teal-400 text-xs font-black uppercase tracking-[0.5em] animate-pulse">DNA_Sequencing_Active</p>
                    <p className="text-slate-600 text-[9px] mt-4 uppercase italic tracking-widest">Baking 30 core memories into neural buffer...</p>
                </div>
            )}

            {/* PANE 1: TELEMETRY */}
            {viewMode === 'god' && (
                <section className="w-[320px] border-r border-slate-800 bg-black/60 p-6 flex flex-col shadow-2xl">
                    <div className="flex items-center gap-2 text-teal-500 font-black text-[10px] mb-8 uppercase tracking-[0.3em] border-b border-slate-800 pb-4">
                        <Zap size={14} className="text-teal-400" /> Kernel_v28.2
                    </div>
                    <div className="flex-1 space-y-3">
                        <div className="p-4 bg-red-950/20 border border-red-900/30 rounded text-[9px] text-red-400">
                           <p className="font-black uppercase mb-1 flex items-center gap-2"><AlertTriangle size={12}/> Admin_Purge_Ready</p>
                           <p className="opacity-60 italic">Delete buttons are now permanently locked to list items.</p>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-2 text-[9px] opacity-40">
                            {["Engine: Gemini 3.1 Pro", "Grounded Search Active", "Memory Purge Enabled"].map((log, i) => (
                                <div key={i} className="border-l border-slate-800 pl-3 py-1 font-bold uppercase">{log}</div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* PANE 2: WORKSPACE */}
            <section className="flex-1 flex flex-col p-10 overflow-y-auto relative bg-[#121416]">
                
                {/* MODE TOGGLE */}
                <div className="absolute top-10 right-10 flex border border-slate-800 rounded overflow-hidden z-50 shadow-2xl">
                    <button onClick={() => setViewMode('god')} className={`px-4 py-2 text-[9px] font-black transition-all ${viewMode === 'god' ? 'bg-teal-500 text-black shadow-inner' : 'bg-slate-900 text-slate-500'}`}>GOD</button>
                    <button onClick={() => setViewMode('user')} className={`px-4 py-2 text-[9px] font-black transition-all ${viewMode === 'user' ? 'bg-teal-500 text-black shadow-inner' : 'bg-slate-900 text-slate-500'}`}>USER</button>
                </div>

                <div className="flex gap-4 mb-10 border-b border-slate-800 pb-6">
                    <button onClick={() => { setActiveItem(null); setActiveTab('season'); }} className={`px-10 py-3 text-[10px] font-black tracking-widest transition-all ${activeTab === 'season' && !activeItem ? 'bg-teal-500 text-black shadow-lg shadow-teal-500/20' : 'bg-slate-800'}`}>SEASONS</button>
                    <button onClick={() => { setActiveItem(null); setActiveTab('persona'); }} className={`px-10 py-3 text-[10px] font-black tracking-widest transition-all ${activeTab === 'persona' && !activeItem ? 'bg-teal-500 text-black shadow-lg shadow-teal-500/20' : 'bg-slate-800'}`}>DNA_VAULT</button>
                </div>

                {!activeItem ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in">
                        {(activeTab === 'season' ? seasons : personas).map((item, i) => (
                            <div key={i} className="bg-[#1c1f23] border border-slate-800 p-8 rounded-lg cursor-pointer hover:border-teal-500/50 transition-all flex gap-6 items-center group shadow-2xl relative" onClick={() => setActiveItem(item)}>
                                
                                {/* PHYSICAL DELETE BUTTON - NO HOVER REQUIRED */}
                                {viewMode === 'god' && (
                                    <button 
                                        onClick={(e) => deleteItem(e, activeTab, item.id)} 
                                        className="absolute top-4 right-4 p-2 bg-red-950/40 hover:bg-red-600 text-red-500 hover:text-white rounded transition-all border border-red-900/30 z-[60]"
                                        title="Purge DNA"
                                    >
                                        <Trash2 size={16}/>
                                    </button>
                                )}

                                {item.portrait ? (
                                    <img src={item.portrait} className="w-16 h-16 rounded grayscale group-hover:grayscale-0 border border-slate-800 transition-all shadow-xl" alt="DNA" />
                                ) : (
                                    <div className="w-16 h-16 rounded bg-slate-900 flex items-center justify-center text-slate-700 border border-slate-800"><Fingerprint size={28}/></div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-white font-black uppercase text-base tracking-tighter truncate italic">{item.title || item.name}</h4>
                                    <p className="text-[10px] text-teal-500 uppercase font-black opacity-60 truncate tracking-widest">{item.relationship || item.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* DETAIL VIEW (Persist v28.1 Safety) */
                    <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-10">
                        <div className="flex justify-between items-end border-b border-slate-800 pb-8">
                            <div className="flex gap-8 items-center">
                                {activeItem.portrait && <img src={activeItem.portrait} className="w-28 h-28 rounded border border-slate-700 shadow-2xl grayscale" alt="P" />}
                                <div>
                                    <h2 className="text-6xl font-black text-white uppercase italic tracking-tighter mb-2">{activeItem.title || activeItem.name}</h2>
                                    <span className="bg-teal-500 text-black px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded">{activeItem.relationship || activeItem.role}</span>
                                </div>
                            </div>
                            <button onClick={() => setActiveItem(null)} className="bg-slate-800 text-white px-8 py-3 text-[10px] font-black hover:bg-white hover:text-black border border-slate-700 transition-all">BACK_TO_VAULT</button>
                        </div>

                        {activeTab === 'persona' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                <div className="bg-black/40 p-10 border border-slate-800 rounded shadow-2xl h-[550px] overflow-y-auto custom-scrollbar">
                                    <h4 className="text-teal-500 text-[10px] font-black uppercase mb-6 flex items-center gap-2 border-b border-slate-800 pb-2 italic font-serif tracking-widest"><Quote size={14}/> Dossier</h4>
                                    <p className="text-[14px] text-slate-400 font-sans leading-relaxed whitespace-pre-wrap uppercase selection:bg-teal-500/30">
                                        {activeItem.archive?.bio || "DNA_SEQUENCING_ERROR"}
                                    </p>
                                </div>
                                <div className="bg-black/40 p-10 border border-slate-800 rounded shadow-2xl h-[550px] overflow-y-auto custom-scrollbar">
                                    <h4 className="text-teal-500 text-[10px] font-black uppercase mb-6 italic border-b border-slate-800 pb-2">DNA_Memories ({activeItem.archive?.anecdotes?.length || 0})</h4>
                                    {(activeItem.archive?.anecdotes || []).map((a, i) => (
                                        <p key={i} className="p-4 bg-white/5 border border-white/5 text-[10px] text-slate-500 italic mb-3 uppercase leading-relaxed hover:text-white hover:bg-teal-500/5 transition-all">"{a}"</p>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </section>

            {/* PANE 3: COMMAND */}
            {viewMode === 'god' && (
                <section className="w-[420px] bg-[#0b0c0e] p-10 flex flex-col gap-12 border-l border-slate-800 overflow-y-auto shadow-2xl">
                    <div className="space-y-6">
                        <h3 className="text-teal-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border-b border-slate-900 pb-2"><UserPlus size={14}/> Identity_Spawn</h3>
                        <input className="w-full bg-[#1c1f23] p-4 border border-slate-800 text-[12px] text-white font-bold outline-none focus:border-teal-500 uppercase" placeholder="IDENTITY_NAME" value={newP.name} onChange={(e) => setNewP({...newP, name: e.target.value})} />
                        <div className="grid grid-cols-2 gap-2">
                            <select className="bg-[#1c1f23] p-4 border border-slate-800 text-[10px] text-teal-500 font-black outline-none" value={newP.gender} onChange={(e) => setNewP({...newP, gender: e.target.value})}>
                                {CONFIG.GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                            <input className="bg-[#1c1f23] p-4 border border-slate-800 text-[10px] text-slate-500 outline-none uppercase" placeholder="ROLE" value={newP.role} onChange={(e) => setNewP({...newP, role: e.target.value})} />
                        </div>
                        <button onClick={spawnPersona} disabled={loading} className="w-full py-4 bg-teal-500 text-black text-[11px] font-black uppercase shadow-2xl disabled:opacity-20 hover:bg-white transition-all">COMMIT_DNA</button>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-teal-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border-b border-slate-900 pb-2"><Database size={14}/> Establish_Season</h3>
                        <input className="w-full bg-[#1c1f23] p-4 border border-slate-800 text-[12px] text-white font-bold outline-none focus:border-teal-500 uppercase" placeholder="NARRATIVE_TOPIC" value={newS.topic} onChange={(e) => setNewS({...newS, topic: e.target.value})} />
                        <div className="grid grid-cols-2 gap-2">
                            {personas.map(p => (
                                <button key={p.id} onClick={() => {
                                    const ids = newS.host_ids.includes(p.id) ? newS.host_ids.filter(id => id !== p.id) : [...newS.host_ids, p.id];
                                    setNewS({...newS, host_ids: ids.slice(0, 2)});
                                }} className={`p-3 text-[9px] font-black border uppercase rounded transition-all truncate ${newS.host_ids.includes(p.id) ? 'border-teal-500 bg-teal-500/10 text-teal-400 shadow-[0_0_20px_#2dd4bf30]' : 'border-slate-800 text-slate-600'}`}>{p.name}</button>
                            ))}
                        </div>
                        <div className="space-y-2">
                            <p className="text-[9px] text-slate-600 uppercase font-black flex justify-between tracking-[0.2em]">Node_Length <span>{newS.episodes_count}</span></p>
                            <input type="range" min="4" max="24" step="2" className="w-full accent-teal-500" value={newS.episodes_count} onChange={(e) => setNewS({...newS, episodes_count: e.target.value})} />
                        </div>
                        <button onClick={establishSeason} disabled={loading || newS.host_ids.length !== 2} className="w-full py-6 bg-teal-500 text-black text-[11px] font-black uppercase shadow-2xl disabled:opacity-20 hover:bg-white transition-all">ESTABLISH_SIGNAL</button>
                    </div>
                </section>
            )}
        </div>
    );
};

export default App;
