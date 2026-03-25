import React, { useState, useEffect, useCallback } from 'react';
import { Zap, Trash2, Database, Loader2, UserPlus, Wifi, Cpu, Dice5, PlayCircle, Globe, Calendar, RefreshCw, Terminal, MessageSquare, Archive, BookOpen, Mic, Copy, User, X, ShieldCheck, FileText } from 'lucide-react';

const CONFIG = {
    G: ["Male", "Female", "Non-Binary", "Fluid"],
    D: ["Unresolved Sexual Tension", "Mentor / Mentee", "Enemies", "Frenemies", "Grudging Respect", "Buddy Cop", "Bitter Rivals", "Strategic Alliance"],
    T: ["Witnessed server farm bleed-out.", "Neural Betrayal.", "Identity Wiped.", "None", "Exposed laundering ring."]
};

const App = () => {
    const [activeId, setActiveId] = useState(null); 
    const [viewPersona, setViewPersona] = useState(null); 
    const [seasons, setSeasons] = useState([]);
    const [personas, setPersonas] = useState([]);
    const [load, setLoad] = useState(false);
    
    // CONTENT HUB
    const [lastBrief, setLastBrief] = useState("");
    const [scriptLines, setScriptLines] = useState([]);
    const [auditReport, setAuditReport] = useState("");
    const [terminalMode, setTerminalMode] = useState('raw'); // raw, script, audit

    const [nP, setNP] = useState({ name: '', role: 'Analyst', trauma: CONFIG.T[0], gender: 'Male', voice_id: '' });
    const [nS, setNS] = useState({ topic: '', relationship: CONFIG.D[0], host_ids: [], episodes_count: 10 });

    const sync = useCallback(async () => {
        try {
            const s = await fetch("https://shadow-cassandrafiles.pythonanywhere.com/api/v2/season/list");
            const p = await fetch("https://shadow-cassandrafiles.pythonanywhere.com/api/v2/persona/list");
            if (s.ok) setSeasons(await s.json());
            if (p.ok) setPersonas(await p.json());
        } catch (e) {}
    }, []);

    useEffect(() => { sync(); }, [sync]);

    const run = async (path, body, method = 'POST') => {
        setLoad(true); try {
            const r = await fetch("https://shadow-cassandrafiles.pythonanywhere.com/api/v2" + path, {
                method, headers: {'Content-Type': 'application/json'}, body: body ? JSON.stringify(body) : null
            });
            const d = await r.json();
            if (path.includes('brief')) { setLastBrief(d.raw); setTerminalMode('raw'); }
            if (path.includes('script')) { setScriptLines(d.script); setTerminalMode('script'); }
            if (path.includes('audit')) { setAuditReport(d.raw); setTerminalMode('audit'); }
            await sync(); return d;
        } catch (e) { window.alert(`FAIL: ${e.message}`); } finally { setLoad(false); }
    };

    const activeSeason = seasons.find(x => x.id === activeId);

    const copyText = () => {
        let content = "";
        if (terminalMode === 'raw') content = lastBrief;
        if (terminalMode === 'audit') content = auditReport;
        if (terminalMode === 'script') content = scriptLines.map(l => `${l.name}: ${l.content}`).join('\n');
        navigator.clipboard.writeText(content);
        window.alert("COPIED_TO_CLIPBOARD");
    };

    return (
        <div className="h-screen w-screen font-mono flex bg-[#0a0c0e] text-slate-400 overflow-hidden select-none text-[12px]">
            {/* PERSONA OVERLAY */}
            {viewPersona && (
                <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-20 backdrop-blur-3xl" onClick={() => setViewPersona(null)}>
                    <div className="bg-[#0d0f11] w-full h-full border border-teal-900/40 rounded-3xl p-12 flex gap-12 overflow-hidden relative shadow-2xl animate-in zoom-in duration-300" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setViewPersona(null)} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-all"><X size={32}/></button>
                        <div className="w-[300px] shrink-0 space-y-6">
                            <img src={viewPersona?.portrait} className="w-full aspect-square rounded-2xl border border-teal-900/20 bg-black object-cover" />
                            <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">{viewPersona?.name}</h2>
                            <div className="p-4 bg-red-950/20 border border-red-900/30 text-red-500 rounded-xl text-[9px] uppercase font-black">Trauma: {viewPersona?.trauma}</div>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-6 space-y-8">
                            <div className="bg-black/40 p-8 rounded-2xl border border-slate-800"><h4 className="text-teal-400 font-black mb-4 uppercase tracking-[0.3em]">DNA_PROTOCOL</h4><p className="text-slate-300 text-sm leading-relaxed uppercase">{viewPersona?.archive?.bio}</p></div>
                            <div className="space-y-4"><h4 className="text-teal-400 font-black uppercase tracking-[0.3em]">Anecdote Backlog</h4>
                                {(viewPersona?.archive?.anecdotes || []).map((a, i) => <p key={i} className="p-5 bg-white/5 border border-white/5 rounded-xl text-[11px] italic uppercase">"{a}"</p>)}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* LEFT SIDEBAR */}
            <aside className="w-[280px] border-r border-slate-800 bg-black/60 p-8 flex flex-col gap-6 shrink-0 shadow-2xl">
                <div className="flex items-center gap-3 text-teal-500 font-black uppercase tracking-widest border-b border-teal-900/30 pb-4"><Cpu size={16}/> Apex_v158.0</div>
                <button onClick={() => run('/ping', null, 'GET')} className="w-full p-4 border border-teal-900/30 text-teal-500 text-[10px] font-black uppercase hover:bg-teal-500 hover:text-black rounded transition-all shadow-lg shadow-teal-500/10"><Wifi size={14}/> Handshake</button>
                <div className="mt-auto border-t border-slate-900 pt-6"><button onClick={() => run('/purge', {})} className="w-full p-3 bg-red-950/20 text-red-500 text-[10px] font-black border border-red-900/30 hover:bg-red-600 transition-all uppercase italic">Purge DNA</button></div>
            </aside>

            {/* MAIN FLOOR */}
            <main className="flex-1 flex flex-col p-10 bg-[#0d0f11] relative overflow-hidden">
                {load && <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center backdrop-blur-sm"><Loader2 className="animate-spin text-teal-500" size={48}/></div>}
                
                <div className="flex gap-4 mb-6 border-b border-slate-800 pb-6 shrink-0">
                    <button onClick={() => setActiveId(null)} className={`px-8 py-3 font-black text-[10px] uppercase transition-all ${!activeId ? 'bg-teal-500 text-black shadow-lg shadow-teal-500/20' : 'bg-slate-800'}`}>Season List</button>
                    {activeId && <div className="flex-1 text-teal-500 font-black uppercase flex items-center gap-2 italic truncate tracking-widest underline decoration-teal-900">Uplink: {activeSeason?.title}</div>}
                </div>

                {!activeId ? (
                    <div className="grid grid-cols-2 gap-6 overflow-y-auto custom-scrollbar pr-4">
                        {seasons.map(s => (
                            <div key={s.id} onClick={() => setActiveId(s.id)} className="bg-[#1c1f23] p-8 border border-slate-800 rounded-3xl cursor-pointer hover:border-teal-500 transition-all relative group h-fit">
                                <button onClick={(e) => { e.stopPropagation(); run(`/delete/season/${s.id}`, null, 'DELETE'); }} className="absolute top-6 right-6 text-red-900 hover:text-red-500 transition-all active:scale-125 z-10"><Trash2 size={20}/></button>
                                <h4 className="text-white font-black uppercase italic text-xl tracking-tighter">{s.title}</h4>
                                <p className="text-[10px] text-teal-600 font-black uppercase italic mt-1">{s.rel}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col h-full gap-6 overflow-hidden">
                        <div className="bg-teal-950/10 p-8 border border-teal-900/30 rounded-3xl shrink-0 shadow-inner">
                           <h5 className="text-teal-500 text-[9px] font-black uppercase mb-3 flex items-center gap-2 tracking-[0.2em] italic"><BookOpen size={14}/> Forensic_Overview</h5>
                           <p className="text-[12px] text-slate-300 leading-relaxed uppercase italic">"{activeSeason?.summary}"</p>
                        </div>

                        <div className="flex flex-wrap gap-2 overflow-y-auto max-h-[160px] custom-scrollbar p-3 border border-slate-900 rounded-2xl bg-black/20 shrink-0">
                            {activeSeason?.episodes?.map(e => (
                                <button key={e.node} onClick={() => run('/showrunner/brief', {title: e.title, season_id: activeId})} className="px-5 py-3 bg-slate-900 border border-slate-800 text-[10px] font-black uppercase hover:border-teal-500 rounded-xl flex flex-col items-start min-w-[160px] max-w-[220px] transition-all active:scale-95 shadow-lg">
                                    <span className="text-teal-700 text-[8px] mb-1 font-black uppercase">Node_{e.node}</span>
                                    <span className="text-slate-400 truncate w-full">{e.title}</span>
                                </button>
                            ))}
                        </div>

                        {/* ATOMIC TERMINAL */}
                        <div className="flex-1 bg-black border border-teal-900/30 p-10 rounded-[40px] overflow-auto shadow-2xl relative custom-scrollbar select-text selection:bg-teal-500 selection:text-black">
                            <div className="sticky top-0 bg-black/95 backdrop-blur-xl pb-6 mb-6 border-b border-teal-900/20 flex justify-between items-center z-10">
                                <div className="flex gap-4">
                                    <button onClick={() => setTerminalMode('raw')} className={`text-[10px] font-black uppercase tracking-widest ${terminalMode==='raw' ? 'text-teal-500 border-b-2 border-teal-500' : 'text-slate-600'}`}>Brief</button>
                                    <button onClick={() => setTerminalMode('script')} className={`text-[10px] font-black uppercase tracking-widest ${terminalMode==='script' ? 'text-teal-500 border-b-2 border-teal-500' : 'text-slate-600'}`}>Script</button>
                                    <button onClick={() => setTerminalMode('audit')} className={`text-[10px] font-black uppercase tracking-widest ${terminalMode==='audit' ? 'text-teal-500 border-b-2 border-teal-500' : 'text-slate-600'}`}>Audit</button>
                                </div>
                                <div className="flex gap-4">
                                    <button onClick={copyText} className="bg-slate-900 text-teal-500 px-5 py-2 rounded-full text-[9px] font-black hover:bg-teal-500 hover:text-black flex items-center gap-2 transition-all"><Copy size={14}/> Copy</button>
                                    {terminalMode === 'raw' && (
                                        <div className="flex gap-1">
                                            {[1,2,3,4,5,6].map(n => (
                                                <button key={n} onClick={() => run('/showrunner/script', {context: lastBrief, season_id: activeId, act_num: n})} className="bg-teal-600 text-black px-3 py-1 rounded text-[8px] font-black hover:bg-white transition-all uppercase">Act_{n}</button>
                                            ))}
                                        </div>
                                    )}
                                    {terminalMode === 'script' && <button onClick={() => run('/showrunner/audit', {brief: lastBrief, script: JSON.stringify(scriptLines)})} className="bg-purple-600 text-white px-6 py-2 rounded-full text-[9px] font-black uppercase hover:bg-white hover:text-purple-600 flex items-center gap-2 shadow-2xl transition-all italic"><ShieldCheck size={14}/> Forensic Audit</button>}
                                </div>
                            </div>
                            
                            <div className="cursor-text">
                                {terminalMode === 'raw' && <pre className="text-teal-400 text-[13px] leading-[1.8] whitespace-pre-wrap font-mono uppercase italic p-4">{lastBrief}</pre>}
                                {terminalMode === 'script' && (
                                    <div className="space-y-6 p-4">
                                        {scriptLines.map((line, idx) => (
                                            <div key={idx} className="border-l-2 border-teal-900/40 pl-6 group">
                                                <div className="flex gap-4 text-[9px] font-black text-teal-700 mb-1 uppercase tracking-tighter italic">
                                                    <span>[{line.voice_id}] {line.name}</span>
                                                    <span className="opacity-0 group-hover:opacity-100 text-slate-700 transition-opacity">Emotion: {line.emotion} | Speed: {line.speed}</span>
                                                </div>
                                                <p className="text-slate-300 text-sm leading-relaxed uppercase">"{line.content}"</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {terminalMode === 'audit' && <pre className="text-purple-400 text-[13px] leading-[1.8] whitespace-pre-wrap font-mono uppercase italic p-4">{auditReport}</pre>}
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* RIGHT SIDEBAR */}
            <aside className="w-[380px] bg-black/60 p-10 border-l border-slate-800 overflow-y-auto shrink-0 flex flex-col gap-10 shadow-2xl custom-scrollbar">
                <div className="space-y-6">
                    <h3 className="text-teal-500 text-[10px] font-black uppercase border-b border-slate-800 pb-2 flex items-center gap-2 tracking-widest"><UserPlus size={16}/> Identity Spawn</h3>
                    <input className="w-full bg-slate-900/50 p-4 border border-slate-800 text-white outline-none focus:border-teal-500 uppercase font-bold shadow-inner rounded-xl" placeholder="NAME" value={nP.name} onChange={e => setNP({...nP, name: e.target.value})} />
                    <div className="grid grid-cols-2 gap-2">
                        <select className="bg-slate-900 p-4 border border-slate-800 text-[10px] text-teal-500 outline-none rounded-xl" value={nP.gender} onChange={e => setNP({...nP, gender: e.target.value})}>{CONFIG.G.map(g => <option key={g} value={g}>{g}</option>)}</select>
                        <input className="bg-slate-900 p-4 border border-slate-800 text-[10px] uppercase outline-none focus:border-teal-500 rounded-xl" placeholder="ROLE" value={nP.role} onChange={e => setNP({...nP, role: e.target.value})} />
                    </div>
                    <div className="relative"><input className="w-full bg-slate-900/50 p-4 border border-slate-800 text-teal-500 text-[9px] outline-none focus:border-teal-500 uppercase rounded-xl" placeholder="TTS_VOICE_ID" value={nP.voice_id} onChange={e => setNP({...nP, voice_id: e.target.value})} /><Mic size={14} className="absolute right-4 top-4 text-teal-900" /></div>
                    <div className="relative"><input className="w-full bg-slate-900 p-4 border border-slate-800 text-[9px] outline-none focus:border-teal-500 rounded-xl" placeholder="TRAUMA" value={nP.trauma} onChange={e => setNP({...nP, trauma: e.target.value})} /><button onClick={() => setNP({...nP, trauma: CONFIG.T[Math.floor(Math.random()*CONFIG.T.length)]})} className="absolute right-3 top-3 text-slate-700 hover:text-teal-500 transition-all duration-300 active:rotate-180"><Dice5 size={20}/></button></div>
                    <button onClick={() => run('/persona/create', nP)} disabled={!nP.name} className="w-full py-4 bg-teal-500 text-black font-black uppercase text-[10px] hover:bg-white tracking-widest italic shadow-xl transition-all rounded-xl">Commit DNA</button>
                    <div className="flex flex-wrap gap-2 py-4">
                        {personas.map(p => (
                            <div key={p.id} className="relative group cursor-pointer" onClick={() => setViewPersona(p)}>
                                <img src={p.portrait} className="w-14 h-14 rounded-lg border border-slate-800 group-hover:border-teal-500 transition-all bg-black object-cover shadow-lg" />
                                <button onClick={(e) => { e.stopPropagation(); run(`/delete/persona/${p.id}`, null, 'DELETE'); }} className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-lg"><Trash2 size={10}/></button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-6 border-t border-slate-900 pt-8">
                    <h3 className="text-teal-500 text-[10px] font-black uppercase border-b border-slate-800 pb-2 flex items-center gap-2 tracking-widest"><Archive size={16}/> Establish Season</h3>
                    <input className="w-full bg-slate-900 p-4 border border-slate-800 text-white font-bold outline-none focus:border-teal-500 uppercase rounded-xl" placeholder="TOPIC" value={nS.topic} onChange={e => setNS({...nS, topic: e.target.value})} />
                    <select className="w-full bg-slate-900 p-4 border border-slate-800 text-[10px] text-teal-400 outline-none cursor-pointer rounded-xl" value={nS.relationship} onChange={e => setNS({...nS, relationship: e.target.value})}>{CONFIG.D.map(d => <option key={d} value={d}>{d}</option>)}</select>
                    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-4 bg-black/40 rounded-xl border border-slate-800 custom-scrollbar">
                        {personas.map(p => (
                            <button key={p.id} onClick={() => { const ids = nS.host_ids.includes(p.id) ? nS.host_ids.filter(x => x!==p.id) : [...nS.host_ids, p.id]; setNS({...nS, host_ids: ids.slice(0,2)}); }} className={`p-2 text-[8px] font-black border truncate uppercase rounded-md transition-all ${nS.host_ids.includes(p.id) ? 'border-teal-500 text-teal-400 bg-teal-500/10 shadow-lg' : 'border-slate-800 hover:border-slate-600'}`}>{p.name}</button>
                        ))}
                    </div>
                    <input type="range" min="1" max="24" className="w-full accent-teal-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer shadow-inner" value={nS.episodes_count} onChange={e => setNS({...nS, episodes_count: e.target.value})} />
                    <button onClick={() => run('/season/reconcile', nS)} disabled={nS.host_ids.length !== 2} className="w-full py-4 bg-teal-500 text-black font-black uppercase text-[10px] hover:bg-white tracking-widest italic shadow-xl transition-all rounded-xl">Establish Season</button>
                </div>
            </aside>
        </div>
    );
};

export default App;
