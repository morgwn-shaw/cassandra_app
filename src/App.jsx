import React, { useState, useEffect, useRef } from 'react';
import { Zap, Activity, Trash2, Plus, UserPlus, Database, Quote, Brain, Dice5, Eye, Terminal, Loader2, ShieldAlert } from 'lucide-react';

const API_BASE = "https://shadow-cassandrafiles.pythonanywhere.com/api/v2";

const App = () => {
    const [viewMode, setViewMode] = useState('god'); // 'god' or 'user'
    const [activeTab, setActiveTab] = useState('season');
    const [activeItem, setActiveItem] = useState(null);
    const [seasons, setSeasons] = useState([]);
    const [personas, setPersonas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ stage: 'IDLE', history: [], response_payload: '{}' });

    const [newP, setNewP] = useState({ name: '', role: 'Analyst', trauma: '', gender: 'Random' });
    const [newS, setNewS] = useState({ topic: '', relationship: 'UST - High Friction', host_ids: [], episodes_count: 10 });

    const logEndRef = useRef(null);

    useEffect(() => {
        refreshData();
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`${API_BASE}/status`);
                const data = await res.json();
                setStatus(data);
                if (data.stage === 'SUCCESS' && !loading) refreshData();
            } catch (e) {}
        }, 2000);
        return () => clearInterval(interval);
    }, [loading]);

    const refreshData = async () => {
        try {
            const sRes = await fetch(`${API_BASE}/season/list`);
            setSeasons(await sRes.json() || []);
            const pRes = await fetch(`${API_BASE}/persona/list`);
            setPersonas(await pRes.json() || []);
        } catch (e) {}
    };

    const handleAction = async (endpoint, body) => {
        setActiveItem(null);
        setLoading(true);
        try {
            await fetch(`${API_BASE}${endpoint}`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body) });
            await refreshData();
        } finally { setLoading(false); }
    };

    const deleteItem = async (e, type, id) => {
        e.stopPropagation();
        if (!window.confirm("Nuclear Purge?")) return;
        await fetch(`${API_BASE}/${type}/delete/${id}`, { method: 'DELETE' });
        refreshData();
    };

    return (
        <div className={`h-screen w-screen font-mono flex overflow-hidden bg-[#0d0f11] text-slate-400`}>
            
            {/* GLOBAL LOADING GUARD */}
            {loading && (
                <div className="fixed inset-0 bg-black/95 z-[100] flex flex-col items-center justify-center backdrop-blur-xl">
                    <Loader2 className="w-16 h-16 text-teal-500 animate-spin mb-4" />
                    <p className="text-teal-400 text-[10px] font-black uppercase tracking-[0.8em] animate-pulse">{status.stage}_IN_PROGRESS</p>
                    <p className="text-slate-700 text-[8px] mt-4 uppercase italic">{status.last_event}</p>
                </div>
            )}

            {/* PANE 1: MONITORING (GOD ONLY) */}
            {viewMode === 'god' && (
                <section className="w-[350px] border-r border-slate-800 bg-black/40 p-6 flex flex-col shadow-2xl">
                    <div className="flex items-center gap-2 text-teal-500 font-black text-[10px] mb-8 uppercase tracking-[0.3em] border-b border-slate-900 pb-4">
                        <Zap size={14} /> Telemetry_v28.6
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-2 text-[9px] custom-scrollbar">
                        {status.history?.map((log, i) => (
                            <div key={i} className="border-l border-slate-800 pl-3 py-1 font-bold text-slate-600 uppercase italic">{log}</div>
                        ))}
                        <div ref={logEndRef} />
                    </div>
                    <div className="h-32 bg-black/60 p-3 rounded border border-slate-800 mt-6 overflow-hidden text-[8px] text-teal-900 italic uppercase">
                        Payload_Buffer: {status.response_payload?.substring(0, 100)}...
                    </div>
                </section>
            )}

            {/* PANE 2: WORKSPACE (CENTER) */}
            <section className="flex-1 flex flex-col p-10 overflow-y-auto relative bg-[#121416]">
                <div className="absolute top-10 right-10 flex border border-slate-800 rounded overflow-hidden z-50 shadow-2xl">
                    <button onClick={() => setViewMode('god')} className={`px-4 py-2 text-[9px] font-black ${viewMode === 'god' ? 'bg-teal-500 text-black' : 'bg-slate-900'}`}>GOD</button>
                    <button onClick={() => setViewMode('user')} className={`px-4 py-2 text-[9px] font-black ${viewMode === 'user' ? 'bg-teal-500 text-black' : 'bg-slate-900'}`}>AUDIENCE</button>
                </div>

                <div className="flex gap-4 mb-10 border-b border-slate-800 pb-6">
                    <button onClick={() => { setActiveItem(null); setActiveTab('season'); }} className={`px-10 py-3 text-[10px] font-black ${activeTab === 'season' && !activeItem ? 'bg-teal-500 text-black shadow-lg' : 'bg-slate-800 text-slate-500'}`}>SEASONS</button>
                    <button onClick={() => { setActiveItem(null); setActiveTab('persona'); }} className={`px-10 py-3 text-[10px] font-black ${activeTab === 'persona' && !activeItem ? 'bg-teal-500 text-black shadow-lg' : 'bg-slate-800 text-slate-500'}`}>PERSONAS</button>
                </div>

                {!activeItem ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in">
                        {(activeTab === 'season' ? seasons : personas).map((item, i) => (
                            <div key={i} className="bg-[#1c1f23] border border-slate-800 p-8 rounded cursor-pointer hover:border-teal-500/50 transition-all flex gap-6 items-center relative group shadow-2xl" onClick={() => setActiveItem(item)}>
                                {viewMode === 'god' && <button onClick={(e) => deleteItem(e, activeTab, item.id)} className="absolute top-4 right-4 text-red-900 hover:text-red-500 transition-all"><Trash2 size={16}/></button>}
                                {item.portrait ? (
                                    <img src={item.portrait} className="w-16 h-16 rounded grayscale group-hover:grayscale-0 border border-slate-800 transition-all" alt="P" />
                                ) : <div className="w-16 h-16 rounded bg-slate-900 flex items-center justify-center border border-slate-800"><Fingerprint size={28}/></div>}
                                <div>
                                    <h4 className="text-white font-black uppercase text-base tracking-tighter italic">{item.title || item.name}</h4>
                                    <p className="text-[10px] text-teal-500 font-bold uppercase tracking-widest">{item.relationship || item.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-12">
                        <div className="flex justify-between items-end border-b border-slate-800 pb-8">
                            <div className="flex gap-8 items-center">
                                {activeItem.portrait && <img src={activeItem.portrait} className="w-28 h-28 rounded border border-slate-700 shadow-2xl grayscale" alt="P" />}
                                <div>
                                    <h2 className="text-6xl font-black text-white uppercase italic tracking-tighter mb-2">{activeItem.title || activeItem.name}</h2>
                                    <span className="bg-teal-500 text-black px-4 py-1 text-[10px] font-black uppercase tracking-widest rounded">{activeItem.relationship || activeItem.role}</span>
                                </div>
                            </div>
                            <button onClick={() => setActiveItem(null)} className="bg-slate-800 text-white px-8 py-3 text-[10px] font-black border border-slate-700 hover:bg-white hover:text-black transition-all">BACK</button>
                        </div>

                        {activeTab === 'persona' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                <div className="bg-black/40 p-10 border border-slate-800 rounded shadow-2xl h-[550px] overflow-y-auto custom-scrollbar">
                                    <h4 className="text-teal-500 text-[10px] font-black uppercase mb-6 italic border-b border-slate-800 pb-2">Forensic Dossier</h4>
                                    <p className="text-[13px] text-slate-400 font-sans leading-relaxed whitespace-pre-wrap uppercase">{activeItem.archive?.bio || "DNA_SEQUENCING_FAILURE"}</p>
                                </div>
                                <div className="bg-black/40 p-10 border border-slate-800 rounded shadow-2xl h-[550px] overflow-y-auto custom-scrollbar">
                                    <h4 className="text-teal-500 text-[10px] font-black uppercase mb-6 italic border-b border-slate-800 pb-2">Anecdotes ({activeItem.archive?.anecdotes?.length})</h4>
                                    {(activeItem.archive?.anecdotes || []).map((a, i) => (
                                        <p key={i} className="p-4 bg-white/5 border border-white/5 text-[10px] text-slate-500 italic mb-4 uppercase leading-relaxed">"{a}"</p>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'season' && (
                            <div className="grid grid-cols-1 gap-6">
                                {(activeItem.episodes || []).map((ep, idx) => (
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
                                        <button className="px-8 py-3 bg-slate-800 text-teal-500 text-[10px] font-black uppercase border border-slate-700 hover:bg-teal-500 hover:text-black transition-all">Generate_Brief</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </section>

            {/* PANE 3: COMMAND (GOD ONLY) */}
            {viewMode === 'god' && (
                <section className="w-[450px] bg-[#0b0c0e] p-10 flex flex-col gap-12 border-l border-slate-800 overflow-y-auto shadow-2xl">
                    <div className="space-y-6">
                        <h3 className="text-teal-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-900 pb-2 flex items-center gap-2"><UserPlus size={16}/> Identity_Spawn</h3>
                        <input className="w-full bg-[#1c1f23] p-4 border border-slate-800 text-[11px] text-white font-bold outline-none uppercase" placeholder="NAME" value={newP.name} onChange={(e) => setNewP({...newP, name: e.target.value})} />
                        <div className="grid grid-cols-2 gap-2">
                            <select className="bg-[#1c1f23] p-4 border border-slate-800 text-[10px] text-teal-500 font-black" value={newP.gender} onChange={(e) => setNewP({...newP, gender: e.target.value})}>
                                {["Male", "Female", "Non-Binary", "Random"].map(g => <option key={g}>{g}</option>)}
                            </select>
                            <input className="bg-[#1c1f23] p-4 border border-slate-800 text-[10px] text-slate-500 outline-none uppercase" placeholder="ROLE" value={newP.role} onChange={(e) => setNewP({...newP, role: e.target.value})} />
                        </div>
                        <button onClick={() => handleAction('/persona/create', newP)} disabled={loading} className="w-full py-4 bg-teal-500 text-black text-[11px] font-black uppercase shadow-2xl hover:bg-white transition-all">COMMIT_DNA</button>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-teal-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-900 pb-2 flex items-center gap-2"><Database size={16}/> Establish_Season</h3>
                        <input className="w-full bg-[#1c1f23] p-4 border border-slate-800 text-[12px] text-white font-bold outline-none uppercase" placeholder="TOPIC" value={newS.topic} onChange={(e) => setNewS({...newS, topic: e.target.value})} />
                        <select className="w-full bg-[#1c1f23] p-4 border border-slate-800 text-[10px] text-teal-400 font-bold" value={newS.relationship} onChange={(e) => setNewS({...newS, relationship: e.target.value})}>
                            {["UST - High Friction", "Strategic Tension", "Grudging Mutual Respect", "Bitter Rivals"].map(d => <option key={d}>{d}</option>)}
                        </select>
                        <div className="grid grid-cols-2 gap-2">
                            {personas.map(p => (
                                <button key={p.id} onClick={() => {
                                    const ids = newS.host_ids.includes(p.id) ? newS.host_ids.filter(id => id !== p.id) : [...newS.host_ids, p.id];
                                    setNewS({...newS, host_ids: ids.slice(0, 2)});
                                }} className={`p-4 text-[9px] font-black border uppercase rounded truncate transition-all ${newS.host_ids.includes(p.id) ? 'border-teal-500 bg-teal-500/10 text-teal-400' : 'border-slate-800 text-slate-600'}`}>{p.name}</button>
                            ))}
                        </div>
                        <div className="space-y-2">
                            <p className="text-[9px] text-slate-600 uppercase font-black flex justify-between tracking-widest">Nodes <span>{newS.episodes_count}</span></p>
                            <input type="range" min="4" max="24" step="2" className="w-full accent-teal-500" value={newS.episodes_count} onChange={(e) => setNewS({...newS, episodes_count: e.target.value})} />
                        </div>
                        <button onClick={() => handleAction('/season/reconcile', newS)} disabled={loading || newS.host_ids.length !== 2} className="w-full py-6 bg-teal-500 text-black text-[11px] font-black uppercase shadow-2xl hover:bg-white transition-all">ESTABLISH_SIGNAL</button>
                    </div>
                </section>
            )}
        </div>
    );
};

export default App;
