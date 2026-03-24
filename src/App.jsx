import React, { useState, useEffect } from 'react';
import { Zap, Activity, Trash2, Database, Quote, Brain, Loader2, Fingerprint, ScrollText, ShieldCheck, Dice5, UserPlus, ShieldAlert, ChevronRight } from 'lucide-react';

const API_BASE = "https://shadow-cassandrafiles.pythonanywhere.com/api/v2";

const CONFIG = {
    GENDERS: ["Male", "Female", "Non-Binary", "Gender-Fluid"],
    DYNAMICS: ["UST - High Friction", "Strategic Tension", "Buddy Cop", "Master / Apprentice", "Bitter Rivals", "Frenemies", "Mentor / Mentee", "Unresolved Sexual Tension"],
    TRAUMAS: ["Witnessed server farm bleed-out.", "Neural-link betrayal.", "Identity wiped by ghost protocol.", "Exposed data laundering ring.", "Escaped digital cult."]
};

const App = () => {
    const [activeTab, setActiveTab] = useState('season');
    const [activeItem, setActiveItem] = useState(null);
    const [activeBrief, setActiveBrief] = useState(null);
    const [seasons, setSeasons] = useState([]);
    const [personas, setPersonas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ stage: 'IDLE', history: [], active_engine: 'Hunting...' });

    const [newP, setNewP] = useState({ name: '', role: 'Forensic Investigator', trauma: CONFIG.TRAUMAS[0], gender: 'Male' });
    const [newS, setNewS] = useState({ topic: '', relationship: CONFIG.DYNAMICS[0], host_ids: [], episodes_count: 10 });

    useEffect(() => {
        refreshData();
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`${API_BASE}/status`);
                const data = await res.json();
                if (data) setStatus(data);
            } catch (e) {}
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const refreshData = async () => {
        try {
            const sRes = await fetch(`${API_BASE}/season/list`);
            const sData = await sRes.json();
            setSeasons(Array.isArray(sData) ? sData : []);
            const pRes = await fetch(`${API_BASE}/persona/list`);
            const pData = await pRes.json();
            setPersonas(Array.isArray(pData) ? pData : []);
        } catch (e) { setSeasons([]); setPersonas([]); }
    };

    const runAction = async (endpoint, body) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}${endpoint}`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body) });
            await refreshData();
        } finally { setLoading(false); }
    };

    const getBrief = async (seasonId, idx) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/showrunner/brief`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ season_id: seasonId, node_index: idx }) });
            setActiveBrief(await res.json());
        } finally { setLoading(false); }
    };

    return (
        <div className="h-screen w-screen font-mono flex overflow-hidden bg-[#0d0f11] text-slate-400">
            
            {/* COLUMN 1: TELEMETRY (WHITE HIGH CONTRAST ERRORS) */}
            <aside className="w-[300px] border-r border-slate-800 bg-black/60 p-8 flex flex-col gap-6 shadow-2xl shrink-0">
                <div className="border-b border-slate-900 pb-6">
                    <div className="flex items-center gap-3 text-teal-500 font-black text-xs uppercase tracking-widest"><Zap size={16} /> Telemetry_v37.5</div>
                    <div className="text-[9px] text-teal-900 uppercase font-black italic mt-1">{status.active_engine}</div>
                </div>
                <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar">
                    {(status?.history || []).map((log, i) => {
                        const isFail = log.includes("FAIL") || log.includes("ERROR") || log.includes("Warning");
                        return (
                            <div key={i} className={`border-l-2 pl-4 py-1 uppercase italic leading-tight ${isFail ? 'text-white font-black text-[12px] border-red-500' : 'text-slate-600 text-[10px] border-slate-800'}`}>
                                {log}
                            </div>
                        );
                    })}
                </div>
                <button onClick={() => runAction('/purge', {})} className="p-4 bg-red-950/20 border border-red-900/30 text-red-500 text-[10px] font-black uppercase flex items-center justify-center gap-3 hover:bg-red-600 hover:text-white transition-all">
                    <ShieldAlert size={16}/> Nuclear_Purge
                </button>
            </aside>

            {/* COLUMN 2: WORKSPACE */}
            <main className="flex-1 flex flex-col p-12 overflow-y-auto relative bg-[#121416]">
                {loading && (
                    <div className="absolute inset-0 bg-black/80 z-[100] flex flex-col items-center justify-center backdrop-blur-md">
                        <Loader2 className="w-16 h-16 text-teal-500 animate-spin mb-4" />
                        <p className="text-teal-400 text-xs font-black uppercase tracking-[0.8em] animate-pulse italic">Accessing_Apex_Signals...</p>
                    </div>
                )}

                <div className="flex gap-4 mb-12 border-b border-slate-800 pb-8">
                    <button onClick={() => {setActiveItem(null); setActiveBrief(null); setActiveTab('season');}} className={`px-12 py-4 text-[11px] font-black transition-all ${activeTab === 'season' && !activeItem ? 'bg-teal-500 text-black shadow-lg shadow-teal-500/20' : 'bg-slate-800 text-slate-500'}`}>SEASONS</button>
                    <button onClick={() => {setActiveItem(null); setActiveBrief(null); setActiveTab('persona');}} className={`px-12 py-4 text-[11px] font-black transition-all ${activeTab === 'persona' && !activeItem ? 'bg-teal-500 text-black shadow-lg shadow-teal-500/20' : 'bg-slate-800 text-slate-500'}`}>DNA_VAULT</button>
                </div>

                {!activeItem ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in">
                        {(activeTab === 'season' ? seasons : personas).map((item, i) => (
                            <div key={i} className="bg-[#1c1f23] border border-slate-800 p-8 rounded-xl cursor-pointer hover:border-teal-500/50 transition-all flex gap-8 items-center shadow-xl group" onClick={() => setActiveItem(item)}>
                                <div className="w-20 h-20 rounded bg-slate-900 overflow-hidden border border-slate-800 shrink-0">
                                    {item?.portrait ? <img src={item.portrait} className="w-full h-full object-cover grayscale group-hover:grayscale-0" alt="DNA" /> : <Fingerprint className="m-6 text-slate-700" size={32}/>}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-white font-black uppercase text-lg italic tracking-tighter truncate">{item?.title || item?.name}</h4>
                                    <p className="text-[11px] text-teal-500 uppercase font-black opacity-60 tracking-[0.2em]">{item?.relationship || item?.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="animate-in slide-in-from-bottom-6 space-y-12">
                        <div className="flex justify-between items-end border-b border-slate-800 pb-10">
                            <h2 className="text-7xl font-black text-white uppercase italic tracking-tighter">{activeItem?.title || activeItem?.name}</h2>
                            <button onClick={() => {setActiveItem(null); setActiveBrief(null);}} className="bg-teal-500 text-black px-10 py-4 text-xs font-black shadow-2xl">RETURN</button>
                        </div>

                        {activeTab === 'season' && (
                            <div className="flex flex-col gap-12">
                                {/* FULL WIDTH ARC SUMMARY */}
                                <div className="bg-teal-950/10 p-12 border border-teal-900/30 rounded-2xl shadow-2xl">
                                    <h4 className="text-teal-400 text-[11px] font-black uppercase mb-6 italic tracking-[0.3em] flex items-center gap-3"><ScrollText size={20}/> Grounded_Investigation_Blueprint</h4>
                                    <p className="text-[19px] text-slate-300 font-sans leading-relaxed uppercase selection:bg-teal-500/30">{activeItem?.summary}</p>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                                    <div className="space-y-6">
                                        <h4 className="text-teal-500 text-[11px] font-black uppercase italic border-b border-slate-800 pb-4">Investigative_Nodes</h4>
                                        {(activeItem?.episodes || []).map((ep, idx) => (
                                            <div key={idx} className="p-8 bg-[#1c1f23] border border-slate-800 group hover:border-teal-500 transition-all flex flex-col gap-4 shadow-xl rounded-lg">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[10px] text-teal-500 font-black tracking-widest uppercase">ACT {ep?.act}</span>
                                                    <button onClick={() => getBrief(activeItem.id, idx)} className="px-6 py-2 bg-slate-800 text-teal-500 text-[10px] font-black uppercase border border-slate-700 hover:bg-teal-500 hover:text-black transition-all">Ground_Node</button>
                                                </div>
                                                <h4 className="text-white font-black text-2xl uppercase italic tracking-tighter">{ep?.title}</h4>
                                                <p className="text-[12px] text-slate-500 uppercase italic leading-snug">{ep?.topic_summary}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="bg-black/40 border border-slate-800 rounded-2xl p-12 h-[850px] overflow-y-auto shadow-2xl relative">
                                        <h4 className="text-teal-500 text-[12px] font-black uppercase mb-10 border-b border-slate-900 pb-6 flex items-center gap-4"><ShieldCheck size={24}/> Technical_Production_Brief</h4>
                                        {activeBrief ? Object.entries(activeBrief?.acts || activeBrief || {}).map(([k, v], i) => (
                                            <div key={i} className="mb-12 animate-in slide-in-from-right-4">
                                                <span className="text-[10px] text-teal-400 font-black uppercase mb-4 block opacity-50 tracking-[0.3em]">{k.replace(/_/g, ' ')}</span>
                                                <p className="text-[16px] text-slate-400 font-sans leading-relaxed uppercase">"{v}"</p>
                                            </div>
                                        )) : <div className="h-full flex items-center justify-center text-slate-800 text-xs font-black uppercase tracking-[0.4em] opacity-30 text-center italic">Initialize_Node_Signal</div>}
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* PERSONA DETAIL VIEW REMAINS IDENTICAL TO v33.3 */}
                    </div>
                )}
            </main>

            {/* COLUMN 3: COMMAND */}
            <aside className="w-[420px] bg-[#0b0c0e] p-12 flex flex-col gap-14 border-l border-slate-800 overflow-y-auto shadow-2xl shrink-0">
                <div className="space-y-8">
                    <h3 className="text-teal-400 text-xs font-black uppercase tracking-[0.3em] flex items-center gap-3 border-b border-slate-900 pb-4"><UserPlus size={20}/> Spawn_Identity</h3>
                    <input className="w-full bg-[#1c1f23] p-5 border border-slate-800 text-sm text-white font-bold outline-none uppercase" placeholder="NAME" value={newP.name} onChange={(e) => setNewP({...newP, name: e.target.value})} />
                    <div className="grid grid-cols-2 gap-4">
                        <select className="bg-[#1c1f23] p-5 border border-slate-800 text-xs text-teal-500 font-black outline-none" value={newP.gender} onChange={(e) => setNewP({...newP, gender: e.target.value})}>{CONFIG.GENDERS.map(g => <option key={g} value={g}>{g}</option>)}</select>
                        <input className="bg-[#1c1f23] p-5 border border-slate-800 text-xs text-slate-500 outline-none uppercase" placeholder="ROLE" value={newP.role} onChange={(e) => setNewP({...newP, role: e.target.value})} />
                    </div>
                    <div className="relative">
                        <input className="w-full bg-[#1c1f23] p-5 border border-slate-800 text-xs text-slate-500 outline-none uppercase pr-14" placeholder="CORE_TRAUMA" value={newP.trauma} onChange={(e) => setNewP({...newP, trauma: e.target.value})} />
                        <button onClick={() => setNewP({...newP, trauma: CONFIG.TRAUMAS[Math.floor(Math.random() * CONFIG.TRAUMAS.length)]})} className="absolute right-5 top-4 text-slate-700 hover:text-teal-500 transition-all"><Dice5 size={24}/></button>
                    </div>
                    <button onClick={() => runAction('/persona/create', newP)} disabled={loading || !newP.name} className="w-full py-5 bg-teal-500 text-black text-xs font-black uppercase shadow-2xl hover:bg-white transition-all">COMMIT_DNA</button>
                </div>

                <div className="space-y-8 border-t border-slate-900 pt-14">
                    <h3 className="text-teal-400 text-xs font-black uppercase tracking-[0.3em] flex items-center gap-3 border-b border-slate-900 pb-4"><Database size={20}/> Establish_Season</h3>
                    <input className="w-full bg-[#1c1f23] p-5 border border-slate-800 text-sm text-white font-bold outline-none uppercase" placeholder="TOPIC" value={newS.topic} onChange={(e) => setNewS({...newS, topic: e.target.value})} />
                    <select className="w-full bg-[#1c1f23] p-5 border border-slate-800 text-xs text-teal-400 font-bold" value={newS.relationship} onChange={(e) => setNewS({...newS, relationship: e.target.value})}>{CONFIG.DYNAMICS.map(d => <option key={d} value={d}>{d}</option>)}</select>
                    <div className="grid grid-cols-2 gap-3 max-h-[220px] overflow-y-auto p-4 border border-slate-800 rounded bg-black/20">
                        {personas.map(p => (
                            <button key={p.id} onClick={() => {
                                const ids = newS.host_ids.includes(p.id) ? newS.host_ids.filter(id => id !== p.id) : [...newS.host_ids, p.id];
                                setNewS({...newS, host_ids: ids.slice(0, 2)});
                            }} className={`p-4 text-[10px] font-black border uppercase rounded truncate transition-all ${newS.host_ids.includes(p.id) ? 'border-teal-500 bg-teal-500/10 text-teal-400 shadow-xl' : 'border-slate-800 text-slate-600'}`}>{p.name}</button>
                        ))}
                    </div>
                    <div className="space-y-4">
                        <p className="text-[10px] text-slate-600 uppercase font-black flex justify-between tracking-widest italic">Node_Length <span>{newS.episodes_count} EPISODES</span></p>
                        <input type="range" min="1" max="24" step="1" className="w-full accent-teal-500 h-2 bg-slate-800 rounded-lg appearance-none" value={newS.episodes_count} onChange={(e) => setNewS({...newS, episodes_count: e.target.value})} />
                    </div>
                    <button onClick={() => runAction('/season/reconcile', newS)} disabled={loading || newS.host_ids.length !== 2} className="w-full py-6 bg-teal-500 text-black text-xs font-black uppercase shadow-2xl hover:bg-white transition-all">ESTABLISH_SIGNAL</button>
                </div>
            </aside>
        </div>
    );
};

export default App;
