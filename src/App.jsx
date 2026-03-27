import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Trash2, UserPlus, Wifi, Cpu, X, Archive, BookOpen, History, ChevronRight, FileText, Activity, Zap, Terminal, Mic2, Headphones, Sparkles, UserCircle, ClipboardCheck, BarChart3, Copy, Info } from 'lucide-react';

const BASE_URL = "https://shadow-cassandrafiles.pythonanywhere.com/api/v2";
const DESC_SAMPLES = ["A jaded investigative journalist.", "A tech futurist.", "A retired operative.", "A data broker."];
const CONFIG = {
    G: ["Male", "Female", "Non-Binary", "Fluid"],
    D: ["Unresolved Sexual Tension", "Mentor / Mentee", "Enemies", "Frenemies", "Grudging Respect", "Buddy Cop", "Bitter Rivals", "Strategic Alliance"],
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
    const [logs, setLogs] = useState([{ t: new Date().toLocaleTimeString(), m: "APEX_V197_SUMMARY_READY", type: "system" }]);

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

    const [nP, setNP] = useState({ name: '', role: 'Host', gender: CONFIG.G[0], description: DESC_SAMPLES[0] });
    const [nS, setNS] = useState({ topic: '', relationship: CONFIG.D[0], host_ids: [], episodes_count: 8, target_runtime: 15 });

    const createPersona = async () => {
        setLoad(true); setStatus("Synthesizing Subject DNA...");
        try {
            await fetch(`${BASE_URL}/persona/create`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(nP) });
            await sync();
        } finally { setLoad(false); setStatus(""); }
    };

    const createSeason = async () => {
        if (!nS.topic || nS.host_ids.length < 2) return addLog("MISSING_DATA", "error");
        setLoad(true);
        try {
            setStatus("Establishing Skeleton...");
            const r1 = await fetch(`${BASE_URL}/season/init`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(nS) });
            const s = await r1.json();
            setStatus("Researching & Summarizing..."); addLog("RESEARCH_START...", "system");
            await fetch(`${BASE_URL}/season/research`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ season_id: s.id }) });
            setStatus("Lore Handshake..."); addLog("LORE_SYNC...", "system");
            await fetch(`${BASE_URL}/season/lore`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ season_id: s.id }) });
            await sync();
        } catch (e) { addLog(`CRASH: ${e.message}`, "error"); }
        finally { setLoad(false); setStatus(""); }
    };

    const runProduction = async (epIdx) => {
        setLoad(true); let allBlocks = [];
        try {
            for (let i = 1; i <= 6; i++) {
                setStatus(`PRODUCING ACT ${i} / 6...`);
                const response = await fetch(`${BASE_URL}/episode/act_script`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ season_id: activeId.toString(), ep_idx: epIdx, act_num: i, previous_script: JSON.stringify(allBlocks.slice(-8)) })
                });
                const data = await response.json();
                allBlocks = [...allBlocks, ...(data.script_blocks || [])];
                addLog(`ACT_${i}_OK`, "llm");
                await new Promise(r => setTimeout(r, 1000));
            }
            setStatus("Finalizing...");
            const resAss = await fetch(`${BASE_URL}/episode/assess`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ season_id: activeId.toString(), ep_idx: epIdx, sample: JSON.stringify(allBlocks.slice(0, 5)) }) });
            const assData = await resAss.json();

            const currentSeason = seasons.find(s => s.id === activeId);
            const updatedEpisodes = [...currentSeason.episodes];
            updatedEpisodes[epIdx].full_script_blocks = allBlocks;
            updatedEpisodes[epIdx].assessment = assData.assessment;
            await fetch(`${BASE_URL}/episode/save_full`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ season_id: activeId.toString(), episodes: updatedEpisodes }) });
            await sync();
        } finally { setLoad(false); setStatus(""); }
    };

    const activeSeason = seasons?.find(x => x.id === activeId);
    const getStats = (blocks) => {
        if (!blocks) return { chars: 0, words: 0, time: 0 };
        const text = blocks.map(b => b.text).join(' ');
        const words = text.split(/\s+/).length;
        return { chars: text.length, words, time: (words / 150).toFixed(1) };
    };

    return (
        <div className="h-screen w-screen font-mono flex bg-[#0a0c0e] text-slate-400 overflow-hidden text-[11px] select-none">
            {load && <div className="fixed inset-0 bg-black/90 z-[500] flex flex-col items-center justify-center text-teal-500 backdrop-blur-md"><Activity className="animate-pulse mb-6" size={64}/><div className="font-black uppercase tracking-[0.4em]">{status}</div></div>}

            <aside className="w-[260px] border-r border-slate-800 bg-black/80 flex flex-col shrink-0">
                <div className="p-4 border-b border-slate-800 text-teal-500 font-black uppercase text-[10px] italic flex items-center gap-2"><Terminal size={14}/> Telemetry</div>
                <div ref={logRef} className="flex-1 overflow-y-auto p-4 space-y-2 bg-black/20 custom-scrollbar text-[9px] uppercase">
                    {logs?.map((log, i) => <div key={i} className={log.type === 'error' ? 'text-red-500' : 'opacity-60'}>[{log.t}] {log.m}</div>)}
                </div>
            </aside>

            <main className="flex-1 flex flex-col p-8 bg-[#0d0f11] relative overflow-hidden">
                <div className="flex gap-4 mb-6 border-b border-slate-800 pb-6 shrink-0 items-center">
                    <button onClick={() => { setActiveId(null); setViewLore(false); setActiveEp(null); }} className={`px-8 py-3 font-black uppercase rounded-lg ${!activeId ? 'bg-teal-500 text-black shadow-lg' : 'bg-slate-800'}`}>Library</button>
                    {activeId && (
                        <>
                            <div className="flex-1 text-teal-500 font-black uppercase italic truncate text-lg px-4"><ChevronRight className="inline mr-2"/>{activeSeason?.title || "Season"}</div>
                            <button onClick={() => setViewLore(!viewLore)} className={`p-4 rounded-xl border flex items-center gap-2 uppercase font-black transition-all ${viewLore ? 'bg-teal-500 text-black border-teal-500' : 'border-slate-800 text-slate-500'}`}><History size={16}/> Lore</button>
                        </>
                    )}
                </div>

                {!activeId ? (
                    <div className="grid grid-cols-2 gap-8 overflow-y-auto custom-scrollbar pr-4">
                        {seasons?.map(s => (
                            <div key={s.id} onClick={() => setActiveId(s.id)} className="bg-[#1c1f23] p-10 border border-slate-800 rounded-[2rem] cursor-pointer hover:border-teal-500 transition-all relative group h-fit shadow-2xl">
                                <button onClick={(e) => { e.stopPropagation(); fetch(`${BASE_URL}/delete/season/${s.id}`, {method:'DELETE'}).then(sync); }} className="absolute top-6 right-6 text-red-900 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={20}/></button>
                                <h4 className="text-white font-black uppercase italic text-2xl">{s.title}</h4>
                                <div className="mt-3 text-teal-600 font-black uppercase italic">{s.rel} | {s.runtime}m Target</div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col h-full gap-8 overflow-hidden">
                        {viewLore ? (
                            <div className="flex-1 bg-black/30 border border-slate-800 rounded-3xl p-10 overflow-y-auto custom-scrollbar space-y-6">
                                <div className="p-6 bg-teal-950/20 border border-teal-900/30 rounded-2xl mb-6">
                                    <h4 className="text-teal-500 font-black uppercase italic mb-2 flex items-center gap-2"><Zap size={16}/> Relationship Projection</h4>
                                    <p className="text-slate-300 uppercase leading-relaxed text-[10px]">{activeSeason?.future_lore || "No projection mapped."}</p>
                                </div>
                                {(activeSeason?.shared_history || []).map((lore, i) => (
                                    <div key={i} className="p-8 bg-slate-900/50 border border-slate-800 rounded-3xl text-slate-300 text-[11px] italic uppercase shadow-xl"><span className="text-teal-500 font-black mr-3">LOG_{i+1}:</span> {lore}</div>
                                ))}
                            </div>
                        ) : activeEp !== null ? (
                            <div className="flex-1 bg-black/30 border border-slate-800 rounded-[2.5rem] p-8 flex flex-col overflow-hidden relative">
                                <div className="flex justify-between items-center mb-6 shrink-0">
                                    <div className="flex gap-6 text-[10px] font-black uppercase italic text-teal-500 bg-teal-500/5 px-6 py-2 rounded-full border border-teal-500/20 items-center">
                                        <BarChart3 size={14}/>
                                        <span>Chars: {getStats(activeSeason?.episodes?.[activeEp]?.full_script_blocks).chars}</span>
                                        <span>EST: {getStats(activeSeason?.episodes?.[activeEp]?.full_script_blocks).time}m</span>
                                    </div>
                                    <button onClick={() => setActiveEp(null)} className="text-slate-500 hover:text-white uppercase font-black italic tracking-widest text-[10px]">[ Close ]</button>
                                </div>
                                {activeSeason?.episodes?.[activeEp]?.full_script_blocks ? (
                                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4">
                                        <textarea readOnly className="w-full h-96 bg-slate-950/80 p-8 rounded-3xl border border-teal-900/20 text-teal-300 font-mono text-[9px] resize-none outline-none select-text" value={JSON.stringify(activeSeason.episodes[activeEp].full_script_blocks, null, 4)} />
                                        <div className="bg-teal-950/10 p-8 border border-teal-900/30 rounded-3xl shadow-xl">
                                            <h4 className="text-teal-500 font-black uppercase italic flex items-center gap-2 mb-4"><ClipboardCheck size={20}/> Assessment</h4>
                                            <p className="text-slate-300 uppercase text-[10px] leading-relaxed">{activeSeason.episodes[activeEp].assessment}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full gap-8">
                                        <Mic2 size={80} className="text-slate-800 animate-pulse" />
                                        <button onClick={() => runProduction(activeEp)} className="px-12 py-5 bg-teal-500 text-black font-black uppercase text-[12px] rounded-2xl shadow-xl hover:scale-105 transition-all">Launch JSON Master Engine</button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col h-full gap-8">
                                <div className="bg-slate-900/50 p-10 border border-slate-800 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-8 text-teal-900 group-hover:text-teal-500 transition-colors"><Info size={40}/></div>
                                    <h3 className="text-teal-500 font-black uppercase italic tracking-widest mb-6 flex items-center gap-3"><BookOpen size={20}/> Season Briefing</h3>
                                    <p className="text-slate-200 text-lg leading-relaxed uppercase select-text italic italic relative z-10">
                                        {activeSeason?.description || "Research analysis in progress... please wait for telemetry synchronization."}
                                    </p>
                                </div>
                                <div className="grid grid-cols-3 gap-6 overflow-y-auto pr-4 custom-scrollbar">
                                    {activeSeason?.episodes?.map((e, idx) => (
                                        <div key={idx} onClick={() => setActiveEp(idx)} className="p-8 border border-slate-800 bg-slate-900/30 rounded-[2rem] hover:border-teal-500 cursor-pointer text-center h-fit group transition-all shadow-lg">
                                            <div className="text-[10px] text-teal-800 font-black uppercase mb-3 italic">Node_{idx + 1}</div>
                                            <h5 className="text-white font-black uppercase italic text-lg mb-4">{e?.title || "Researching..."}</h5>
                                            {e.full_script_blocks && <div className="mt-4 text-teal-500 text-[10px] font-black uppercase italic flex items-center justify-center gap-2"><Zap size={12}/> json_locked</div>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>
            {/* Sidebar code from V195 persists below */}
        </div>
    );
};
export default App;
