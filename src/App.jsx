import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Trash2, UserPlus, Wifi, Cpu, X, Archive, BookOpen, History, ChevronRight, FileText, Activity, Zap, Terminal, Mic2, Headphones, Sparkles, UserCircle } from 'lucide-react';

const BASE_URL = "https://shadow-cassandrafiles.pythonanywhere.com/api/v2";
const CONFIG = {
    G: ["Male", "Female", "Non-Binary", "Fluid"],
    D: ["Unresolved Sexual Tension", "Mentor / Mentee", "Enemies", "Frenemies", "Grudging Respect", "Buddy Cop", "Bitter Rivals", "Strategic Alliance"],
};

const App = () => {
    const [activeId, setActiveId] = useState(null); 
    const [viewPersona, setViewPersona] = useState(null); 
    const [seasons, setSeasons] = useState([]);
    const [personas, setPersonas] = useState([]);
    const [load, setLoad] = useState(false);
    const [status, setStatus] = useState("");
    const [logs, setLogs] = useState([{ t: new Date().toLocaleTimeString(), m: "APEX_V187_CORE", type: "system" }]);

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
        } catch (e) { addLog(`SYNC_FAIL`, "error"); }
    }, []);

    useEffect(() => { sync(); }, [sync]);
    useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [logs]);

    const [nP, setNP] = useState({ name: '', role: 'Host', gender: CONFIG.G[0], description: "A witty specialist with a deep archive of obscure facts." });
    const [nS, setNS] = useState({ topic: '', relationship: CONFIG.D[0], host_ids: [], episodes_count: 8, target_runtime: 15 });

    const createSeason = async () => {
        if (!nS.topic || nS.host_ids.length < 2) {
            addLog("INVALID: Missing Topic or Hosts", "error");
            return;
        }
        setLoad(true);
        addLog(`BOOTING: ${nS.topic}`, "system");
        try {
            setStatus("Initializing Skeleton...");
            const r1 = await fetch(`${BASE_URL}/season/init`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(nS)
            });
            if (!r1.ok) throw new Error("Step 1 Failed (Init)");
            const s = await r1.json();
            addLog(`SKELETON_LOCKED: ${s.id}`, "system");

            setStatus("Researching Narrative...");
            const r2 = await fetch(`${BASE_URL}/season/research`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ season_id: s.id })
            });
            if (!r2.ok) throw new Error("Step 2 Failed (Research)");
            addLog("RESEARCH_COMPLETE", "system");

            setStatus("Syncing Shared Lore...");
            const r3 = await fetch(`${BASE_URL}/season/lore`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ season_id: s.id })
            });
            if (!r3.ok) throw new Error("Step 3 Failed (Lore)");
            addLog("LORE_SYNCHRONIZED", "system");

            await sync();
        } catch (e) {
            addLog(`FATAL: ${e.message}`, "error");
        } finally {
            setLoad(false);
            setStatus("");
        }
    };

    const activeSeason = seasons?.find(x => x.id === activeId);

    return (
        <div className="h-screen w-screen font-mono flex bg-[#0a0c0e] text-slate-400 overflow-hidden text-[11px] select-none">
            {load && (
                <div className="fixed inset-0 bg-black/90 z-[500] flex flex-col items-center justify-center backdrop-blur-xl text-teal-500">
                    <Activity className="animate-pulse mb-6" size={64}/>
                    <div className="font-black uppercase tracking-[0.4em]">{status}</div>
                </div>
            )}

            {/* MONITORING */}
            <aside className="w-[260px] border-r border-slate-800 bg-black/80 flex flex-col shrink-0">
                <div className="p-4 border-b border-slate-800 text-teal-500 font-black uppercase text-[10px] tracking-widest"><Terminal size={14} className="inline mr-2"/> Telemetry</div>
                <div ref={logRef} className="flex-1 overflow-y-auto p-4 space-y-2 bg-black/20 custom-scrollbar text-[9px] uppercase">
                    {logs.map((log, i) => (
                        <div key={i} className={log.type === 'error' ? 'text-red-500' : 'opacity-60'}>[{log.t}] {log.m.substring(0, 50)}</div>
                    ))}
                </div>
            </aside>

            {/* WORKSPACE */}
            <main className="flex-1 flex flex-col p-8 bg-[#0d0f11] relative overflow-hidden">
                <div className="flex gap-4 mb-6 border-b border-slate-800 pb-6 shrink-0 items-center">
                    <button onClick={() => setActiveId(null)} className={`px-8 py-3 font-black uppercase rounded-lg ${!activeId ? 'bg-teal-500 text-black' : 'bg-slate-800'}`}>Library</button>
                    {activeId && <div className="flex-1 text-teal-500 font-black uppercase italic truncate text-lg"><ChevronRight className="inline mx-2"/>{activeSeason?.title || "Season"}</div>}
                </div>

                {!activeId ? (
                    <div className="grid grid-cols-2 gap-8 overflow-y-auto custom-scrollbar">
                        {seasons?.map(s => (
                            <div key={s.id} onClick={() => setActiveId(s.id)} className="bg-[#1c1f23] p-10 border border-slate-800 rounded-[2rem] cursor-pointer hover:border-teal-500 relative group h-fit transition-all shadow-2xl">
                                <button onClick={(e) => { e.stopPropagation(); fetch(`${BASE_URL}/delete/season/${s.id}`, {method:'DELETE'}).then(sync); }} className="absolute top-6 right-6 text-red-900 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={20}/></button>
                                <h4 className="text-white font-black uppercase italic text-2xl">{s.title}</h4>
                                <div className="mt-3 text-teal-600 font-black uppercase italic">{s.rel} | {s.runtime}m</div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-3 gap-6 overflow-y-auto custom-scrollbar">
                        {activeSeason?.episodes?.map((e, idx) => (
                            <div key={idx} className="p-8 border border-slate-800 bg-slate-900/30 rounded-[2rem] shadow-xl text-center">
                                <div className="text-[10px] text-teal-800 font-black uppercase mb-3">NODE_{idx + 1}</div>
                                <h5 className="text-white font-black uppercase italic text-lg mb-4">{e.title}</h5>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* SIDEBAR TOOLS */}
            <aside className="w-[340px] bg-black/60 p-8 border-l border-slate-800 overflow-y-auto shrink-0 flex flex-col gap-10 shadow-2xl custom-scrollbar">
                <div className="space-y-6">
                    <h3 className="text-teal-500 font-black uppercase border-b border-teal-900/30 pb-3 tracking-widest italic flex items-center gap-2"><UserPlus size={18}/> Identity Spawn</h3>
                    <input className="w-full bg-slate-900/50 p-4 border border-slate-800 text-white font-bold rounded-xl outline-none focus:border-teal-500 uppercase text-[12px]" placeholder="NAME" value={nP.name} onChange={e => setNP({...nP, name: e.target.value})} />
                    <textarea className="w-full bg-slate-900/50 p-4 border border-slate-800 text-slate-300 rounded-xl outline-none focus:border-teal-500 uppercase text-[10px] h-32" placeholder="DESCRIPTION" value={nP.description} onChange={e => setNP({...nP, description: e.target.value})} />
                    <select className="w-full bg-slate-900/50 p-4 border border-slate-800 text-teal-500 rounded-2xl outline-none uppercase font-black" value={nP.gender} onChange={e => setNP({...nP, gender: e.target.value})}>{CONFIG.G.map(g => <option key={g} value={g}>{g}</option>)}</select>
                    <button onClick={async () => { setLoad(true); await fetch(`${BASE_URL}/persona/create`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(nP)}); await sync(); setLoad(false); }} disabled={!nP.name || load} className="w-full py-5 bg-teal-500 text-black font-black uppercase rounded-[1.5rem] shadow-2xl">Commit DNA</button>
                    <div className="flex flex-wrap gap-4 pt-6 border-t border-slate-900">
                        {personas?.map(p => <img key={p.id} src={p.portrait} onClick={() => setViewPersona(p)} className="w-14 h-14 rounded-xl border-2 border-slate-800 hover:border-teal-500 cursor-pointer bg-black shadow-xl" alt="p" />)}
                    </div>
                </div>

                <div className="space-y-6 border-t border-slate-800 pt-10">
                    <h3 className="text-teal-500 font-black uppercase border-b border-teal-900/30 pb-3 tracking-widest italic flex items-center gap-2"><Archive size={18}/> Season Architect</h3>
                    <input className="w-full bg-slate-900/50 p-5 border border-slate-800 text-white font-bold rounded-2xl outline-none focus:border-teal-500 uppercase text-[12px]" placeholder="TOPIC" value={nS.topic} onChange={e => setNS({...nS, topic: e.target.value})} />
                    <select className="w-full bg-slate-900/50 p-4 border border-slate-800 text-teal-400 rounded-2xl outline-none font-black text-[10px]" value={nS.relationship} onChange={e => setNS({...nS, relationship: e.target.value})}>{CONFIG.D.map(d => <option key={d} value={d}>{d}</option>)}</select>
                    <div className="space-y-6 p-8 bg-black/40 rounded-[2rem] border border-slate-800 shadow-inner">
                        <div className="flex justify-between text-[9px] font-black uppercase text-slate-500"><span>Nodes: {nS.episodes_count}</span><span>{nS.target_runtime}m</span></div>
                        <input type="range" min="1" max="24" className="w-full accent-teal-500 h-1" value={nS.episodes_count} onChange={e => setNS({...nS, episodes_count: parseInt(e.target.value)})} />
                        <input type="range" min="5" max="25" step="1" className="w-full accent-teal-500 h-1" value={nS.target_runtime} onChange={e => setNS({...nS, target_runtime: parseInt(e.target.value)})} />
                    </div>
                    <div className="grid grid-cols-2 gap-3 max-h-40 overflow-y-auto p-4 bg-black/20 rounded-2xl border border-slate-800">
                        {personas?.map(p => (
                            <button key={p.id} onClick={() => { const ids = nS.host_ids.includes(p.id) ? nS.host_ids.filter(x => x !== p.id) : [...nS.host_ids, p.id]; setNS({...nS, host_ids: ids.slice(0, 2)}); }} className={`p-4 text-[9px] font-black border truncate uppercase rounded-2xl transition-all ${nS.host_ids.includes(p.id) ? 'border-teal-500 text-teal-400 bg-teal-500/10' : 'border-slate-800 text-slate-600'}`}>{p.name}</button>
                        ))}
                    </div>
                    <button onClick={createSeason} disabled={nS.host_ids.length !== 2 || !nS.topic || load} className="w-full py-6 bg-teal-500 text-black font-black uppercase rounded-[1.5rem] shadow-2xl">Establish Season</button>
                </div>
            </aside>

            {/* DOSSIER */}
            {viewPersona && (
                <div className="fixed inset-0 z-[600] bg-black/95 flex items-center justify-center p-12 backdrop-blur-3xl" onClick={() => setViewPersona(null)}>
                    <div className="bg-[#0d0f11] w-full max-w-6xl h-[80vh] border border-teal-900/40 rounded-3xl p-10 flex gap-10 overflow-hidden relative shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="w-[300px] shrink-0 space-y-6">
                            <img src={viewPersona?.portrait} className="w-full aspect-square rounded-2xl border-2 border-teal-900/20 bg-black" alt="p" />
                            <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">{viewPersona?.name}</h2>
                            <div className="p-4 bg-teal-950/20 border border-teal-900/30 rounded-xl">
                                <h4 className="text-teal-500 font-black uppercase text-[9px] mb-2 italic flex items-center gap-2"><Headphones size={12}/> Aura: {viewPersona?.voice_id}</h4>
                                <div className="text-white font-black text-[12px]">{viewPersona?.dna?.mbti} Profile</div>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 space-y-8">
                            <div className="p-8 bg-black/40 border border-slate-800 rounded-2xl">
                                <h4 className="text-teal-500 font-black mb-4 uppercase italic text-[10px] flex items-center gap-2"><UserCircle size={14}/> Behavioral DNA</h4>
                                <p className="text-slate-200 uppercase leading-relaxed text-[12px] select-text">{viewPersona?.dna?.personality_blurb}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-4 border-l border-teal-900/30 pl-6"><h4 className="text-teal-500 font-black uppercase italic text-[10px]">Cultural Likes</h4><div className="flex flex-wrap gap-2">{viewPersona?.dna?.likes?.map((l, i) => <span key={i} className="px-2 py-1 bg-teal-500/5 border border-teal-500/10 text-teal-400 text-[9px] rounded uppercase">{l}</span>)}</div></div>
                                <div className="space-y-4 border-l border-red-900/30 pl-6"><h4 className="text-red-500 font-black uppercase italic text-[10px]">Aversions</h4><div className="flex flex-wrap gap-2">{viewPersona?.dna?.dislikes?.map((d, i) => <span key={i} className="px-2 py-1 bg-red-500/5 border border-red-500/10 text-red-400 text-[9px] rounded uppercase">{d}</span>)}</div></div>
                            </div>
                            <div className="space-y-3 pt-6 border-t border-slate-800">
                                <h4 className="text-teal-500 font-black uppercase italic text-[10px]">25 Core Memories</h4>
                                {viewPersona?.dna?.core_memories?.map((m, i) => <div key={i} className="p-3 bg-white/5 rounded-xl text-[10px] italic uppercase leading-relaxed opacity-70 hover:opacity-100 transition-opacity">[{i+1}] {m}</div>)}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default App;
