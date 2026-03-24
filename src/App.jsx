import React, { useState, useEffect } from 'react';
import { Zap, Activity, Trash2, Plus, UserPlus, Database, Quote, Brain, Dice5, Loader2, Fingerprint, History, TrendingUp } from 'lucide-react';

const API_BASE = "https://shadow-cassandrafiles.pythonanywhere.com/api/v2";

const CONFIG = {
    GENDERS: ["Male", "Female", "Non-Binary", "Random"],
    DYNAMICS: ["UST - High Friction", "Strategic Tension", "Grudging Mutual Respect", "Bitter Rivals", "Frenemies", "Mentor/Mentee", "Shared Secret", "Unresolved Sexual Tension"],
    TRAUMAS: ["Witnessed server farm bleed-out.", "Neural-link betrayal.", "Identity stolen.", "Escaped digital cult."]
};

const App = () => {
    const [viewMode, setViewMode] = useState('god');
    const [activeTab, setActiveTab] = useState('season');
    const [activeItem, setActiveItem] = useState(null);
    const [seasons, setSeasons] = useState([]);
    const [personas, setPersonas] = useState([]);
    const [loading, setLoading] = useState(false);

    const [newP, setNewP] = useState({ name: '', role: 'Forensic Investigator', trauma: '', gender: 'Male' });
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

    const handleAction = async (endpoint, body) => {
        setLoading(true);
        try {
            await fetch(`${API_BASE}${endpoint}`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body) });
            await refreshData();
        } finally { setLoading(false); }
    };

    return (
        <div className={`h-screen w-screen font-mono flex overflow-hidden bg-[#0d0f11] text-slate-400`}>
            
            {loading && (
                <div className="fixed inset-0 bg-black/95 z-[100] flex flex-col items-center justify-center backdrop-blur-xl">
                    <Loader2 className="w-16 h-16 text-teal-500 animate-spin mb-4" />
                    <p className="text-teal-400 text-[10px] font-black uppercase tracking-[0.8em] animate-pulse">Orchestrating_3_Act_Arc</p>
                </div>
            )}

            {/* PANE 1: LEGACY & TELEMETRY */}
            {viewMode === 'god' && (
                <section className="w-[350px] border-r border-slate-800 bg-black/40 p-6 flex flex-col gap-6 shadow-2xl">
                    <div className="flex items-center gap-2 text-teal-500 font-black text-[10px] uppercase tracking-[0.3em] border-b border-slate-900 pb-4">
                        <Zap size={14} /> Showrunner_v29.0
                    </div>
                    <div className="bg-teal-900/10 p-4 border border-teal-900/30 rounded">
                        <h4 className="text-teal-500 text-[9px] font-black uppercase mb-2 flex items-center gap-2"><History size={12}/> Legacy_Vault_Status</h4>
                        <p className="text-[8px] italic leading-tight text-slate-500 uppercase">Persistent lore will be injected upon host pairing. 10/70/20 distribution enforced.</p>
                    </div>
                </section>
            )}

            {/* PANE 2: WORKSPACE */}
            <section className="flex-1 flex flex-col p-10 overflow-y-auto relative bg-[#121416]">
                <div className="absolute top-10 right-10 flex border border-slate-800 rounded overflow-hidden z-50">
                    <button onClick={() => setViewMode('god')} className={`px-4 py-2 text-[9px] font-black ${viewMode === 'god' ? 'bg-teal-500 text-black shadow-inner' : 'bg-slate-900 text-slate-500'}`}>GOD</button>
                    <button onClick={() => setViewMode('user')} className={`px-4 py-2 text-[9px] font-black ${viewMode === 'user' ? 'bg-teal-500 text-black shadow-inner' : 'bg-slate-900 text-slate-500'}`}>USER</button>
                </div>

                <div className="flex gap-4 mb-10 border-b border-slate-800 pb-6">
                    <button onClick={() => { setActiveItem(null); setActiveTab('season'); }} className={`px-10 py-3 text-[10px] font-black transition-all ${activeTab === 'season' && !activeItem ? 'bg-teal-500 text-black shadow-lg' : 'bg-slate-800 text-slate-500'}`}>SEASONS</button>
                    <button onClick={() => { setActiveItem(null); setActiveTab('persona'); }} className={`px-10 py-3 text-[10px] font-black transition-all ${activeTab === 'persona' && !activeItem ? 'bg-teal-500 text-black shadow-lg' : 'bg-slate-800 text-slate-500'}`}>PERSONAS</button>
                </div>

                {!activeItem ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in">
                        {(activeTab === 'season' ? seasons : personas).map((item, i) => (
                            <div key={i} className="bg-[#1c1f23] border border-slate-800 p-8 rounded-lg cursor-pointer hover:border-teal-500/50 transition-all flex gap-6 items-center relative group shadow-2xl" onClick={() => setActiveItem(item)}>
                                {item.portrait ? (
                                    <img src={item.portrait} className="w-16 h-16 rounded grayscale group-hover:grayscale-0 border border-slate-800 transition-all shadow-xl" alt="P" />
                                ) : <div className="w-16 h-16 rounded bg-slate-900 flex items-center justify-center border border-slate-800"><Fingerprint size={28}/></div>}
                                <div>
                                    <h4 className="text-white font-black uppercase text-base italic tracking-tighter">{item.title || item.name}</h4>
                                    <p className="text-[10px] text-teal-500 font-bold uppercase tracking-widest">{item.archetype || item.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-12">
                        <div className="flex justify-between items-end border-b border-slate-800 pb-8">
                            <div className="flex gap-8 items-center">
                                {activeItem.portrait && <img src={activeItem.portrait} className="w-24 h-24 rounded border border-slate-700 shadow-2xl grayscale" alt="P" />}
                                <div>
                                    <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter mb-2">{activeItem.title || activeItem.name}</h2>
                                    <span className="bg-teal-500 text-black px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded">{activeItem.relationship || activeItem.role}</span>
                                </div>
                            </div>
                            <button onClick={() => setActiveItem(null)} className="bg-slate-800 text-white px-8 py-3 text-[10px] font-black hover:bg-white hover:text-black border border-slate-700 transition-all">BACK</button>
                        </div>

                        {activeTab === 'season' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                <div className="space-y-4">
                                    <h4 className="text-teal-500 text-[10px] font-black uppercase italic border-b border-slate-800 pb-2 flex justify-between"><span>Narrative_Nodes</span> <span className="opacity-40">{activeItem.archetype}</span></h4>
                                    {activeItem.episodes?.map((ep, idx) => (
                                        <div key={idx} className="p-6 bg-[#1c1f23] border border-slate-800 flex justify-between items-center group hover:border-teal-500 transition-all">
                                            <div className="flex flex-col">
                                                <span className="text-[8px] text-teal-500 font-black">ACT {ep.act}</span>
                                                <span className="text-white font-bold text-sm uppercase tracking-tighter">{ep.title}</span>
                                            </div>
                                            <button className="px-6 py-2 bg-slate-800 text-[9px] font-black uppercase border border-slate-700 hover:bg-teal-500 transition-all">Run_6_Act_Brief</button>
                                        </div>
                                    ))}
                                </div>
                                <div className="space-y-4">
                                    <div className="bg-black/40 p-8 border border-slate-800 rounded shadow-2xl h-[300px] overflow-y-auto">
                                        <h4 className="text-teal-500 text-[10px] font-black uppercase mb-4 italic flex items-center gap-2"><TrendingUp size={14}/> Future_Lore_Buffer</h4>
                                        <p className="text-[13px] text-slate-400 leading-relaxed italic uppercase">"{activeItem.future_lore}"</p>
                                    </div>
                                    <div className="bg-black/40 p-8 border border-slate-800 rounded shadow-2xl h-[300px] overflow-y-auto">
                                        <h4 className="text-teal-500 text-[10px] font-black uppercase mb-4 italic flex items-center gap-2"><History size={14}/> Season_Shared_Anecdotes</h4>
                                        {activeItem.shared_lore?.map((l, i) => <p key={i} className="text-[10px] text-slate-500 mb-2 uppercase italic leading-tight">- {l}</p>)}
                                    </div>
                                </div>
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
                        <input className="w-full bg-[#1c1f23] p-4 border border-slate-800 text-[12px] text-white font-bold outline-none focus:border-teal-500 uppercase" placeholder="NAME" value={newP.name} onChange={(e) => setNewP({...newP, name: e.target.value})} />
                        <div className="grid grid-cols-2 gap-2">
                            <select className="bg-[#1c1f23] p-4 border border-slate-800 text-[10px] text-teal-500 font-black outline-none" value={newP.gender} onChange={(e) => setNewP({...newP, gender: e.target.value})}>{CONFIG.GENDERS.map(g => <option key={g} value={g}>{g}</option>)}</select>
                            <input className="bg-[#1c1f23] p-4 border border-slate-800 text-[10px] text-slate-500 outline-none uppercase" placeholder="ROLE" value={newP.role} onChange={(e) => setNewP({...newP, role: e.target.value})} />
                        </div>
                        <div className="relative">
                            <input className="w-full bg-[#1c1f23] p-4 border border-slate-800 text-[10px] text-slate-500 outline-none uppercase pr-12" placeholder="CORE_TRAUMA" value={newP.trauma} onChange={(e) => setNewP({...newP, trauma: e.target.value})} />
                            <button onClick={() => setNewP({...newP, trauma: CONFIG.TRAUMAS[Math.floor(Math.random() * CONFIG.TRAUMAS.length)]})} className="absolute right-4 top-3 text-slate-700 hover:text-teal-500 transition-all"><Dice5 size={20}/></button>
                        </div>
                        <button onClick={() => handleAction('/persona/create', newP)} className="w-full py-4 bg-teal-500 text-black text-[11px] font-black uppercase shadow-2xl hover:bg-white transition-all">COMMIT_DNA</button>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-teal-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border-b border-slate-900 pb-2"><Database size={16}/> Establish_Season</h3>
                        <input className="w-full bg-[#1c1f23] p-4 border border-slate-800 text-[12px] text-white font-bold outline-none focus:border-teal-500 uppercase" placeholder="TOPIC" value={newS.topic} onChange={(e) => setNewS({...newS, topic: e.target.value})} />
                        <select className="w-full bg-[#1c1f23] p-4 border border-slate-800 text-[10px] text-teal-400 font-bold" value={newS.relationship} onChange={(e) => setNewS({...newS, relationship: e.target.value})}>{CONFIG.DYNAMICS.map(d => <option key={d} value={d}>{d}</option>)}</select>
                        <div className="grid grid-cols-2 gap-2">{personas.map(p => <button key={p.id} onClick={() => { const ids = newS.host_ids.includes(p.id) ? newS.host_ids.filter(id => id !== p.id) : [...newS.host_ids, p.id]; setNewS({...newS, host_ids: ids.slice(0, 2)}); }} className={`p-4 text-[9px] font-black border uppercase rounded truncate transition-all ${newS.host_ids.includes(p.id) ? 'border-teal-500 bg-teal-500/10 text-teal-400 shadow-xl' : 'border-slate-800 text-slate-600'}`}>{p.name}</button>)}</div>
                        <button onClick={() => handleAction('/season/reconcile', newS)} disabled={newS.host_ids.length !== 2} className="w-full py-6 bg-teal-500 text-black text-[11px] font-black uppercase shadow-2xl hover:bg-white transition-all">ESTABLISH_SIGNAL</button>
                    </div>
                </section>
            )}
        </div>
    );
};

export default App;
