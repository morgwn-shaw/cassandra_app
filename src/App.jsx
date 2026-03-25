import React, { useState, useEffect, useCallback } from 'react';
import { Zap, Trash2, Database, Loader2, UserPlus, Wifi, Cpu, Dice5, PlayCircle, Globe, Calendar, RefreshCw, Terminal, MessageSquare, Archive, BookOpen, Mic, Copy, User, X, ShieldCheck, CheckCircle2 } from 'lucide-react';

const CONFIG = {
    G: ["Male", "Female", "Non-Binary", "Fluid"],
    D: ["Unresolved Sexual Tension", "Mentor / Mentee", "Enemies", "Frenemies", "Grudging Respect", "Buddy Cop", "Bitter Rivals", "Strategic Alliance"],
    T: ["Witnessed server farm bleed-out.", "Neural Betrayal.", "Identity Wiped.", "None", "Exposed laundering ring."]
};

const App = () => {
    const [activeId, setActiveId] = useState(null); 
    const [activeEpIdx, setActiveEpIdx] = useState(null);
    const [viewPersona, setViewPersona] = useState(null); 
    const [seasons, setSeasons] = useState([]);
    const [personas, setPersonas] = useState([]);
    const [load, setLoad] = useState(false);
    
    const [terminalMode, setTerminalMode] = useState('brief'); // brief, script, audit

    const sync = useCallback(async () => {
        try {
            const s = await fetch("https://shadow-cassandrafiles.pythonanywhere.com/api/v2/season/list");
            const p = await fetch("https://shadow-cassandrafiles.pythonanywhere.com/api/v2/persona/list");
            if (s.ok) setSeasons(await s.json());
            if (p.ok) setPersonas(await p.json());
        } catch (e) {}
    }, []);

    useEffect(() => { sync(); }, [sync]);

    const run = async (path, body) => {
        setLoad(true); try {
            const r = await fetch("https://shadow-cassandrafiles.pythonanywhere.com/api/v2" + path, {
                method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body)
            });
            const d = await r.json();
            await sync(); return d;
        } catch (e) { window.alert(`FAIL: ${e.message}`); } finally { setLoad(false); }
    };

    const activeSeason = seasons.find(x => x.id === activeId);
    const activeEp = activeSeason?.episodes[activeEpIdx];

    const getMasterScript = () => {
        if (!activeEp?.acts) return [];
        return Object.values(activeEp.acts).flat();
    };

    return (
        <div className="h-screen w-screen font-mono flex bg-[#0a0c0e] text-slate-400 overflow-hidden select-none text-[12px]">
            {/* PERSONA OVERLAY */}
            {viewPersona && (
                <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-20 backdrop-blur-3xl" onClick={() => setViewPersona(null)}>
                    <div className="bg-[#0d0f11] w-full h-full border border-teal-900/40 rounded-3xl p-12 flex gap-12 overflow-hidden relative shadow-2xl" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setViewPersona(null)} className="absolute top-8 right-8 text-slate-500 hover:text-white"><X size={32}/></button>
                        <div className="w-[300px] shrink-0 space-y-6">
                            <img src={viewPersona?.portrait} className="w-full aspect-square rounded-2xl border border-teal-900/20 bg-black object-cover" />
                            <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">{viewPersona?.name}</h2>
                            <div className="p-4 bg-red-950/20 border border-red-900/30 text-red-500 rounded-xl text-[9px] uppercase font-black italic">Trauma: {viewPersona?.trauma}</div>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-6 space-y-8">
                            <div className="bg-black/40 p-8 rounded-2xl border border-slate-800"><h4 className="text-teal-400 font-black mb-4 uppercase tracking-[0.3em]">DNA_BIO</h4><p className="text-slate-300 text-sm leading-relaxed uppercase">{viewPersona?.archive?.bio}</p></div>
                            <div className="space-y-4"><h4 className="text-teal-400 font-black uppercase tracking-[0.3em]">History_Backlog</h4>
                                {(viewPersona?.archive?.anecdotes || []).map((a, i) => <p key={i} className="p-5 bg-white/5 rounded-xl text-[11px] italic uppercase border border-white/5">"{a}"</p>)}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <aside className="w-[280px] border-r border-slate-800 bg-black/60 p-8 flex flex-col gap-6 shrink-0 shadow-2xl">
                <div className="flex items-center gap-3 text-teal-500 font-black uppercase border-b border-teal-900/30 pb-4"><Cpu size={16}/> Apex_v159.0</div>
                <button onClick={sync} className="w-full p-4 border border-teal-900/30 text-teal-500 text-[10px] font-black uppercase hover:bg-teal-500 hover:text-black rounded transition-all shadow-lg"><Wifi size={14}/> Sync Data</button>
            </aside>

            <main className="flex-1 flex flex-col p-10 bg-[#0d0f11] relative overflow-hidden">
                {load && <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center"><Loader2 className="animate-spin text-teal-500" size={48}/></div>}
                
                <div className="flex gap-4 mb-6 border-b border-slate-800 pb-6 shrink-0">
                    <button onClick={() => {setActiveId(null); setActiveEpIdx(null);}} className={`px-8 py-3 font-black text-[10px] uppercase transition-all ${!activeId ? 'bg-teal-500 text-black shadow-lg' : 'bg-slate-800'}`}>Library</button>
                    {activeId && <div className="flex-1 text-teal-500 font-black uppercase flex items-center gap-2 italic truncate tracking-widest underline decoration-teal-900 underline-offset-8">Uplink: {activeSeason?.title}</div>}
                </div>

                {!activeId ? (
                    <div className="grid grid-cols-2 gap-6 overflow-y-auto custom-scrollbar pr-4">
                        {seasons.map(s => (
                            <div key={s.id} onClick={() => setActiveId(s.id)} className="bg-[#1c1f23] p-8 border border-slate-800 rounded-3xl cursor-pointer hover:border-teal-500 transition-all relative group shadow-2xl shadow-black/60">
                                <button onClick={(e) => { e.stopPropagation(); fetch(`https://shadow-cassandrafiles.pythonanywhere.com/api/v2/delete/season/${s.id}`, {method:'DELETE'}).then(sync); }} className="absolute top-6 right-6 text-red-900 hover:text-red-500 active:scale-125 z-10"><Trash2 size={20}/></button>
                                <h4 className="text-white font-black uppercase italic text-xl tracking-tighter">{s.title}</h4>
                                <div className="flex items-center gap-2 mt-2"><span className="text-[10px] text-teal-600 font-black uppercase italic bg-teal-900/20 px-3 py-1 rounded-full">{s.rel}</span></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col h-full gap-6 overflow-hidden">
                        <div className="flex flex-wrap gap-2 overflow-y-auto max-h-[160px] custom-scrollbar p-3 border border-slate-900 rounded-2xl bg-black/20 shrink-0">
                            {activeSeason?.episodes?.map((e, idx) => (
                                <button key={idx} onClick={() => setActiveEpIdx(idx)} className={`px-5 py-3 border text-[10px] font-black uppercase rounded-xl flex flex-col items-start min-w-[160px] max-w-[220px] transition-all ${activeEpIdx === idx ? 'bg-teal-500 text-black border-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-teal-500'}`}>
                                    <span className={activeEpIdx === idx ? 'text-black/60 text-[8px]' : 'text-teal-700 text-[8px]'}>Node_{e.node}</span>
                                    <span className="truncate w-full">{e.title}</span>
                                </button>
                            ))}
                        </div>

                        {activeEpIdx !== null && (
                            <div className="flex-1 bg-black border border-teal-900/30 p-10 rounded-[40px] overflow-auto shadow-2xl relative custom-scrollbar select-text selection:bg-teal-500 selection:text-black">
                                <div className="sticky top-0 bg-black/95 backdrop-blur-xl pb-6 mb-6 border-b border-teal-900/20 flex justify-between items-center z-10">
                                    <div className="flex gap-4">
                                        <button onClick={() => setTerminalMode('brief')} className={`text-[10px] font-black uppercase ${terminalMode==='brief' ? 'text-teal-500 border-b-2 border-teal-500' : 'text-slate-600'}`}>The Brief</button>
                                        <button onClick={() => setTerminalMode('script')} className={`text-[10px] font-black uppercase ${terminalMode==='script' ? 'text-teal-500 border-b-2 border-teal-500' : 'text-slate-600'}`}>Production Script</button>
                                    </div>
                                    <div className="flex gap-2">
                                        {terminalMode === 'brief' && <button onClick={() => run('/showrunner/brief', {title: activeEp.title, season_id: activeId})} className="bg-slate-900 text-teal-400 px-4 py-2 rounded-full text-[9px] font-black border border-teal-900/30">Establish Brief</button>}
                                        {terminalMode === 'brief' && activeEp.saved_brief && (
                                            <div className="flex gap-1 ml-4 border-l border-slate-800 pl-4">
                                                {[1,2,3,4,5,6].map(n => (
                                                    <button key={n} onClick={() => run('/showrunner/script', {title: activeEp.title, season_id: activeId, act_num: n, context: activeEp.saved_brief})} className={`px-3 py-1 rounded text-[8px] font-black transition-all ${activeEp.acts?.[n] ? 'bg-teal-600 text-black' : 'bg-slate-800 text-slate-500 hover:bg-teal-900'}`}>Act_{n}</button>
                                                ))}
                                            </div>
                                        )}
                                        {terminalMode === 'script' && <button onClick={() => { navigator.clipboard.writeText(JSON.stringify(getMasterScript())); window.alert("MASTER_JSON_COPIED"); }} className="bg-teal-600 text-black px-6 py-2 rounded-full text-[9px] font-black uppercase hover:bg-white flex items-center gap-2"><Copy size={14}/> Copy Master JSON</button>}
                                    </div>
                                </div>
                                
                                {terminalMode === 'brief' && <pre className="text-teal-400 text-[13px] leading-relaxed whitespace-pre-wrap italic uppercase p-4">{activeEp.saved_brief || "Generate Brief to begin."}</pre>}
                                {terminalMode === 'script' && (
                                    <div className="space-y-6">
                                        {getMasterScript().length > 0 ? getMasterScript().map((line, idx) => (
                                            <div key={idx} className="border-l-2 border-teal-900/40 pl-6">
                                                <span className="text-[9px] font-black text-teal-700 uppercase italic">[{line.voice_id}] {line.name}</span>
                                                <p className="text-slate-300 text-sm leading-relaxed mt-1 uppercase">"{line.content}"</p>
                                            </div>
                                        )) : <div className="h-40 flex items-center justify-center text-slate-700 italic">Generate acts in the Brief tab to populate master script.</div>}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </main>

            <aside className="w-[380px] bg-black/60 p-10 border-l border-slate-800 overflow-y-auto shrink-0 flex flex-col gap-10 shadow-2xl custom-scrollbar">
                <div className="space-y-6">
                    <h3 className="text-teal-500 text-[11px] font-black uppercase border-b border-slate-800 pb-3 flex items-center gap-2 tracking-[0.2em]"><UserPlus size={18}/> Identity Spawn</h3>
                    <input className="w-full bg-slate-900/50 p-4 border border-slate-800 text-white outline-none focus:border-teal-500 uppercase font-bold rounded-xl" placeholder="NAME" value={nP.name} onChange={e => setNP({...nP, name: e.target.value})} />
                    <div className="grid grid-cols-2 gap-2">
                        <select className="bg-slate-900 p-4 border border-slate-800 text-[10px] text-teal-500 outline-none rounded-xl" value={nP.gender} onChange={e => setNP({...nP, gender: e.target.value})}>{CONFIG.G.map(g => <option key={g} value={g}>{g}</option>)}</select>
                        <input className="bg-slate-900 p-4 border border-slate-800 text-[10px] uppercase outline-none focus:border-teal-500 rounded-xl" placeholder="ROLE" value={nP.role} onChange={e => setNP({...nP, role: e.target.value})} />
                    </div>
                    <div className="relative"><input className="w-full bg-slate-900/50 p-4 border border-slate-800 text-teal-500 text-[9px] outline-none focus:border-teal-500 uppercase rounded-xl" placeholder="TTS_VOICE_ID" value={nP.voice_id} onChange={e => setNP({...nP, voice_id: e.target.value})} /><Mic size={16} className="absolute right-5 top-5 text-teal-900" /></div>
                    <button onClick={() => run('/persona/create', nP)} disabled={!nP.name} className="w-full py-4 bg-teal-500 text-black font-black uppercase text-[10px] hover:bg-white rounded-xl transition-all">Commit DNA</button>
                    <div className="flex flex-wrap gap-3 py-6 border-t border-slate-900">
                        {personas.map(p => (
                            <div key={p.id} className="relative group cursor-pointer" onClick={() => setViewPersona(p)}>
                                <img src={p.portrait} className="w-16 h-16 rounded-2xl border-2 border-slate-800 group-hover:border-teal-500 transition-all bg-black object-cover" />
                                <button onClick={(e) => { e.stopPropagation(); fetch(`https://shadow-cassandrafiles.pythonanywhere.com/api/v2/delete/persona/${p.id}`, {method:'DELETE'}).then(sync); }} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all border-2 border-black"><Trash2 size={10}/></button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-6 border-t border-slate-900 pt-8">
                    <h3 className="text-teal-500 text-[11px] font-black uppercase border-b border-slate-800 pb-3 flex items-center gap-2 tracking-[0.2em]"><Archive size={18}/> Establish Season</h3>
                    <input className="w-full bg-slate-900 p-4 border border-slate-800 text-white font-bold outline-none focus:border-teal-500 uppercase rounded-xl" placeholder="TOPIC" value={nS.topic} onChange={e => setNS({...nS, topic: e.target.value})} />
                    <select className="w-full bg-slate-900 p-4 border border-slate-800 text-[10px] text-teal-400 outline-none rounded-xl" value={nS.relationship} onChange={e => setNS({...nS, relationship: e.target.value})}>{CONFIG.D.map(d => <option key={d} value={d}>{d}</option>)}</select>
                    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-4 bg-black/40 rounded-xl border border-slate-800 custom-scrollbar">
                        {personas.map(p => (
                            <button key={p.id} onClick={() => { const ids = nS.host_ids.includes(p.id) ? nS.host_ids.filter(x => x!==p.id) : [...nS.host_ids, p.id]; setNS({...nS, host_ids: ids.slice(0,2)}); }} className={`p-2 text-[8px] font-black border truncate uppercase rounded-md transition-all ${nS.host_ids.includes(p.id) ? 'border-teal-500 text-teal-400 bg-teal-500/10' : 'border-slate-800'}`}>{p.name}</button>
                        ))}
                    </div>
                    <button onClick={() => run('/season/reconcile', nS)} disabled={nS.host_ids.length !== 2} className="w-full py-4 bg-teal-500 text-black font-black uppercase text-[10px] hover:bg-white rounded-xl transition-all">Establish Season</button>
                </div>
            </aside>
        </div>
    );
};

export default App;
