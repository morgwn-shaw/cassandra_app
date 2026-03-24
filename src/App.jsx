import React, { useState, useEffect } from 'react';
import { Zap, Activity, Trash2, Database, Quote, Brain, Loader2, Fingerprint, ScrollText, ShieldCheck, Dice5, UserPlus, ShieldAlert, ChevronRight } from 'lucide-react';

const API_BASE = "https://shadow-cassandrafiles.pythonanywhere.com/api/v2";

const App = () => {
    const [activeTab, setActiveTab] = useState('season');
    const [activeItem, setActiveItem] = useState(null);
    const [activeBrief, setActiveBrief] = useState(null);
    const [seasons, setSeasons] = useState([]);
    const [personas, setPersonas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ stage: 'IDLE', history: [], active_engine: 'Initializing...' });

    const [newP, setNewP] = useState({ name: '', role: 'Investigator', trauma: '', gender: 'Male' });
    const [newS, setNewS] = useState({ topic: '', relationship: 'Strategic Tension', host_ids: [], episodes_count: 10 });

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
        } catch (e) { window.alert(`Signal Lost: ${e.message}`); }
        finally { setLoading(false); }
    };

    const getBrief = async (seasonId, idx) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/showrunner/brief`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ season_id: seasonId, node_index: idx }) });
            setActiveBrief(await res.json());
        } finally { setLoading(false); }
    };

    const currentList = activeTab === 'season' ? (seasons || []) : (personas || []);

    return (
        <div className="h-screen w-screen font-mono flex overflow-hidden bg-[#0d0f11] text-slate-400">
            
            {/* COLUMN 1: TELEMETRY */}
            <aside className="w-[300px] border-r border-slate-800 bg-black/40 p-6 flex flex-col gap-6 shadow-2xl shrink-0">
                <div className="flex flex-col gap-1 border-b border-slate-900 pb-4">
                    <div className="flex items-center gap-2 text-teal-500 font-black text-[10px] uppercase tracking-widest"><Zap size={14} /> Telemetry_v34.0</div>
                    <div className="text-[8px] text-slate-600 uppercase font-bold">{status.active_engine}</div>
                </div>
                <div className="flex-1 overflow-y-auto space-y-2 opacity-30 text-[9px] uppercase italic">
                    {(status?.history || []).map((log, i) => <div key={i} className="border-l border-slate-800 pl-3">{log}</div>)}
                </div>
                <button onClick={() => runAction('/purge', {})} className="p-3 bg-red-950/20 border border-red-900/30 text-red-500 text-[9px] font-black uppercase flex items-center justify-center gap-2 hover:bg-red-600 hover:text-white transition-all">
                    <ShieldAlert size={14}/> Nuclear_Purge
                </button>
            </aside>

            {/* COLUMN 2: WORKSPACE */}
            <section className="flex-1 flex flex-col p-10 overflow-y-auto relative bg-[#121416] min-w-[800px]">
                {loading && (
                    <div className="absolute inset-0 bg-black/80 z-[100] flex flex-col items-center justify-center backdrop-blur-md">
                        <Loader2 className="w-12 h-12 text-teal-500 animate-spin mb-4" />
                        <p className="text-teal-400 text-[10px] font-black uppercase tracking-[0.5em] animate-pulse italic">Synchronizing_Grounded_Apex...</p>
                    </div>
                )}

                <div className="flex gap-4 mb-10 border-b border-slate-800 pb-6">
                    <button onClick={() => {setActiveItem(null); setActiveTab('season');}} className={`px-10 py-3 text-[10px] font-black transition-all ${activeTab === 'season' && !activeItem ? 'bg-teal-500 text-black shadow-lg shadow-teal-500/20' : 'bg-slate-800 text-slate-500'}`}>SEASONS</button>
                    <button onClick={() => {setActiveItem(null); setActiveTab('persona');}} className={`px-10 py-3 text-[10px] font-black transition-all ${activeTab === 'persona' && !activeItem ? 'bg-teal-500 text-black shadow-lg shadow-teal-500/20' : 'bg-slate-800 text-slate-500'}`}>DNA_VAULT</button>
                </div>

                {!activeItem ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in">
                        {currentList.map((item, i) => (
                            <div key={i} className="bg-[#1c1f23] border border-slate-800 p-8 rounded cursor-pointer hover:border-teal-500/50 transition-all flex gap-6 items-center shadow-2xl group" onClick={() => setActiveItem(item)}>
                                <div className="w-16 h-16 rounded bg-slate-900 overflow-hidden border border-slate-800 shrink-0">
                                    {item?.portrait ? <img src={item.portrait} className="w-full h-full object-cover grayscale group-hover:grayscale-0" alt="P" onError={(e) => e.target.style.display='none'}/> : <Fingerprint className="m-4 text-slate-700" size={32}/>}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-white font-black uppercase text-base italic tracking-tighter truncate">{item?.title || item?.name || "Unidentified_Signal"}</h4>
                                    <p className="text-[10px] text-teal-500 uppercase font-black opacity-60 truncate">{item?.relationship || item?.role || "Pending_DNA"}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-10">
                        <div className="flex justify-between items-end border-b border-slate-800 pb-8">
                            <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter">{activeItem?.title || activeItem?.name}</h2>
                            <button onClick={() => {setActiveItem(null); setActiveBrief(null);}} className="bg-slate-800 text-white px-8 py-3 text-[10px] font-black border border-slate-700 hover:bg-teal-500 hover:text-black transition-all">RETURN</button>
                        </div>

                        {activeTab === 'season' && (
                            <div className="flex flex-col gap-10">
                                {/* FULL WIDTH ARC SUMMARY */}
                                <div className="bg-teal-950/10 p-10 border border-teal-900/30 rounded-xl shadow-2xl">
                                    <h4 className="text-teal-400 text-[10px] font-black uppercase mb-4 flex items-center gap-2 italic tracking-[0.2em]"><ScrollText size={18}/> Arc_Summary</h4>
                                    <p className="text-[16px] text-slate-300 font-sans leading-relaxed uppercase selection:bg-teal-500/30">{activeItem?.summary}</p>
                                </div>

                                {/* SPLIT NODES / BRIEF */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
                                    <div className="space-y-4">
                                        <h4 className="text-teal-500 text-[10px] font-black uppercase italic border-b border-slate-800 pb-2">Narrative_Nodes</h4>
                                        {(activeItem?.episodes || []).map((ep, idx) => (
                                            <div key={idx} className="p-6 bg-[#1c1f23] border border-slate-800 group hover:border-teal-500 transition-all flex flex-col gap-3 shadow-xl">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[9px] text-teal-500 font-black">ACT {ep?.act}</span>
                                                    <button onClick={() => getBrief(activeItem.id, idx)} className="px-4 py-1.5 bg-slate-800 text-teal-500 text-[9px] font-black uppercase border border-slate-700 hover:bg-teal-500 hover:text-black transition-all">Run_Brief</button>
                                                </div>
                                                <h4 className="text-white font-black text-lg uppercase italic tracking-tighter">{ep?.title}</h4>
                                                <p className="text-[10px] text-slate-500 uppercase italic">{ep?.topic_summary}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="bg-black/40 border border-slate-800 rounded-xl p-8 h-[700px] overflow-y-auto shadow-2xl">
                                        <h4 className="text-teal-500 text-[10px] font-black uppercase mb-6 border-b border-slate-900 pb-4 flex items-center gap-2"><ShieldCheck size={16}/> Node_Briefing</h4>
                                        {activeBrief ? Object.entries(activeBrief?.acts || activeBrief || {}).map(([k, v], i) => (
                                            <div key={i} className="mb-8 animate-in slide-in-from-right-2">
                                                <span className="text-[8px] text-teal-400 font-black uppercase mb-2 block opacity-40">{k.replace(/_/g, ' ')}</span>
                                                <p className="text-[12px] text-slate-400 font-sans leading-relaxed uppercase">"{v}"</p>
                                            </div>
                                        )) : <div className="h-full flex items-center justify-center text-slate-800 text-[10px] font-black uppercase tracking-widest opacity-20">Initialize_Signal</div>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'persona' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                <div className="bg-black/40 p-10 border border-slate-800 rounded h-[600px] overflow-y-auto shadow-2xl">
                                    <h4 className="text-teal-500 text-[10px] font-black uppercase mb-6 italic border-b border-slate-800 pb-2">Forensic Dossier</h4>
                                    <p className="text-[14px] text-slate-400 font-sans leading-relaxed whitespace-pre-wrap uppercase italic">"{activeItem?.archive?.vocal_intro}"</p>
                                    <hr className="my-6 border-slate-800 opacity-20"/>
                                    <p className="text-[14px] text-slate-400 font-sans leading-relaxed whitespace-pre-wrap uppercase">{activeItem?.archive?.bio}</p>
                                </div>
                                <div className="bg-black/40 p-10 border border-slate-800 rounded h-[600px] overflow-y-auto shadow-2xl">
                                    <h4 className="text-teal-500 text-[10px] font-black uppercase mb-6 italic border-b border-slate-800 pb-2">DNA_Memories ({(activeItem?.archive?.anecdotes || []).length})</h4>
                                    {(activeItem?.archive?.anecdotes || []).map((a, i) => <p key={i} className="p-4 bg-white/5 border border-white/5 text-[10px] text-slate-500 italic mb-3 uppercase leading-relaxed hover:text-white transition-all">"{a}"</p>)}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </section>

            {/* COLUMN 3: COMMAND (RIGHT) */}
            <aside className="w-[380px] bg-[#0b0c0e] p-10 flex flex-col gap-12 border-l border-slate-800 overflow-y-auto shadow-2xl shrink-0">
                <div className="space-y-6">
                    <h3 className="text-teal-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border-b border-slate-900 pb-2"><UserPlus size={16}/> Identity_Spawn</h3>
                    <input className="w-full bg-[#1c1f23] p-4 border border-slate-800 text-[11px] text-white font-bold outline-none uppercase" placeholder="NAME" value={newP.name} onChange={(e) => setNewP({...newP, name: e.target.value})} />
                    <div className="grid grid-cols-2 gap-2">
                        <select className="bg-[#1c1f23] p-4 border border-slate-800 text-[10px] text-teal-500 font-black outline-none" value={newP.gender} onChange={(e) => setNewP({...newP, gender: e.target.value})}>
                            {["Male", "Female", "Non-Binary", "Gender-Fluid"].map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                        <input className="bg-[#1c1f23] p-4 border border-slate-800 text-[10px] text-slate-500 outline-none uppercase" placeholder="ROLE" value={newP.role} onChange={(e) => setNewP({...newP, role: e.target.value})} />
                    </div>
                    <button onClick={() => runAction('/persona/create', newP)} disabled={loading || !newP.name} className="w-full py-4 bg-teal-500 text-black text-[11px] font-black uppercase shadow-2xl hover:bg-white transition-all disabled:opacity-20">COMMIT_DNA</button>
                </div>

                <div className="space-y-6">
                    <h3 className="text-teal-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border-b border-slate-900 pb-2"><Database size={16}/> Establish_Season</h3>
                    <input className="w-full bg-[#1c1f23] p-4 border border-slate-800 text-[12px] text-white font-bold outline-none uppercase" placeholder="TOPIC" value={newS.topic} onChange={(e) => setNewS({...newS, topic: e.target.value})} />
                    <div className="grid grid-cols-2 gap-2 max-h-[180px] overflow-y-auto p-2 border border-slate-800 rounded bg-black/20">
                        {personas.map(p => (
                            <button key={p.id} onClick={() => {
                                const ids = newS.host_ids.includes(p.id) ? newS.host_ids.filter(id => id !== p.id) : [...newS.host_ids, p.id];
                                setNewS({...newS, host_ids: ids.slice(0, 2)});
                            }} className={`p-3 text-[8px] font-black border uppercase rounded truncate transition-all ${newS.host_ids.includes(p.id) ? 'border-teal-500 bg-teal-500/10 text-teal-400 shadow-xl' : 'border-slate-800 text-slate-600'}`}>{p.name}</button>
                        ))}
                    </div>
                    <button onClick={() => runAction('/season/reconcile', newS)} disabled={loading || newS.host_ids.length !== 2} className="w-full py-6 bg-teal-500 text-black text-[11px] font-black uppercase shadow-2xl hover:bg-white transition-all disabled:opacity-20">ESTABLISH_SIGNAL</button>
                </div>
            </aside>
        </div>
    );
};

export default App;
