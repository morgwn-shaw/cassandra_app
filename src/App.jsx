import React, { useState, useEffect } from 'react';
import { Zap, Activity, Trash2, Database, Quote, Brain, Loader2, Fingerprint, ChevronRight, ScrollText, ShieldCheck, Dice5, UserPlus } from 'lucide-react';

const API_BASE = "https://shadow-cassandrafiles.pythonanywhere.com/api/v2";

const CONFIG = {
    GENDERS: ["Male", "Female", "Non-Binary", "Random"],
    DYNAMICS: ["UST - High Friction", "Strategic Tension", "Grudging Mutual Respect", "Bitter Rivals", "Frenemies", "Shared Secret", "Unresolved Sexual Tension"],
    TRAUMAS: ["Witnessed server farm bleed-out.", "Neural-link mentor betrayal.", "Exposed data laundering ring.", "Escaped digital cult.", "Wrongly flagged as domestic threat."]
};

const App = () => {
    const [viewMode, setViewMode] = useState('god'); 
    const [activeTab, setActiveTab] = useState('season');
    const [activeItem, setActiveItem] = useState(null);
    const [activeBrief, setActiveBrief] = useState(null);
    const [loading, setLoading] = useState(false);
    const [briefLoading, setBriefLoading] = useState(false);
    const [status, setStatus] = useState({ stage: 'IDLE', history: [] });

    const [seasons, setSeasons] = useState([]);
    const [personas, setPersonas] = useState([]);
    const [newP, setNewP] = useState({ name: '', role: 'Forensic Investigator', trauma: CONFIG.TRAUMAS[0], gender: 'Male' });
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

    const runAction = async (endpoint, body) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}${endpoint}`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body) });
            if (!res.ok) throw new Error(await res.text());
            await refreshData();
        } catch (e) { window.alert(`ACTION_FAILED: ${e.message}`); }
        finally { setLoading(false); }
    };

    const getBrief = async (seasonId, idx) => {
        setActiveBrief(null);
        setBriefLoading(true);
        try {
            const res = await fetch(`${API_BASE}/showrunner/brief`, { 
                method: 'POST', 
                headers: {'Content-Type': 'application/json'}, 
                body: JSON.stringify({ season_id: seasonId, node_index: idx }) 
            });
            if (!res.ok) throw new Error(await res.text());
            const data = await res.json();
            setActiveBrief(data);
        } catch (e) { window.alert(`SHOWRUNNER_FAILED: ${e.message}`); }
        finally { setBriefLoading(false); }
    };

    return (
        <div className="h-screen w-screen font-mono flex overflow-hidden bg-[#0d0f11] text-slate-400">
            {loading && (
                <div className="fixed inset-0 bg-black/95 z-[100] flex flex-col items-center justify-center backdrop-blur-xl">
                    <Loader2 className="w-16 h-16 text-teal-500 animate-spin mb-4" />
                    <p className="text-teal-400 text-xs font-black uppercase tracking-[0.8em] animate-pulse">Production_Handshake_In_Progress</p>
                </div>
            )}

            {/* PANE 1: TELEMETRY */}
            {viewMode === 'god' && (
                <section className="w-[320px] border-r border-slate-800 bg-black/40 p-6 flex flex-col gap-6 shadow-2xl overflow-hidden">
                    <div className="flex items-center gap-2 text-teal-500 font-black text-[10px] mb-8 uppercase tracking-[0.3em] border-b border-slate-900 pb-4"><Zap size={14} /> Telemetry_v31.0</div>
                    <div className="flex-1 overflow-y-auto space-y-2 opacity-30 text-[9px]">
                        {(status.history || []).map((log, i) => (
                            <div key={i} className="border-l border-slate-800 pl-3 py-1 font-bold uppercase">{log}</div>
                        ))}
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
                    <button onClick={() => {setActiveItem(null); setActiveTab('season');}} className={`px-10 py-3 text-[10px] font-black ${activeTab === 'season' && !activeItem ? 'bg-teal-500 text-black shadow-lg' : 'bg-slate-800 text-slate-500'}`}>SEASONS</button>
                    <button onClick={() => {setActiveItem(null); setActiveTab('persona');}} className={`px-10 py-3 text-[10px] font-black ${activeTab === 'persona' && !activeItem ? 'bg-teal-500 text-black shadow-lg' : 'bg-slate-800 text-slate-500'}`}>PERSONAS</button>
                </div>

                {!activeItem ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in">
                        {(activeTab === 'season' ? seasons : personas).map((item, i) => (
                            <div key={i} className="bg-[#1c1f23] border border-slate-800 p-8 rounded-lg cursor-pointer hover:border-teal-500 transition-all flex gap-6 items-center relative group shadow-2xl" onClick={() => setActiveItem(item)}>
                                {item.portrait ? <img src={item.portrait} className="w-16 h-16 rounded grayscale group-hover:grayscale-0 border border-slate-800 transition-all shadow-xl" alt="P" /> : <div className="w-16 h-16 rounded bg-slate-900 flex items-center justify-center border border-slate-800"><Fingerprint size={28}/></div>}
                                <div>
                                    <h4 className="text-white font-black uppercase text-base italic tracking-tighter">{item.title || item.name}</h4>
                                    <p className="text-[10px] text-teal-500 uppercase font-black opacity-60 truncate">{item.relationship || item.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-10">
                        <div className="flex justify-between items-end border-b border-slate-800 pb-8">
                            <h2 className="text-6xl font-black text-white uppercase italic tracking-tighter">{activeItem.title || activeItem.name}</h2>
                            <button onClick={() => {setActiveItem(null); setActiveBrief(null);}} className="bg-slate-800 text-white px-8 py-3 text-[10px] font-black hover:bg-white hover:text-black transition-all">CLOSE</button>
                        </div>

                        {activeTab === 'season' && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                                <div className="space-y-6">
                                    <div className="bg-teal-950/10 p-6 border border-teal-900/30 rounded shadow-2xl">
                                        <h4 className="text-teal-400 text-[10px] font-black uppercase mb-4 flex items-center gap-2 italic"><ScrollText size={14}/> 3_Act_Summary</h4>
                                        <p className="text-[11px] text-slate-400 font-sans leading-relaxed uppercase">{activeItem.summary}</p>
                                    </div>
                                    <div className="space-y-4">
                                        <h4 className="text-teal-500 text-[10px] font-black uppercase italic border-b border-slate-800 pb-2">Narrative_Nodes</h4>
                                        {(activeItem.episodes || []).map((ep, idx) => (
                                            <div key={idx} className="p-6 bg-[#1c1f23] border border-slate-800 group hover:border-teal-500 transition-all flex flex-col gap-3 shadow-xl">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[9px] text-teal-500 font-black tracking-widest">ACT {ep.act}</span>
                                                    <button onClick={() => getBrief(activeItem.id, idx)} className="px-4 py-1.5 bg-slate-800 text-teal-500 text-[9px] font-black uppercase border border-slate-700 hover:bg-teal-500 hover:text-black transition-all">Run_Node</button>
                                                </div>
                                                <h4 className="text-white font-black text-base uppercase italic tracking-tighter">{ep.title}</h4>
                                                <p className="text-[9px] text-slate-600 uppercase leading-tight italic">{ep.topic_summary}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="lg:col-span-2 bg-black/40 border border-slate-800 rounded p-10 h-[800px] overflow-y-auto shadow-2xl relative">
                                    <h4 className="text-teal-500 text-[11px] font-black uppercase mb-8 border-b border-slate-900 pb-4 flex items-center gap-3"><ShieldCheck size={18}/> 6_Act_Grounded_Brief</h4>
                                    {briefLoading && (
                                        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center backdrop-blur-sm z-10">
                                            <Loader2 className="w-8 h-8 text-teal-500 animate-spin mb-2" />
                                            <p className="text-teal-400 text-[9px] font-black uppercase animate-pulse italic">Fact_Checking_In_Progress...</p>
                                        </div>
                                    )}
                                    {activeBrief ? Object.entries(activeBrief.acts || activeBrief).map(([k, v], i) => (
                                        <div key={i} className="mb-10 animate-in slide-in-from-right-4">
                                            <span className="text-[8px] text-teal-400 font-black uppercase mb-3 block opacity-60 tracking-[0.2em]">{k.replace(/_/g, ' ')}</span>
                                            <p className="text-[13px] text-slate-400 font-sans leading-relaxed uppercase">"{typeof v === 'string' ? v : JSON.stringify(v)}"</p>
                                        </div>
                                    )) : <div className="h-full flex items-center justify-center text-slate-800 text-[9px] font-black uppercase tracking-widest italic opacity-20">Initialize_Signal</div>}
                                </div>
                            </div>
                        )}

                        {activeTab === 'persona' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                <div className="bg-black/40 p-10 border border-slate-800 rounded shadow-2xl h-[600px] overflow-y-auto custom-scrollbar">
                                    <h4 className="text-teal-500 text-[10px] font-black uppercase mb-6 italic border-b border-slate-800 pb-2 flex items-center gap-2"><Quote size={14}/> Forensic Dossier</h4>
                                    <p className="text-[13px] text-slate-400 font-sans leading-relaxed whitespace-pre-wrap uppercase italic">"{activeItem.archive?.vocal_intro}"</p>
                                    <hr className="my-6 border-slate-800"/>
                                    <p className="text-[14px] text-slate-400 font-sans leading-relaxed whitespace-pre-wrap uppercase">{activeItem.archive?.bio}</p>
                                </div>
                                <div className="bg-black/40 p-10 border border-slate-800 rounded shadow-2xl h-[600px] overflow-y-auto custom-scrollbar">
                                    <h4 className="text-teal-500 text-[10px] font-black uppercase mb-6 italic border-b border-slate-800 pb-2">DNA_Anecdotes ({activeItem.archive?.anecdotes?.length})</h4>
                                    {(activeItem.archive?.anecdotes || []).map((a, i) => <p key={i} className="p-4 bg-white/5 border border-white/5 text-[10px] text-slate-500 italic mb-3 uppercase leading-relaxed">"{a}"</p>)}
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
                        <input className="w-full bg-[#1c1f23] p-4 border border-slate-800 text-[12px] text-white font-bold outline-none focus:border-teal-500 uppercase" placeholder="IDENTITY_NAME" value={newP.name} onChange={(e) => setNewP({...newP, name: e.target.value})} />
                        <div className="grid grid-cols-2 gap-2">
                            <select className="bg-[#1c1f23] p-4 border border-slate-800 text-[10px] text-teal-500 font-black outline-none" value={newP.gender} onChange={(e) => setNewP({...newP, gender: e.target.value})}>{CONFIG.GENDERS.map(g => <option key={g} value={g}>{g}</option>)}</select>
                            <input className="bg-[#1c1f23] p-4 border border-slate-800 text-[10px] text-slate-500 outline-none uppercase" placeholder="ROLE" value={newP.role} onChange={(e) => setNewP({...newP, role: e.target.value})} />
                        </div>
                        <div className="relative">
                            <input className="w-full bg-[#1c1f23] p-4 border border-slate-800 text-[10px] text-slate-500 outline-none uppercase pr-12" placeholder="CORE_TRAUMA" value={newP.trauma} onChange={(e) => setNewP({...newP, trauma: e.target.value})} />
                            <button onClick={() => setNewP({...newP, trauma: CONFIG.TRAUMAS[Math.floor(Math.random() * CONFIG.TRAUMAS.length)]})} className="absolute right-4 top-3 text-slate-700 hover:text-teal-500 transition-all"><Dice5 size={20}/></button>
                        </div>
                        <button onClick={() => runAction('/persona/create', newP)} disabled={loading} className="w-full py-4 bg-teal-500 text-black text-[11px] font-black uppercase shadow-2xl hover:bg-white transition-all">COMMIT_DNA</button>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-teal-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border-b border-slate-900 pb-2"><Database size={16}/> Establish_Season</h3>
                        <input className="w-full bg-[#1c1f23] p-4 border border-slate-800 text-[12px] text-white font-bold outline-none focus:border-teal-500 uppercase" placeholder="NARRATIVE_TOPIC" value={newS.topic} onChange={(e) => setNewS({...newS, topic: e.target.value})} />
                        <select className="w-full bg-[#1c1f23] p-4 border border-slate-800 text-[10px] text-teal-400 font-bold outline-none" value={newS.relationship} onChange={(e) => setNewS({...newS, relationship: e.target.value})}>{CONFIG.DYNAMICS.map(d => <option key={d} value={d}>{d}</option>)}</select>
                        <div className="grid grid-cols-2 gap-2">{personas.map(p => <button key={p.id} onClick={() => { const ids = newS.host_ids.includes(p.id) ? newS.host_ids.filter(id => id !== p.id) : [...newS.host_ids, p.id]; setNewS({...newS, host_ids: ids.slice(0, 2)}); }} className={`p-3 text-[9px] font-black border uppercase rounded truncate transition-all ${newS.host_ids.includes(p.id) ? 'border-teal-500 bg-teal-500/10 text-teal-400 shadow-[0_0_20px_#2dd4bf20]' : 'border-slate-800 text-slate-600'}`}>{p.name}</button>)}</div>
                        <div className="space-y-2"><p className="text-[9px] text-slate-600 uppercase font-black flex justify-between tracking-widest">Node_Length <span>{newS.episodes_count}</span></p><input type="range" min="4" max="24" step="2" className="w-full accent-teal-500" value={newS.episodes_count} onChange={(e) => setNewS({...newS, episodes_count: e.target.value})} /></div>
                        <button onClick={() => runAction('/season/reconcile', newS)} disabled={loading || newS.host_ids.length !== 2} className="w-full py-6 bg-teal-500 text-black text-[11px] font-black uppercase shadow-2xl hover:bg-white transition-all">ESTABLISH_SIGNAL</button>
                    </div>
                </section>
            )}
        </div>
    );
};

export default App;
