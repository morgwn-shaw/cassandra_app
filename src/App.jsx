import React, { useState, useEffect } from 'react';
import { Zap, Trash2, UserPlus, Database, Quote, Brain, Dice5, Loader2, Fingerprint, History, Eye, Terminal } from 'lucide-react';

const API_BASE = "https://shadow-cassandrafiles.pythonanywhere.com/api/v2";

const CONFIG = {
    GENDERS: ["Male", "Female", "Non-Binary", "Random"],
    DYNAMICS: ["UST - High Friction", "Mentor / Mentee", "Buddy Cop", "Grudging Mutual Respect", "Bitter Rivals", "Frenemies", "Shared Secret", "Unresolved Sexual Tension"],
    TRAUMAS: ["Witnessed server farm bleed-out.", "Neural-link betrayal.", "Exposed data laundering ring.", "Escaped digital cult.", "Wrongly flagged as domestic threat."]
};

const App = () => {
    const [viewMode, setViewMode] = useState('god'); 
    const [activeTab, setActiveTab] = useState('season');
    const [activeItem, setActiveItem] = useState(null);
    const [seasons, setSeasons] = useState([]);
    const [personas, setPersonas] = useState([]);
    const [loading, setLoading] = useState(false);

    const [newP, setNewP] = useState({ name: '', role: 'Investigator', trauma: CONFIG.TRAUMAS[0], gender: 'Male' });
    const [newS, setNewS] = useState({ topic: '', relationship: CONFIG.DYNAMICS[0], host_ids: [], episodes_count: 10 });

    useEffect(() => { refreshData(); }, []);

    const refreshData = async () => {
        try {
            const sRes = await fetch(`${API_BASE}/season/list`);
            setSeasons(await sRes.json() || []);
            const pRes = await fetch(`${API_BASE}/persona/list`);
            setPersonas(await pRes.json() || []);
        } catch (e) {}
    };

    const handleTabChange = (tab) => {
        setActiveItem(null); // CRITICAL: Prevents rendering the wrong data type
        setActiveTab(tab);
    };

    const runAction = async (endpoint, body) => {
        setLoading(true);
        try {
            await fetch(`${API_BASE}${endpoint}`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body) });
            await refreshData();
        } finally { setLoading(false); }
    };

    const deleteItem = async (e, type, id) => {
        e.stopPropagation();
        if (!window.confirm("Purge?")) return;
        await fetch(`${API_BASE}/${type}/delete/${id}`, { method: 'DELETE' });
        refreshData();
    };

    return (
        <div className="h-screen w-screen font-mono flex overflow-hidden bg-[#0d0f11] text-slate-400">
            {loading && (
                <div className="fixed inset-0 bg-black/95 z-[100] flex flex-col items-center justify-center backdrop-blur-xl">
                    <Loader2 className="w-12 h-12 text-teal-500 animate-spin mb-4" />
                    <p className="text-teal-400 text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">Baking_Dossier</p>
                </div>
            )}

            {/* PANE 1: TELEMETRY */}
            {viewMode === 'god' && (
                <section className="w-[320px] border-r border-slate-800 bg-black/40 p-6 flex flex-col gap-6 shadow-2xl">
                    <div className="flex items-center gap-2 text-teal-500 font-black text-[10px] uppercase tracking-widest border-b border-slate-900 pb-4">
                        <Zap size={14} /> Shadow_v29.1
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-2 opacity-30 text-[9px]">
                        {["Kernel Stable", "3-Act Enforced", "Vault Ready"].map((log, i) => (
                            <div key={i} className="border-l border-slate-800 pl-3 py-1 font-bold">SYSLOG::{log}</div>
                        ))}
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
                    <button onClick={() => handleTabChange('season')} className={`px-10 py-3 text-[10px] font-black transition-all ${activeTab === 'season' && !activeItem ? 'bg-teal-500 text-black' : 'bg-slate-800'}`}>SEASONS</button>
                    <button onClick={() => handleTabChange('persona')} className={`px-10 py-3 text-[10px] font-black transition-all ${activeTab === 'persona' && !activeItem ? 'bg-teal-500 text-black' : 'bg-slate-800'}`}>PERSONAS</button>
                </div>

                {!activeItem ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in">
                        {(activeTab === 'season' ? seasons : personas).map((item, i) => (
                            <div key={i} className="bg-[#1c1f23] border border-slate-800 p-6 rounded cursor-pointer hover:border-teal-500 transition-all flex gap-5 items-center group relative shadow-2xl" onClick={() => setActiveItem(item)}>
                                <button onClick={(e) => deleteItem(e, activeTab, item.id)} className="absolute top-4 right-4 text-red-900 hover:text-red-500"><Trash2 size={16}/></button>
                                {item.portrait ? <img src={item.portrait} className="w-14 h-14 rounded grayscale group-hover:grayscale-0 border border-slate-800" alt="P" /> : <div className="w-14 h-14 rounded bg-slate-900 flex items-center justify-center"><Fingerprint size={24}/></div>}
                                <div>
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
                                {activeItem.portrait && <img src={activeItem.portrait} className="w-28 h-28 rounded border border-slate-700 shadow-2xl" alt="P" />}
                                <div>
                                    <h2 className="text-6xl font-black text-white uppercase italic tracking-tighter mb-2">{activeItem.title || activeItem.name}</h2>
                                    <span className="bg-teal-500 text-black px-3 py-1 text-[9px] font-black uppercase rounded">{activeItem.relationship || activeItem.role}</span>
                                </div>
                            </div>
                            <button onClick={() => setActiveItem(null)} className="bg-slate-800 text-white px-8 py-3 text-[10px] font-black hover:bg-white hover:text-black">CLOSE</button>
                        </div>

                        {activeTab === 'persona' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                <div className="bg-black/40 p-10 border border-slate-800 rounded shadow-2xl h-[550px] overflow-y-auto custom-scrollbar">
                                    <h4 className="text-teal-500 text-[10px] font-black uppercase mb-6 italic border-b border-slate-800 pb-2"><Quote size={14}/> Forensic Dossier</h4>
                                    <p className="text-[13px] text-slate-400 font-sans leading-relaxed whitespace-pre-wrap uppercase italic">{activeItem.archive?.bio || "DNA_SEQUENCING_IN_PROGRESS"}</p>
                                </div>
                                <div className="bg-black/40 p-10 border border-slate-800 rounded shadow-2xl h-[550px] overflow-y-auto custom-scrollbar">
                                    <h4 className="text-teal-500 text-[10px] font-black uppercase mb-6 italic border-b border-slate-800 pb-2">Anecdotes ({activeItem.archive?.anecdotes?.length || 0})</h4>
                                    {activeItem.archive?.anecdotes?.map((a, i) => <p key={i} className="p-4 bg-white/5 border border-white/5 text-[10px] text-slate-500 italic mb-3 uppercase leading-relaxed hover:text-white transition-all">"{a}"</p>)}
                                </div>
                            </div>
                        )}

                        {activeTab === 'season' && (
                            <div className="grid grid-cols-1 gap-4">
                                {activeItem.episodes?.map((ep, idx) => (
                                    <div key={idx} className="p-8 bg-[#1c1f23] border border-slate-800 flex justify-between items-center group hover:border-teal-500 transition-all shadow-2xl">
                                        <div className="flex gap-8 items-center">
                                            <div className="w-14 h-14 bg-black/50 border border-slate-800 rounded flex flex-col items-center justify-center">
                                                <span className="text-[10px] text-teal-500 font-black">ACT</span>
                                                <span className="text-2xl font-black text-white">{ep.act}</span>
                                            </div>
                                            <div>
                                                <span className="text-[9px] text-teal-500 uppercase tracking-widest opacity-60 italic mb-1 block">{ep.sub_topic}</span>
                                                <h4 className="text-white font-black text-2xl uppercase italic tracking-tighter">{ep.title}</h4>
                                            </div>
                                        </div>
                                        <button className="px-8 py-3 bg-slate-800 text-teal-500 text-[10px] font-black uppercase border border-slate-700 hover:bg-teal-500 hover:text-black">Run_Node</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </section>

            {/* PANE 3: COMMAND */}
            {viewMode === 'god' && (
                <section className="w-[450px] bg-[#0b0c0e] p-10 flex flex-col gap-12 border-l border-slate-800 overflow-y-auto shadow-2xl">
                    <div className="space-y-6">
                        <h3 className="text-teal-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border-b border-slate-900 pb-2"><UserPlus size={16}/> Identity_Spawn</h3>
                        <input className="w-full bg-[#1c1f23] p-4 border border-slate-800 text-[12px] text-white font-bold outline-none uppercase" placeholder="NAME" value={newP.name} onChange={(e) => setNewP({...newP, name: e.target.value})} />
                        <div className="grid grid-cols-2 gap-2">
                            <select className="bg-[#1c1f23] p-4 border border-slate-800 text-[10px] text-teal-500 font-black outline-none" value={newP.gender} onChange={(e) => setNewP({...newP, gender: e.target.value})}>{CONFIG.GENDERS.map(g => <option key={g}>{g}</option>)}</select>
                            <input className="bg-[#1c1f23] p-4 border border-slate-800 text-[10px] text-slate-500 outline-none uppercase" placeholder="ROLE" value={newP.role} onChange={(e) => setNewP({...newP, role: e.target.value})} />
                        </div>
                        <div className="relative">
                            <input className="w-full bg-[#1c1f23] p-4 border border-slate-800 text-[10px] text-slate-500 outline-none uppercase pr-12" placeholder="CORE_TRAUMA" value={newP.trauma} onChange={(e) => setNewP({...newP, trauma: e.target.value})} />
                            <button onClick={() => setNewP({...newP, trauma: CONFIG.TRAUMAS[Math.floor(Math.random() * CONFIG.TRAUMAS.length)]})} className="absolute right-4 top-3 text-slate-700 hover:text-teal-500 transition-all"><Dice5 size={20}/></button>
                        </div>
                        <button onClick={() => runAction('/persona/create', newP)} className="w-full py-4 bg-teal-500 text-black text-[11px] font-black uppercase shadow-2xl hover:bg-white transition-all">COMMIT_DNA</button>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-teal-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border-b border-slate-900 pb-2"><Database size={16}/> Establish_Season</h3>
                        <input className="w-full bg-[#1c1f23] p-4 border border-slate-800 text-[12px] text-white font-bold outline-none uppercase" placeholder="TOPIC" value={newS.topic} onChange={(e) => setNewS({...newS, topic: e.target.value})} />
                        <select className="w-full bg-[#1c1f23] p-4 border border-slate-800 text-[10px] text-teal-400 font-bold" value={newS.relationship} onChange={(e) => setNewS({...newS, relationship: e.target.value})}>{CONFIG.DYNAMICS.map(d => <option key={d}>{d}</option>)}</select>
                        <div className="grid grid-cols-2 gap-2">{personas.map(p => <button key={p.id} onClick={() => { const ids = newS.host_ids.includes(p.id) ? newS.host_ids.filter(id => id !== p.id) : [...newS.host_ids, p.id]; setNewS({...newS, host_ids: ids.slice(0, 2)}); }} className={`p-4 text-[9px] font-black border uppercase rounded truncate transition-all ${newS.host_ids.includes(p.id) ? 'border-teal-500 bg-teal-500/10 text-teal-400' : 'border-slate-800 text-slate-600'}`}>{p.name}</button>)}</div>
                        <button onClick={() => runAction('/season/reconcile', newS)} disabled={newS.host_ids.length !== 2} className="w-full py-6 bg-teal-500 text-black text-[11px] font-black uppercase shadow-2xl hover:bg-white transition-all">ESTABLISH_SIGNAL</button>
                    </div>
                </section>
            )}
        </div>
    );
};

export default App;
