import React, { useState, useEffect } from 'react';
import { Zap, Trash2, Database, Quote, Loader2, Fingerprint, ScrollText, ShieldCheck, Dice5, UserPlus, ShieldAlert, PlayCircle, MessageSquare, History, FastForward } from 'lucide-react';

const API_BASE = "[https://shadow-cassandrafiles.pythonanywhere.com/api/v2](https://shadow-cassandrafiles.pythonanywhere.com/api/v2)";

const CONFIG = {
    GENDERS: ["Male", "Female", "Non-Binary", "Gender-Fluid"],
    DYNAMICS: ["UST - High Friction", "Strategic Tension", "Buddy Cop", "Master / Apprentice", "Bitter Rivals", "Frenemies", "Mentor / Mentee", "Unresolved Sexual Tension", "Grudging Mutual Respect", "Shared Trauma Bond"],
    TRAUMAS: ["Witnessed server farm bleed-out.", "Neural-link betrayal.", "Identity wiped by ghost protocol.", "Exposed data laundering ring.", "Escaped digital cult.", "False flagship conviction."]
};

const App = () => {
    const [viewMode, setViewMode] = useState('god');
    const [activeTab, setActiveTab] = useState('season');
    const [activeItem, setActiveItem] = useState(null);
    const [activeBrief, setActiveBrief] = useState(null);
    const [activeScript, setActiveScript] = useState(null);
    const [seasons, setSeasons] = useState([]);
    const [personas, setPersonas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ stage: 'IDLE', history: [], active_engine: 'Initializing...' });

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
        } catch (e) { 
            setSeasons([]); setPersonas([]);
        }
    };

    const runAction = async (endpoint, body) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}${endpoint}`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body) });
            const result = await res.json();
            if (result.error) window.alert(`BACKEND: ${result.error}`);
            await refreshData();
        } catch (e) {
            window.alert(`NETWORK: ${e.message}`);
        } finally { setLoading(false); }
    };

    const getBrief = async (seasonId, idx) => {
        setLoading(true); setActiveScript(null); setActiveBrief(null);
        try {
            const res = await fetch(`${API_BASE}/showrunner/brief`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ season_id: seasonId, node_index: idx }) });
            setActiveBrief(await res.json());
        } finally { setLoading(false); }
    };

    const generateScript = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/showrunner/script`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ season_id: activeItem.id, brief: activeBrief }) });
            const data = await res.json();
            setActiveScript(data.script);
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
                    <div className="flex items-center gap-3 text-teal-500 font-black text-sm uppercase tracking-widest"><Zap size={16} /> Telemetry_v45.1</div>
                    <div className="text-[10px] text-teal-900 uppercase font-black italic mt-2">{status.active_engine}</div>
                </div>
                <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar">
                    {(status?.history || []).map((log, i) => (
                        <div key={i} className={`border-l-2 pl-4 py-2 uppercase italic leading-snug ${log.includes("FAIL") ? 'text-white font-black text-[14px] border-red-500' : 'text-slate-600 text-[10px] border-slate-800'}`}>
                            {log}
                        </div>
                    ))}
                </div>
                <div className="mt-auto space-y-4 pt-6 border-t border-slate-900">
                    <div className="flex border border-slate-800 rounded overflow-hidden">
                        <button onClick={() => setViewMode('god')} className={`flex-1 py-2 text-[10px] font-black transition-all ${viewMode === 'god' ? 'bg-teal-500 text-black shadow-[0_0_15px_#2dd4bf50]' : 'bg-slate-900 text-slate-600'}`}>GOD</button>
                        <button onClick={() => setViewMode('user')} className={`flex-1 py-2 text-[10px] font-black transition-all ${viewMode === 'user' ? 'bg-teal-500 text-black shadow-[0_0_15px_#2dd4bf50]' : 'bg-slate-900 text-slate-600'}`}>USER</button>
                    </div>
                    <button onClick={() => runAction('/purge', {})} className="w-full p-4 bg-red-950/20 border border-red-900/30 text-red-500 text-[10px] font-black uppercase hover:bg-red-600 hover:text-white transition-all shadow-xl">Nuclear_Reset</button>
                </div>
            </aside>

            {/* COLUMN 2: WORKSPACE */}
            <main className="flex-1 flex flex-col p-12 overflow-y-auto relative bg-[#0d0f11]">
                {loading && (
                    <div className="absolute inset-0 bg-black/90 z-[100] flex flex-col items-center justify-center backdrop-blur-xl">
                        <Loader2 className="w-16 h-16 text-teal-500 animate-spin mb-4" />
                        <p className="text-teal-400 text-xs font-black uppercase tracking-[1em] animate-pulse">Syncing_Apex_Neural_Signal...</p>
                    </div>
                )}

                <div className="flex gap-4 mb-12 border-b border-slate-800 pb-8">
                    <button onClick={() => {setActiveItem(null); setActiveTab('season');}} className={`px-12 py-4 text-[11px] font-black transition-all rounded-sm ${activeTab === 'season' && !activeItem ? 'bg-teal-500 text-black shadow-[0_0_20px_rgba(45,212,191,0.3)]' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'}`}>SEASONS</button>
                    <button onClick={() => {setActiveItem(null); setActiveTab('persona');}} className={`px-12 py-4 text-[11px] font-black transition-all rounded-sm ${activeTab === 'persona' && !activeItem ? 'bg-teal-500 text-black shadow-[0_0_20px_rgba(45,212,191,0.3)]' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'}`}>DNA_VAULT</button>
                </div>

                {!activeItem ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4">
                        {(listData || []).map((item, i) => (
                            <div key={i} className="bg-[#1c1f23] border border-slate-800 p-10 rounded-3xl cursor-pointer hover:border-teal-500 transition-all flex gap-8 items-center shadow-2xl group relative active:scale-95" onClick={() => setActiveItem(item)}>
                                {viewMode === 'god' && <button onClick={(e) => deleteItem(e, activeTab, item.id)} className="absolute top-6 right-6 text-red-900 hover:text-red-500 transition-all z-10"><Trash2 size={18}/></button>}
                                <div className="w-24 h-24 rounded-2xl bg-slate-900 overflow-hidden border border-slate-800 shrink-0">
                                    {item?.portrait ? <img src={item.portrait} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" alt="DNA" /> : <Fingerprint className="m-8 text-slate-700" size={32}/>}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-white font-black uppercase text-2xl italic tracking-tighter truncate">{item?.title || item?.name}</h4>
                                    <p className="text-[11px] text-teal-500 uppercase font-black opacity-60 tracking-[0.2em] mt-1">{item?.relationship || item?.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="animate-in slide-in-from-bottom-8 duration-500 space-y-12">
                        <div className="flex justify-between items-end border-b border-slate-800 pb-12">
                            <div className="flex flex-col gap-2">
                                <span className="text-[10px] text-teal-600 font-black uppercase tracking-[0.4em] italic">Established_Target</span>
                                <h2 className="text-8xl font-black text-white uppercase italic tracking-tighter leading-none">{activeItem?.title || activeItem?.name}</h2>
                            </div>
                            <button onClick={() => setActiveItem(null)} className="bg-teal-500 text-black px-14 py-5 text-xs font-black shadow-2xl active:scale-95">CLOSE_FILE</button>
                        </div>

                        {activeTab === 'season' && (
                            <div className="flex flex-col gap-14">
                                <div className="bg-teal-950/10 p-14 border border-teal-900/30 rounded-3xl shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 blur-3xl rounded-full translate-x-10 -translate-y-10" />
                                    <h4 className="text-teal-400 text-[11px] font-black uppercase mb-8 flex items-center gap-3 italic tracking-[0.3em]"><ScrollText size={20}/> Grounded_Investigation_ARC</h4>
                                    <p className="text-[20px] text-slate-300 font-sans leading-relaxed uppercase selection:bg-teal-500/40">{activeItem?.summary}</p>
                                </div>

                                {viewMode === 'god' && (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                        <div className="bg-black/40 p-10 border border-slate-800 rounded-3xl shadow-inner">
                                            <h4 className="text-teal-500 text-[11px] font-black uppercase mb-6 flex items-center gap-2 italic"><History size={18}/> 20_Act_Shared_Lore</h4>
                                            <div className="space-y-4 h-[400px] overflow-y-auto custom-scrollbar pr-4">
                                                {(activeItem?.lore?.shared_anecdotes || []).map((a, i) => <p key={i} className="text-[12px] text-slate-500 italic uppercase border-l-2 border-slate-900 pl-6 py-2 hover:text-white hover:border-teal-500 transition-all">"{a}"</p>)}
                                            </div>
                                        </div>
                                        <div className="bg-black/40 p-10 border border-slate-800 rounded-3xl shadow-inner">
                                            <h4 className="text-teal-400 text-[11px] font-black uppercase mb-6 flex items-center gap-2 italic"><FastForward size={18}/> Future_Evolution_Roadmap</h4>
                                            <p className="text-[15px] text-slate-400 uppercase leading-relaxed font-sans bg-[#1c1f23]/50 p-8 rounded-xl border border-slate-800/50">{activeItem?.lore?.future_lore || "Syncing Lore..."}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 border-t border-slate-900 pt-14">
                                    <div className="space-y-6">
                                        <h4 className="text-teal-500 text-[11px] font-black uppercase italic border-b border-slate-800 pb-4 tracking-[0.2em]">Investigation_Nodes</h4>
                                        {(activeItem?.episodes || []).map((ep, idx) => (
                                            <div key={idx} className="p-8 bg-[#1c1f23] border border-slate-800 group hover:border-teal-500 transition-all flex flex-col gap-5 shadow-2xl rounded-2xl active:scale-[0.98]">
                                                <div className="flex justify-between items-center">
                                                    <span className="px-3 py-1 bg-slate-900 text-teal-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-slate-800">NODE_{ep?.act}</span>
                                                    <button onClick={() => getBrief(activeItem.id, idx)} className="px-8 py-2 bg-slate-800 text-teal-500 text-[10px] font-black uppercase border border-slate-700 hover:bg-teal-500 hover:text-black transition-all rounded-md">Ground_Brief</button>
                                                </div>
                                                <h4 className="text-white font-black text-2xl uppercase italic tracking-tighter leading-none">{ep?.title}</h4>
                                                <p className="text-[13px] text-slate-500 uppercase italic leading-snug opacity-80">{ep?.topic_summary}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="bg-black/60 border border-slate-800 rounded-3xl p-12 h-[900px] overflow-y-auto shadow-[0_0_50px_rgba(0,0,0,0.5)] relative">
                                        <div className="flex justify-between items-center mb-12 border-b border-slate-900 pb-8">
                                            <div className="flex flex-col gap-1">
                                                <h4 className="text-teal-500 text-[14px] font-black uppercase flex items-center gap-4"><ShieldCheck size={26}/> Production_Brief</h4>
                                                <span className="text-[10px] text-teal-900 uppercase font-black italic tracking-widest">{activeBrief?.archetype || "Awaiting_Input"} Structure</span>
                                            </div>
                                            {activeBrief && !activeScript && <button onClick={generateScript} className="bg-teal-500 text-black px-10 py-3 text-[11px] font-black flex items-center gap-3 hover:bg-white transition-all shadow-xl rounded-sm"><PlayCircle size={16}/> RUN_SCRIPT</button>}
                                        </div>
                                        {activeScript ? (
                                            <div className="animate-in fade-in slide-in-from-right-4">
                                                <div className="flex items-center gap-3 mb-10 text-teal-400 bg-teal-400/5 p-4 border border-teal-400/20 rounded-lg">
                                                    <MessageSquare size={20}/>
                                                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em]">Forensic_Dialogue_Transcript_Decrypted</h4>
                                                </div>
                                                <pre className="text-[16px] text-slate-300 whitespace-pre-wrap font-serif leading-relaxed uppercase selection:bg-teal-500/40 p-2">{activeScript}</pre>
                                            </div>
                                        ) : activeBrief && activeBrief.acts ? (
                                            Object.entries(activeBrief.acts).map(([k, v], i) => (
                                                <div key={i} className="mb-14 animate-in slide-in-from-right-8" style={{animationDelay: `${i*100}ms`}}>
                                                    <span className="text-[11px] text-teal-400 font-black uppercase mb-5 block opacity-50 tracking-[0.4em] border-b border-slate-900/50 pb-2">{k.replace(/_/g, ' ')}</span>
                                                    <p className="text-[17px] text-slate-400 font-sans leading-relaxed uppercase selection:bg-teal-500/20 italic">"{v}"</p>
                                                </div>
                                            ))
                                        ) : <div className="h-full flex flex-col items-center justify-center text-slate-800 gap-4">
                                                <ShieldCheck size={48} className="opacity-10" />
                                                <span className="text-xs font-black uppercase tracking-[0.6em] opacity-20">Initialize_Node_Handshake</span>
                                            </div>}
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* PERSONA DETAIL (Same as v43.5) */}
                        {activeTab === 'persona' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in slide-in-from-bottom-10">
                                <div className="bg-black/40 p-12 border border-slate-800 rounded-3xl shadow-2xl h-[750px] overflow-y-auto custom-scrollbar">
                                    <h4 className="text-teal-500 text-[12px] font-black uppercase mb-8 italic border-b border-slate-800 pb-4 flex items-center gap-3 tracking-widest"><Quote size={20}/> Forensic Dossier</h4>
                                    <p className="text-[16px] text-slate-400 font-sans leading-relaxed whitespace-pre-wrap uppercase italic opacity-70">"{activeItem?.archive?.vocal_intro}"</p>
                                    <hr className="my-10 border-slate-800 opacity-30"/>
                                    <p className="text-[16px] text-slate-300 font-sans leading-relaxed whitespace-pre-wrap uppercase tracking-wide">{activeItem?.archive?.bio}</p>
                                </div>
                                <div className="bg-black/40 p-12 border border-slate-800 rounded-3xl shadow-2xl h-[750px] overflow-y-auto custom-scrollbar">
                                    <h4 className="text-teal-500 text-[12px] font-black uppercase mb-8 italic border-b border-slate-800 pb-4 tracking-widest">DNA_Memories ({(activeItem?.archive?.anecdotes || []).length})</h4>
                                    {(activeItem?.archive?.anecdotes || []).map((a, i) => <p key={i} className="p-6 bg-white/5 border border-white/5 text-[12px] text-slate-500 italic mb-5 uppercase leading-relaxed hover:text-white hover:bg-teal-500/10 transition-all rounded-xl">"{a}"</p>)}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* COLUMN 3: COMMAND */}
            <aside className="w-[420px] bg-[#0b0c0e] p-12 flex flex-col gap-14 border-l border-slate-800 overflow-y-auto shadow-2xl shrink-0">
                <div className="space-y-8 animate-in slide-in-from-right-4">
                    <h3 className="text-teal-400 text-xs font-black uppercase tracking-[0.3em] flex items-center gap-3 border-b border-slate-900 pb-4"><UserPlus size={20}/> Identity_Spawn</h3>
                    <input className="w-full bg-[#1c1f23] p-6 border border-slate-800 text-sm text-white font-bold outline-none uppercase shadow-inner focus:border-teal-500 transition-all" placeholder="NAME" value={newP.name} onChange={(e) => setNewP({...newP, name: e.target.value})} />
                    <div className="grid grid-cols-2 gap-4">
                        <select className="bg-[#1c1f23] p-6 border border-slate-800 text-xs text-teal-500 font-black outline-none cursor-pointer" value={newP.gender} onChange={(e) => setNewP({...newP, gender: e.target.value})}>{CONFIG.GENDERS.map(g => <option key={g}>{g}</option>)}</select>
                        <input className="bg-[#1c1f23] p-6 border border-slate-800 text-xs text-slate-500 outline-none uppercase" placeholder="ROLE" value={newP.role} onChange={(e) => setNewP({...newP, role: e.target.value})} />
                    </div>
                    <div className="relative">
                        <input className="w-full bg-[#1c1f23] p-6 border border-slate-800 text-xs text-slate-500 outline-none uppercase pr-16" placeholder="CORE_TRAUMA" value={newP.trauma} onChange={(e) => setNewP({...newP, trauma: e.target.value})} />
                        <button onClick={() => setNewP({...newP, trauma: CONFIG.TRAUMAS[Math.floor(Math.random() * CONFIG.TRAUMAS.length)]})} className="absolute right-5 top-5 text-slate-700 hover:text-teal-500 transition-all active:rotate-180 duration-300"><Dice5 size={28}/></button>
                    </div>
                    <button onClick={() => runAction('/persona/create', newP)} disabled={loading || !newP.name} className="w-full py-6 bg-teal-500 text-black text-xs font-black uppercase shadow-[0_0_30px_rgba(45,212,191,0.2)] hover:bg-white transition-all disabled:opacity-20 active:scale-95">COMMIT_DNA</button>
                </div>

                <div className="space-y-8 border-t border-slate-900 pt-14 animate-in slide-in-from-right-8">
                    <h3 className="text-teal-400 text-xs font-black uppercase tracking-[0.3em] flex items-center gap-3 border-b border-slate-900 pb-4"><Database size={20}/> Establish_Season</h3>
                    <input className="w-full bg-[#1c1f23] p-6 border border-slate-800 text-sm text-white font-bold outline-none focus:border-teal-500 uppercase transition-all" placeholder="TOPIC" value={newS.topic} onChange={(e) => setNewS({...newS, topic: e.target.value})} />
                    <select className="w-full bg-[#1c1f23] p-6 border border-slate-800 text-xs text-teal-400 font-bold cursor-pointer" value={newS.relationship} onChange={(e) => setNewS({...newS, relationship: e.target.value})}>{CONFIG.DYNAMICS.map(d => <option key={d}>{d}</option>)}</select>
                    <div className="grid grid-cols-2 gap-3 max-h-[220px] overflow-y-auto p-4 border border-slate-800 rounded-2xl bg-black/40 custom-scrollbar shadow-inner">
                        {(personas || []).map(p => (
                            <button key={p.id} onClick={() => {
                                const ids = newS.host_ids.includes(p.id) ? newS.host_ids.filter(id => id !== p.id) : [...newS.host_ids, p.id];
                                setNewS({...newS, host_ids: ids.slice(0, 2)});
                            }} className={`p-4 text-[10px] font-black border uppercase rounded-xl truncate transition-all ${newS.host_ids.includes(p.id) ? 'border-teal-500 bg-teal-500/10 text-teal-400 shadow-[0_0_15px_rgba(45,212,191,0.2)]' : 'border-slate-800 text-slate-600 hover:border-slate-600'}`}>{p.name}</button>
                        ))}
                    </div>
                    <div className="space-y-4">
                        <p className="text-[11px] text-slate-500 uppercase font-black flex justify-between tracking-widest italic">Node_Length <span>{newS.episodes_count} EPISODES</span></p>
                        <input type="range" min="1" max="24" step="1" className="w-full accent-teal-500 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer" value={newS.episodes_count} onChange={(e) => setNewS({...newS, episodes_count: e.target.value})} />
                    </div>
                    <button onClick={() => runAction('/season/reconcile', newS)} disabled={loading || newS.host_ids.length !== 2} className="w-full py-6 bg-teal-500 text-black text-xs font-black uppercase shadow-[0_0_30px_rgba(45,212,191,0.2)] hover:bg-white transition-all disabled:opacity-20 active:scale-95">ESTABLISH_SIGNAL</button>
                </div>
            </aside>
        </div>
    );
};

export default App;
