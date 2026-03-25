import React, { useState, useEffect } from 'react';
import { Zap, Trash2, Database, Quote, Loader2, Fingerprint, ScrollText, ShieldCheck, Dice5, UserPlus, ShieldAlert, PlayCircle, MessageSquare, History, FastForward } from 'lucide-react';

const API_BASE = "https://shadow-cassandrafiles.pythonanywhere.com/api/v2";

const CONFIG = {
    GENDERS: ["Male", "Female", "Non-Binary", "Gender-Fluid"],
    DYNAMICS: ["UST - High Friction", "Strategic Tension", "Buddy Cop", "Master / Apprentice", "Bitter Rivals", "Frenemies", "Mentor / Mentee", "Unresolved Sexual Tension", "Shared Trauma Bond"],
    TRAUMAS: ["Witnessed server farm bleed-out.", "Neural-link betrayal.", "Identity wiped by ghost protocol.", "Exposed data laundering ring.", "Escaped digital cult.", "False flagship conviction."]
};

const App = () => {
    const [viewMode, setViewMode] = useState('god'); 
    const [activeTab, setActiveTab] = useState('season');
    const [activeItem, setActiveItem] = useState(null);
    const [activeBrief, setActiveBrief] = useState(null);
    const [seasons, setSeasons] = useState([]);
    const [personas, setPersonas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ stage: 'IDLE', active_engine: 'Hunting...' });

    const [newP, setNewP] = useState({ name: '', role: 'Investigator', trauma: CONFIG.TRAUMAS[0], gender: 'Male' });
    const [newS, setNewS] = useState({ topic: '', relationship: CONFIG.DYNAMICS[0], host_ids: [], episodes_count: 10 });

    useEffect(() => {
        refreshData();
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`${API_BASE}/status`);
                if (res.ok) setStatus(await res.json());
            } catch (e) {}
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const refreshData = async () => {
        try {
            const sRes = await fetch(`${API_BASE}/season/list`);
            if (sRes.ok) setSeasons(await sRes.json());
            const pRes = await fetch(`${API_BASE}/persona/list`);
            if (pRes.ok) setPersonas(await pRes.json());
        } catch (e) {}
    };

    const runAction = async (endpoint, body) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}${endpoint}`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body) });
            if (!res.ok) throw new Error("PA Server Timeout - Request too heavy.");
            const data = await res.json();
            if (data.error) window.alert(`LOG: ${data.error}`);
            await refreshData();
        } catch (e) { window.alert(`CRITICAL: ${e.message}`); }
        finally { setLoading(false); }
    };

    const getBrief = async (seasonId, idx) => {
        setLoading(true); setActiveBrief(null);
        try {
            const res = await fetch(`${API_BASE}/showrunner/brief`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ season_id: seasonId, node_index: idx }) });
            if (res.ok) setActiveBrief(await res.json());
        } finally { setLoading(false); }
    };

    const deleteItem = async (e, type, id) => {
        e.stopPropagation();
        if (!window.confirm("Purge?")) return;
        await fetch(`${API_BASE}/delete/${type}/${id}`, { method: 'DELETE' });
        refreshData();
    };

    const listData = activeTab === 'season' ? (seasons || []) : (personas || []);

    return (
        <div className="h-screen w-screen font-mono flex overflow-hidden bg-[#0a0c0e] text-slate-400 select-none">
            
            {/* COLUMN 1: TELEMETRY */}
            <aside className="w-[320px] border-r border-slate-800 bg-black/60 p-8 flex flex-col gap-6 shadow-2xl shrink-0">
                <div className="border-b border-slate-900 pb-6">
                    <div className="flex items-center gap-3 text-teal-500 font-black text-sm uppercase tracking-widest"><Zap size={16} /> Telemetry_v47.0</div>
                    <div className="text-[10px] text-teal-900 uppercase font-black italic mt-2">{status?.active_engine}</div>
                </div>
                <div className="mt-auto space-y-4">
                    <div className="flex border border-slate-800 rounded overflow-hidden">
                        <button onClick={() => setViewMode('god')} className={`flex-1 py-2 text-[10px] font-black ${viewMode === 'god' ? 'bg-teal-500 text-black' : 'bg-slate-900'}`}>GOD</button>
                        <button onClick={() => setViewMode('user')} className={`flex-1 py-2 text-[10px] font-black ${viewMode === 'user' ? 'bg-teal-500 text-black' : 'bg-slate-900'}`}>USER</button>
                    </div>
                    <button onClick={() => runAction('/purge', {})} className="w-full p-4 bg-red-950/20 border border-red-900/30 text-red-500 text-[10px] font-black uppercase hover:bg-red-600 hover:text-white transition-all">Nuclear_Reset</button>
                </div>
            </aside>

            {/* COLUMN 2: WORKSPACE */}
            <main className="flex-1 flex flex-col p-12 overflow-y-auto relative bg-[#121416]">
                {loading && (
                    <div className="absolute inset-0 bg-black/95 z-[100] flex flex-col items-center justify-center backdrop-blur-md">
                        <Loader2 className="w-16 h-16 text-teal-500 animate-spin mb-4" />
                        <p className="text-teal-400 text-xs font-black uppercase tracking-[1em] animate-pulse italic">Establishing_Bypass_Signal...</p>
                    </div>
                )}

                <div className="flex gap-4 mb-12 border-b border-slate-800 pb-8">
                    <button onClick={() => {setActiveItem(null); setActiveTab('season');}} className={`px-12 py-4 text-[11px] font-black transition-all ${activeTab === 'season' && !activeItem ? 'bg-teal-500 text-black shadow-[0_0_20px_#2dd4bf40]' : 'bg-slate-800'}`}>SEASONS</button>
                    <button onClick={() => {setActiveItem(null); setActiveTab('persona');}} className={`px-12 py-4 text-[11px] font-black transition-all ${activeTab === 'persona' && !activeItem ? 'bg-teal-500 text-black shadow-[0_0_20px_#2dd4bf40]' : 'bg-slate-800'}`}>DNA_VAULT</button>
                </div>

                {!activeItem ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in">
                        {listData.map((item, i) => (
                            <div key={i} className="bg-[#1c1f23] border border-slate-800 p-10 rounded-2xl cursor-pointer hover:border-teal-500 transition-all flex gap-8 items-center shadow-xl group relative" onClick={() => setActiveItem(item)}>
                                {viewMode === 'god' && <button onClick={(e) => deleteItem(e, activeTab, item.id)} className="absolute top-6 right-6 text-red-900 hover:text-red-500"><Trash2 size={18}/></button>}
                                <div className="w-24 h-24 rounded-2xl bg-slate-900 overflow-hidden border border-slate-800 shrink-0">
                                    {item?.portrait ? <img src={item.portrait} className="w-full h-full object-cover grayscale group-hover:grayscale-0" alt="DNA" /> : <Fingerprint className="m-8 text-slate-700" size={32}/>}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-white font-black uppercase text-2xl italic truncate">{item?.title || item?.name}</h4>
                                    <p className="text-[10px] text-teal-500 uppercase font-black opacity-60 mt-1">{item?.relationship || item?.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="animate-in slide-in-from-bottom-8 duration-500 space-y-12">
                        <div className="flex justify-between items-end border-b border-slate-800 pb-12">
                            <h2 className="text-7xl font-black text-white uppercase italic tracking-tighter leading-none">{activeItem?.title || activeItem?.name}</h2>
                            <button onClick={() => setActiveItem(null)} className="bg-teal-500 text-black px-14 py-5 text-xs font-black shadow-2xl active:scale-95">CLOSE</button>
                        </div>

                        {activeTab === 'season' && (
                            <div className="flex flex-col gap-12">
                                <div className="bg-teal-950/10 p-12 border border-teal-900/30 rounded-3xl shadow-2xl">
                                    <h4 className="text-teal-400 text-[11px] font-black uppercase mb-6 flex items-center gap-3 italic tracking-[0.3em]"><ScrollText size={20}/> Grounded_Investigation</h4>
                                    <p className="text-[19px] text-slate-300 font-sans leading-relaxed uppercase">{activeItem?.summary}</p>
                                </div>

                                {viewMode === 'god' && (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                        <div className="bg-[#1c1f23] p-10 border border-slate-800 rounded-3xl">
                                            <h4 className="text-teal-500 text-[11px] font-black uppercase mb-6 flex items-center gap-2 italic"><History size={18}/> 20_Act_Shared_Lore</h4>
                                            <div className="space-y-4 h-[400px] overflow-y-auto custom-scrollbar pr-4">
                                                {(activeItem?.lore?.shared_anecdotes || []).map((a, i) => <p key={i} className="text-[12px] text-slate-500 italic uppercase border-l-2 border-slate-900 pl-6 py-2 hover:text-white transition-all">"{a}"</p>)}
                                            </div>
                                        </div>
                                        <div className="bg-[#1c1f23] p-10 border border-slate-800 rounded-3xl">
                                            <h4 className="text-teal-400 text-[11px] font-black uppercase mb-6 flex items-center gap-2 italic"><FastForward size={18}/> Seasonal_Evolution</h4>
                                            <p className="text-[15px] text-slate-400 uppercase leading-relaxed font-sans p-4">{activeItem?.lore?.future_lore}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 border-t border-slate-900 pt-14">
                                    <div className="space-y-6">
                                        {(activeItem?.episodes || []).map((ep, idx) => (
                                            <div key={idx} className="p-8 bg-[#1c1f23] border border-slate-800 group hover:border-teal-500 transition-all flex flex-col gap-4 shadow-xl rounded-2xl">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-teal-500 text-[10px] font-black uppercase tracking-widest">NODE {ep?.act}</span>
                                                    <button onClick={() => getBrief(activeItem.id, idx)} className="px-8 py-2 bg-slate-800 text-teal-500 text-[10px] font-black uppercase border border-slate-700 hover:bg-teal-500 hover:text-black transition-all">Ground</button>
                                                </div>
                                                <h4 className="text-white font-black text-2xl uppercase italic tracking-tighter leading-none">{ep?.title}</h4>
                                                <p className="text-[13px] text-slate-500 uppercase italic leading-snug">{ep?.topic_summary}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="bg-black/60 border border-slate-800 rounded-3xl p-12 h-[900px] overflow-y-auto shadow-2xl relative">
                                        <h4 className="text-teal-500 text-[12px] font-black uppercase mb-10 border-b border-slate-900 pb-6">Production_Brief [{activeBrief?.archetype || "Awaiting_Sync"}]</h4>
                                        {activeBrief?.acts ? Object.entries(activeBrief.acts).map(([k, v], i) => (
                                            <div key={i} className="mb-14 animate-in slide-in-from-right-8">
                                                <span className="text-[11px] text-teal-400 font-black uppercase mb-5 block opacity-50 tracking-[0.4em]">{k.replace(/_/g, ' ')}</span>
                                                <p className="text-[17px] text-slate-400 font-sans leading-relaxed uppercase italic">"{v}"</p>
                                            </div>
                                        )) : <div className="h-full flex items-center justify-center text-slate-800 text-xs font-black uppercase tracking-[0.6em] opacity-20 italic">Initialize_Neural_Handshake</div>}
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* DNA DETAIL VIEW IDENTICAL TO v43.5 */}
                    </div>
                )}
            </main>

            {/* COLUMN 3: COMMAND */}
            <aside className="w-[420px] bg-[#0b0c0e] p-12 flex flex-col gap-14 border-l border-slate-800 overflow-y-auto shadow-2xl shrink-0">
                <div className="space-y-8">
                    <h3 className="text-teal-400 text-xs font-black uppercase tracking-[0.3em] flex items-center gap-3 border-b border-slate-900 pb-4"><UserPlus size={20}/> Identity_Spawn</h3>
                    <input className="w-full bg-[#1c1f23] p-6 border border-slate-800 text-sm text-white font-bold outline-none uppercase" placeholder="NAME" value={newP.name} onChange={(e) => setNewP({...newP, name: e.target.value})} />
                    <div className="grid grid-cols-2 gap-4">
                        <select className="bg-[#1c1f23] p-6 border border-slate-800 text-xs text-teal-500 font-black outline-none cursor-pointer" value={newP.gender} onChange={(e) => setNewP({...newP, gender: e.target.value})}>{CONFIG.GENDERS.map(g => <option key={g}>{g}</option>)}</select>
                        <input className="bg-[#1c1f23] p-6 border border-slate-800 text-xs text-slate-500 outline-none uppercase" placeholder="ROLE" value={newP.role} onChange={(e) => setNewP({...newP, role: e.target.value})} />
                    </div>
                    <div className="relative">
                        <input className="w-full bg-[#1c1f23] p-6 border border-slate-800 text-xs text-slate-500 outline-none uppercase pr-16" placeholder="CORE_TRAUMA" value={newP.trauma} onChange={(e) => setNewP({...newP, trauma: e.target.value})} />
                        <button onClick={() => setNewP({...newP, trauma: CONFIG.TRAUMAS[Math.floor(Math.random() * CONFIG.TRAUMAS.length)]})} className="absolute right-5 top-5 text-slate-700 hover:text-teal-500 transition-all active:rotate-180 duration-300"><Dice5 size={28}/></button>
                    </div>
                    <button onClick={() => runAction('/persona/create', newP)} disabled={loading || !newP.name} className="w-full py-6 bg-teal-500 text-black text-xs font-black uppercase shadow-2xl hover:bg-white transition-all disabled:opacity-20">COMMIT_DNA</button>
                </div>

                <div className="space-y-8 border-t border-slate-900 pt-14">
                    <h3 className="text-teal-400 text-xs font-black uppercase tracking-[0.3em] flex items-center gap-3 border-b border-slate-900 pb-4"><Database size={20}/> Establish_Season</h3>
                    <input className="w-full bg-[#1c1f23] p-6 border border-slate-800 text-sm text-white font-bold outline-none uppercase" placeholder="TOPIC" value={newS.topic} onChange={(e) => setNewS({...newS, topic: e.target.value})} />
                    <select className="w-full bg-[#1c1f23] p-6 border border-slate-800 text-xs text-teal-400 font-bold" value={newS.relationship} onChange={(e) => setNewS({...newS, relationship: e.target.value})}>{CONFIG.DYNAMICS.map(d => <option key={d}>{d}</option>)}</select>
                    <div className="grid grid-cols-2 gap-3 max-h-[220px] overflow-y-auto p-4 border border-slate-800 rounded-xl bg-black/40 custom-scrollbar">
                        {(personas || []).map(p => (
                            <button key={p.id} onClick={() => {
                                const ids = newS.host_ids.includes(p.id) ? newS.host_ids.filter(id => id !== p.id) : [...newS.host_ids, p.id];
                                setNewS({...newS, host_ids: ids.slice(0, 2)});
                            }} className={`p-4 text-[10px] font-black border uppercase rounded-xl truncate transition-all ${newS.host_ids.includes(p.id) ? 'border-teal-500 bg-teal-500/10 text-teal-400 shadow-xl' : 'border-slate-800 text-slate-600'}`}>{p.name}</button>
                        ))}
                    </div>
                    <div className="space-y-4">
                        <p className="text-[11px] text-slate-500 uppercase font-black flex justify-between tracking-widest italic">Node_Length <span>{newS.episodes_count} EPISODES</span></p>
                        <input type="range" min="1" max="24" step="1" className="w-full accent-teal-500 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer" value={newS.episodes_count} onChange={(e) => setNewS({...newS, episodes_count: e.target.value})} />
                    </div>
                    <button onClick={() => runAction('/season/reconcile', newS)} disabled={loading || newS.host_ids.length !== 2} className="w-full py-6 bg-teal-500 text-black text-xs font-black uppercase shadow-2xl hover:bg-white transition-all active:scale-95">ESTABLISH_SIGNAL</button>
                </div>
            </aside>
        </div>
    );
};

export default App;
