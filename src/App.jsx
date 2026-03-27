import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Trash2, UserPlus, Wifi, Cpu, X, Archive, BookOpen, History, ChevronRight, FileText, Activity, Zap, ClipboardCheck, Terminal, Mic2, PlayCircle, Headphones } from 'lucide-react';

const BASE_URL = "https://shadow-cassandrafiles.pythonanywhere.com/api/v2";
const CONFIG = {
    G: ["Male", "Female", "Non-Binary", "Fluid"],
    D: ["Unresolved Sexual Tension", "Mentor / Mentee", "Enemies", "Frenemies", "Grudging Respect", "Buddy Cop", "Strategic Alliance"],
    T: ["Neural Betrayal.", "Identity Wiped.", "None", "Exposed laundering ring.", "Server farm bleed-out."]
};

const App = () => {
    const [activeId, setActiveId] = useState(null); 
    const [viewPersona, setViewPersona] = useState(null); 
    const [activeEp, setActiveEp] = useState(null);
    const [viewLore, setViewLore] = useState(false);
    const [seasons, setSeasons] = useState([]);
    const [personas, setPersonas] = useState([]);
    const [load, setLoad] = useState(false);
    const [status, setStatus] = useState("");
    const [logs, setLogs] = useState([{ t: new Date().toLocaleTimeString(), m: "SCAVENGER_V180_UP", type: "system" }]);

    const logRef = useRef(null);
    const addLog = (m, type = "info") => {
        setLogs(prev => [...prev, { t: new Date().toLocaleTimeString(), m: typeof m === 'string' ? m : JSON.stringify(m), type }].slice(-50));
    };

    const sync = useCallback(async () => {
        try {
            const resP = await fetch(`${BASE_URL}/persona/list`);
            const resS = await fetch(`${BASE_URL}/season/list`);
            if (resP.ok && resS.ok) {
                setPersonas(await resP.json());
                setSeasons(await resS.json());
            }
        } catch (e) { addLog(`SYNC_FAIL: ${e.message}`, "error"); }
    }, []);

    useEffect(() => { sync(); }, [sync]);
    useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [logs]);

    const [nP, setNP] = useState({ name: '', role: 'Agent', trauma: CONFIG.T[0], gender: 'Female' });
    const [nS, setNS] = useState({ topic: '', relationship: CONFIG.D[0], host_ids: [], episodes_count: 8, target_runtime: 15 });

    const createPersona = async () => {
        setLoad(true); setStatus("Scavenging Model...");
        try {
            const r = await fetch(`${BASE_URL}/persona/create`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(nP) });
            const d = await r.json();
            addLog(d, "llm");
            await sync();
        } finally { setLoad(false); setStatus(""); }
    };

    const createSeason = async () => {
        setLoad(true); setStatus("Researching Season...");
        try {
            const r1 = await fetch(`${BASE_URL}/season/reconcile`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(nS) });
            const s = await r1.json();
            addLog(s, "llm");
            await fetch(`${BASE_URL}/season/lore`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ season_id: s.id }) });
            await sync();
        } finally { setLoad(false); setStatus(""); }
    };

    const deleteItem = async (type, id) => {
        if (!window.confirm(`Purge this ${type}?`)) return;
        setLoad(true);
        try {
            await fetch(`${BASE_URL}/delete/${type}/${id}`, { method: 'DELETE' });
            await sync();
            if (activeId === id) setActiveId(null);
        } finally { setLoad(false); }
    };

    const activeSeason = seasons.find(x => x.id === activeId);

    return (
        <div className="h-screen w-screen font-mono flex bg-[#0a0c0e] text-slate-400 overflow-hidden text-[11px] select-none">
            {load && (
                <div className="fixed inset-0 bg-black/90 z-[500] flex flex-col items-center justify-center backdrop-blur-xl text-teal-500">
                    <Activity className="animate-pulse mb-6" size={64}/>
                    <div className="font-black uppercase tracking-[0.4em]">{status}</div>
                </div>
            )}

            {/* MONITORING PANE */}
            <aside className="w-[260px] border-r border-slate-800 bg-black/80 flex flex-col shrink-0 overflow-hidden">
                <div className="p-4 border-b border-slate-800 flex items-center gap-2 text-teal-500 font-black uppercase italic tracking-widest text-[10px]"><Terminal size={14}/> Telemetry</div>
                <div ref={logRef} className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar text-[9px] uppercase leading-tight bg-black/20">
                    {logs.map((log, i) => (
                        <div key={i} className={`p-2 rounded border ${log.type === 'error' ? 'bg-red-950/20 border-red-900/40 text-red-500' : log.type === 'llm' ? 'bg-teal-950/20 border-teal-900/40 text-teal-400' : 'bg-slate-900/40 border-slate-800 text-slate-500'}`}>
                            [{log.t}] {log.m.substring(0, 100)}...
                        </div>
                    ))}
                </div>
            </aside>

            {/* MASTER WORKSPACE */}
            <main className="flex-1 flex flex-col p-8 bg-[#0d0f11] relative overflow-hidden">
                <div className="flex gap-4 mb-6 border-b border-slate-800 pb-6 shrink-0 items-center">
                    <button onClick={() => { setActiveId(null); setViewLore(false); setActiveEp(null); }} className={`px-8 py-3 font-black uppercase rounded-lg transition-all ${!activeId ? 'bg-teal-500 text-black shadow-lg shadow-teal-500/20' : 'bg-slate-800'}`}>Library</button>
                    {activeId && (
                        <>
                            <div className="flex-1 text-teal-500 font-black uppercase italic truncate text-lg tracking-widest px-4"><ChevronRight className="inline mr-2"/>{activeSeason?.title}</div>
                            <button onClick={() => setViewLore(!viewLore)} className={`p-4 rounded-xl border flex items-center gap-2 uppercase font-black transition-all ${viewLore ? 'bg-teal-500 text-black border-teal-500' : 'border-slate-800 text-slate-500 hover:border-teal-500'}`}><History size={16}/> Lore</button>
                        </>
                    )}
                </div>

                {!activeId ? (
                    <div className="grid grid-cols-2 gap-8 overflow-y-auto pr-4 custom-scrollbar">
                        {seasons.map(s => (
                            <div key={s.id} onClick={() => setActiveId(s.id)} className="bg-[#1c1f23] p-10 border border-slate-800 rounded-[2rem] cursor-pointer hover:border-teal-500 transition-all relative group shadow-2xl h-fit">
                                <button onClick={(e) => { e.stopPropagation(); deleteItem('season', s.id); }} className="absolute top-6 right-8 text-red-900 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={24}/></button>
                                <h4 className="text-white font-black uppercase italic text-2xl tracking-tighter">{s.title}</h4>
                                <div className="mt-3 text-teal-600 font-black uppercase italic tracking-widest">{s.rel} | {s.archetype}</div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col h-full gap-8 overflow-hidden">
                        {activeEp !== null ? (
                            <div className="flex-1 bg-black/30 border border-slate-800 rounded-[2.5rem] p-12 flex flex-col gap-8 overflow-hidden relative shadow-inner">
                                <button onClick={() => setActiveEp(null)} className="absolute top-8 right-12 text-slate-500 hover:text-white uppercase font-black italic tracking-widest">[ Back_to_Season ]</button>
                                <div className="flex-1 overflow-y-auto custom-scrollbar pr-6 space-y-10">
                                    {activeSeason.episodes[activeEp].full_script ? (
                                        <div className="bg-slate-950/80 p-12 rounded-3xl border border-teal-900/20 text-slate-300 uppercase text-[13px] leading-[2.2] whitespace-pre-wrap select-text italic shadow-2xl">{activeSeason.episodes[activeEp].full_script}</div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full gap-8 text-slate-700">
                                            <FileText size={80} className="animate-pulse" />
                                            <button onClick={() => runProduction(activeEp)} className="px-12 py-5 bg-teal-500 text-black font-black uppercase text-[12px] rounded-2xl shadow-xl shadow-teal-500/20">Launch Scavenger Production</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : viewLore ? (
                            <div className="flex-1 bg-black/30 border border-slate-800 rounded-3xl p-10 overflow-y-auto custom-scrollbar space-y-6">
                                {(activeSeason?.shared_history || []).map((lore, i) => (
                                    <div key={i} className="p-8 bg-slate-900/50 border border-slate-800 rounded-3xl text-slate-300 uppercase text-[11px] leading-relaxed italic shadow-xl"><span className="text-teal-500 font-black mr-3">HIST_LOG_{i+1}:</span> {lore}</div>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 gap-6 overflow-y-auto custom-scrollbar">
                                {activeSeason.episodes.map((e, idx) => (
                                    <div key={idx} onClick={() => setActiveEp(idx)} className="p-8 border border-slate-800 bg-slate-900/30 rounded-[2rem] hover:border-teal-500 cursor-pointer transition-all shadow-xl group text-center">
                                        <div className="text-[10px] text-teal-800 font-black uppercase mb-3">NODE_{idx + 1}</div>
                                        <h5 className="text-white font-black uppercase italic text-lg mb-4">{e.title}</h5>
                                        {e.full_script && <div className="mt-4 text-teal-500 text-[10px] font-black uppercase italic flex items-center justify-center gap-2"><Zap size={12}/> script_finalized</div>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* SIDEBAR TOOLS */}
            <aside className="w-[340px] bg-black/60 p-8 border-l border-slate-800 overflow-y-auto shrink-0 flex flex-col gap-10 shadow-2xl custom-scrollbar">
                {/* PERSONA SPAWN */}
                <div className="space-y-6">
                    <h3 className="text-teal-500 font-black uppercase border-b border-teal-900/30 pb-3 tracking-widest italic flex items-center gap-2"><UserPlus size={18}/> Identity Spawn</h3>
                    <input className="w-full bg-slate-900/50 p-5 border border-slate-800 text-white font-bold rounded-2xl outline-none focus:border-teal-500 uppercase text-[12px]" placeholder="NAME" value={nP.name} onChange={e => setNP({...nP, name: e.target.value})} />
                    <div className="grid grid-cols-2 gap-4">
                        <select className="bg-slate-900/50 p-4 border border-slate-800 text-teal-500 rounded-2xl outline-none uppercase font-black" value={nP.gender} onChange={e => setNP({...nP, gender: e.target.value})}>{CONFIG.G.map(g => <option key={g} value={g}>{g}</option>)}</select>
                        <select className="bg-slate-900/50 p-4 border border-slate-800 text-teal-500 rounded-2xl outline-none uppercase font-black" value={nP.trauma} onChange={e => setNP({...nP, trauma: e.target.value})}>{CONFIG.T.map(t => <option key={t} value={t}>{t}</option>)}</select>
                    </div>
                    <button onClick={createPersona} disabled={!nP.name || load} className="w-full py-5 bg-teal-500 text-black font-black uppercase rounded-[1.5rem] shadow-2xl hover:bg-white transition-all">Commit DNA</button>
                    <div className="flex flex-wrap gap-4 pt-6 border-t border-slate-900">
                        {personas.map(p => (
                            <div key={p.id} className="relative group">
                                <img src={p.portrait} onClick={() => setViewPersona(p)} className="w-14 h-14 rounded-xl border-2 border-slate-800 hover:border-teal-500 cursor-pointer bg-black shadow-xl" alt="p" />
                                <button onClick={(e) => { e.stopPropagation(); deleteItem('persona', p.id); }} className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500"><Trash2 size={10}/></button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* SEASON ARCHITECT */}
                <div className="space-y-6 border-t border-slate-800 pt-10">
                    <h3 className="text-teal-500 font-black uppercase border-b border-teal-900/30 pb-3 tracking-widest italic flex items-center gap-2"><Archive size={18}/> Season Architect</h3>
                    <input className="w-full bg-slate-900/50 p-5 border border-slate-800 text-white font-bold rounded-2xl outline-none focus:border-teal-500 uppercase text-[12px]" placeholder="TOPIC" value={nS.topic} onChange={e => setNS({...nS, topic: e.target.value})} />
                    <select className="w-full bg-slate-900/50 p-5 border border-slate-800 text-teal-400 rounded-2xl outline-none font-black text-[10px]" value={nS.relationship} onChange={e => setNS({...nS, relationship: e.target.value})}>{CONFIG.D.map(d => <option key={d} value={d}>{d}</option>)}</select>
                    <div className="space-y-6 p-8 bg-black/40 rounded-[2rem] border border-slate-800 shadow-inner">
                        <div className="flex justify-between text-[9px] font-black uppercase text-slate-500"><span>Nodes: {nS.episodes_count}</span><span>{nS.target_runtime}m</span></div>
                        <input type="range" min="1" max="24" className="w-full accent-teal-500 h-1" value={nS.episodes_count} onChange={e => setNS({...nS, episodes_count: parseInt(e.target.value)})} />
                        <input type="range" min="5" max="60" step="5" className="w-full accent-teal-500 h-1" value={nS.target_runtime} onChange={e => setNS({...nS, target_runtime: parseInt(e.target.value)})} />
                    </div>
                    <div className="grid grid-cols-2 gap-3 max-h-40 overflow-y-auto p-4 bg-black/20 rounded-2xl border border-slate-800 custom-scrollbar">
                        {personas.map(p => (
                            <button key={p.id} onClick={() => { const ids = nS.host_ids.includes(p.id) ? nS.host_ids.filter(x => x !== p.id) : [...nS.host_ids, p.id]; setNS({...nS, host_ids: ids.slice(0, 2)}); }} className={`p-4 text-[9px] font-black border truncate uppercase rounded-2xl transition-all ${nS.host_ids.includes(p.id) ? 'border-teal-500 text-teal-400 bg-teal-500/10 shadow-[0_0_15px_rgba(20,184,166,0.1)]' : 'border-slate-800 text-slate-600'}`}>{p.name}</button>
                        ))}
                    </div>
                    <button onClick={createSeason} disabled={nS.host_ids.length !== 2 || !nS.topic || load} className="w-full py-6 bg-teal-500 text-black font-black uppercase rounded-[1.5rem] shadow-2xl hover:bg-white transition-all">Establish Season</button>
                </div>
            </aside>

            {/* PERSONA DOSSIER */}
            {viewPersona && (
                <div className="fixed inset-0 z-[600] bg-black/95 flex items-center justify-center p-12 backdrop-blur-3xl" onClick={() => setViewPersona(null)}>
                    <div className="bg-[#0d0f11] w-full max-w-5xl h-[80vh] border border-teal-900/40 rounded-3xl p-10 flex gap-10 overflow-hidden relative shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="w-[280px] shrink-0 space-y-6">
                            <img src={viewPersona?.portrait} className="w-full aspect-square rounded-2xl border-2 border-teal-900/20 bg-black" alt="p" />
                            <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">{viewPersona?.name}</h2>
                            <div className="p-4 bg-teal-950/20 border border-teal-900/30 rounded-xl">
                                <h4 className="text-teal-500 font-black uppercase text-[9px] mb-2 italic flex items-center gap-2"><Headphones size={12}/> Aura Voice</h4>
                                <div className="text-white font-black text-[12px]">{viewPersona?.voice_id}</div>
                            </div>
                            <div className="text-teal-500 font-black uppercase text-[10px] italic border-t border-slate-800 pt-4 tracking-widest underline underline-offset-4">{viewPersona?.mbti} Profile</div>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 space-y-8">
                            <div className="p-6 bg-black/40 border border-slate-800 rounded-xl shadow-inner">
                                <h4 className="text-teal-500 font-black mb-4 uppercase italic tracking-widest text-[10px]">Behavioral_Bio</h4>
                                <p className="text-slate-300 uppercase leading-relaxed text-[12px] select-text italic">{viewPersona?.archive?.bio}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2 border-l border-teal-900/30 pl-4"><h4 className="text-teal-500 font-black uppercase italic text-[10px]">DNA_Likes</h4><div className="flex flex-wrap gap-1">{(viewPersona?.archive?.likes || []).map((l, i) => <span key={i} className="px-2 py-1 bg-teal-500/5 border border-teal-500/10 text-teal-400 text-[8px] rounded uppercase">{l}</span>)}</div></div>
                                <div className="space-y-2 border-l border-red-900/30 pl-4"><h4 className="text-red-500 font-black uppercase italic text-[10px]">Aversions</h4><div className="flex flex-wrap gap-1">{(viewPersona?.archive?.dislikes || []).map((d, i) => <span key={i} className="px-2 py-1 bg-red-500/5 border border-red-500/10 text-red-400 text-[8px] rounded uppercase">{d}</span>)}</div></div>
                            </div>
                            <div className="space-y-4 pt-6 border-t border-slate-800">
                                <h4 className="text-teal-500 font-black uppercase italic text-[10px] tracking-widest">Life_History_Anecdotes</h4>
                                {(viewPersona?.archive?.anecdotes || []).map((a, i) => <p key={i} className="p-4 bg-white/5 rounded-xl text-[10px] italic border border-white/5 uppercase select-text leading-relaxed opacity-70 hover:opacity-100 transition-opacity">"{a}"</p>)}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default App;
