import React, { useState, useEffect, useCallback } from 'react';
import { Trash2, Loader2, UserPlus, Wifi, Cpu, X, Archive, BookOpen, History, ChevronRight, FileText, Activity, Zap } from 'lucide-react';

const BASE_URL = "https://shadow-cassandrafiles.pythonanywhere.com/api/v2";

const CONFIG = {
    G: ["Male", "Female", "Non-Binary", "Fluid"],
    D: ["Unresolved Sexual Tension", "Mentor / Mentee", "Enemies", "Frenemies", "Grudging Respect", "Buddy Cop", "Bitter Rivals", "Strategic Alliance"],
    T: ["Witnessed server farm bleed-out.", "Neural Betrayal.", "Identity Wiped.", "None", "Exposed laundering ring."]
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

    const [nP, setNP] = useState({ name: '', role: 'Analyst', trauma: CONFIG.T[0], gender: 'Male' });
    const [nS, setNS] = useState({ topic: '', relationship: CONFIG.D[0], host_ids: [], episodes_count: 8, target_runtime: 15 });

    const sync = useCallback(async () => {
        setLoad(true);
        try {
            const resP = await fetch(`${BASE_URL}/persona/list`);
            const resS = await fetch(`${BASE_URL}/season/list`);
            if (resP.ok && resS.ok) {
                setPersonas(await resP.json());
                setSeasons(await resS.json());
            }
        } catch (e) { console.error("SYNC_FAIL", e); }
        finally { setLoad(false); }
    }, []);

    useEffect(() => { sync(); }, [sync]);

    const runProduction = async (epIdx) => {
        setLoad(true);
        let completeScript = "";
        try {
            for (let i = 1; i <= 6; i++) {
                setStatus(`ACT ${i}/6: AI GENERATING...`);
                
                // 120 Second Timeout for deep act generation
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 120000);

                const r = await fetch(`${BASE_URL}/episode/act_script`, {
                    method: 'POST',
                    mode: 'cors',
                    headers: { 'Content-Type': 'application/json' },
                    signal: controller.signal,
                    body: JSON.stringify({
                        season_id: activeId,
                        ep_idx: epIdx,
                        act_num: i,
                        previous_script: completeScript.slice(-1000) 
                    })
                });
                
                clearTimeout(timeoutId);
                const data = await r.json();
                if (!r.ok) throw new Error(data.error || "Act production failed");
                
                completeScript += `\n\n--- [ACT ${i}] ---\n\n` + data.script;
                setStatus(`ACT ${i} COMPLETE. SYNCING...`);
                // Short break to prevent uWSGI worker congestion
                await new Promise(res => setTimeout(res, 1500));
            }
            
            setStatus("SAVING MASTER PRODUCTION SCRIPT...");
            await fetch(`${BASE_URL}/episode/save_full`, {
                method: 'POST',
                mode: 'cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ season_id: activeId, ep_idx: epIdx, full_script: completeScript })
            });
            await sync();
        } catch (e) { 
            console.error(e);
            window.alert(`PRODUCTION HALTED: ${e.name === 'AbortError' ? 'Server connection timed out' : e.message}`); 
        }
        finally { setLoad(false); setStatus(""); }
    };

    const createSeason = async () => {
        setLoad(true); setStatus("ESTABLISHING SEASON ARC...");
        try {
            const r1 = await fetch(`${BASE_URL}/season/reconcile`, {
                method: 'POST', mode: 'cors', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(nS)
            });
            const season = await r1.json();
            if (!r1.ok) throw new Error(season.error);

            setStatus("SYNCING SHARED LORE...");
            await fetch(`${BASE_URL}/season/lore`, {
                method: 'POST', mode: 'cors', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ season_id: season.id })
            });
            await sync();
        } catch (e) { window.alert(e.message); }
        finally { setLoad(false); setStatus(""); }
    };

    const deleteItem = async (type, id) => {
        if (!window.confirm(`Purge this ${type} from memory?`)) return;
        setLoad(true);
        try {
            await fetch(`${BASE_URL}/delete/${type}/${id}`, { method: 'DELETE', mode: 'cors' });
            await sync();
            if (activeId === id) setActiveId(null);
        } catch (e) { console.error(e); }
        finally { setLoad(false); }
    };

    const activeSeason = seasons.find(x => x.id === activeId);

    return (
        <div className="h-screen w-screen font-mono flex bg-[#0a0c0e] text-slate-400 overflow-hidden text-[12px] select-none">
            
            {/* GLOBAL LOADER */}
            {load && (
                <div className="fixed inset-0 bg-black/90 z-[300] flex flex-col items-center justify-center backdrop-blur-xl">
                    <Activity className="animate-pulse text-teal-500 mb-6" size={64}/>
                    <div className="text-teal-500 font-black uppercase tracking-[0.4em] text-lg animate-bounce">{status || "Processing..."}</div>
                </div>
            )}

            {/* PERSONA DOSSIER OVERLAY */}
            {viewPersona && (
                <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-12 backdrop-blur-3xl" onClick={() => setViewPersona(null)}>
                    <div className="bg-[#0d0f11] w-full max-w-6xl h-[85vh] border border-teal-900/40 rounded-3xl p-10 flex gap-10 overflow-hidden relative shadow-2xl" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setViewPersona(null)} className="absolute top-8 right-8 text-slate-500 hover:text-white"><X size={32}/></button>
                        
                        <div className="w-[300px] shrink-0 space-y-6">
                            <img src={viewPersona?.portrait} className="w-full aspect-square rounded-2xl border-2 border-teal-900/20 bg-black shadow-2xl" alt="p" />
                            <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">{viewPersona?.name}</h2>
                            <div className="text-teal-500 font-black uppercase tracking-widest text-[10px] italic underline underline-offset-4 decoration-teal-900">{viewPersona?.mbti} Profile</div>
                            
                            <div className="space-y-4 pt-6 border-t border-slate-800 h-[320px] overflow-y-auto custom-scrollbar pr-3">
                                <div className="space-y-2">
                                    <h4 className="text-teal-500 font-black text-[9px] uppercase tracking-widest italic flex items-center gap-2"><Zap size={10}/> DNA_Likes</h4>
                                    <div className="flex flex-wrap gap-1">
                                        {(viewPersona?.archive?.likes || []).map((l, i) => <span key={i} className="px-2 py-1 bg-teal-500/5 border border-teal-500/10 text-teal-400 text-[8px] rounded uppercase">{l}</span>)}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-red-500 font-black text-[9px] uppercase tracking-widest italic flex items-center gap-2"><X size={10}/> Aversions</h4>
                                    <div className="flex flex-wrap gap-1">
                                        {(viewPersona?.archive?.dislikes || []).map((d, i) => <span key={i} className="px-2 py-1 bg-red-500/5 border border-red-500/10 text-red-400 text-[8px] rounded uppercase">{d}</span>)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-8 select-text custom-scrollbar pr-6">
                            <div className="bg-black/40 p-8 rounded-2xl border border-slate-800 shadow-inner">
                                <h4 className="text-teal-500 font-black mb-4 uppercase flex items-center gap-2 italic"><BookOpen size={14}/> Behavioral_Bio</h4>
                                <p className="text-slate-300 text-sm leading-relaxed uppercase">{viewPersona?.archive?.bio}</p>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-teal-500 font-black uppercase flex items-center gap-2 italic"><History size={14}/> Life_Anecdotes</h4>
                                {(viewPersona?.archive?.anecdotes || []).map((a, i) => (
                                    <p key={i} className="p-5 bg-white/5 rounded-xl text-[11px] italic uppercase border border-white/5 hover:border-teal-900/30 transition-all">"{a}"</p>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* LEFT SIDEBAR: CORE CONTROLS */}
            <aside className="w-[260px] border-r border-slate-800 bg-black/60 p-8 flex flex-col gap-6 shrink-0 shadow-2xl">
                <div className="flex items-center gap-3 text-teal-500 font-black uppercase tracking-widest border-b border-teal-900/30 pb-4 italic"><Cpu size={18}/> Apex_Showrunner</div>
                <button onClick={sync} className="w-full p-4 border border-teal-900/30 text-teal-500 text-[10px] font-black uppercase hover:bg-teal-500 hover:text-black rounded transition-all flex items-center justify-center gap-2 italic"><Wifi size={14}/> Refresh Logic</button>
            </aside>

            {/* MAIN WORKSPACE */}
            <main className="flex-1 flex flex-col p-10 bg-[#0d0f11] relative overflow-hidden">
                <div className="flex gap-4 mb-8 border-b border-slate-800 pb-8 shrink-0 items-center">
                    <button onClick={() => { setActiveId(null); setViewLore(false); setActiveEp(null); }} className={`px-8 py-3 font-black text-[10px] uppercase transition-all rounded-lg ${!activeId ? 'bg-teal-500 text-black shadow-[0_0_20px_rgba(20,184,166,0.2)]' : 'bg-slate-800 hover:bg-slate-700'}`}>Library</button>
                    {activeId && (
                        <>
                            <ChevronRight size={18} className="text-slate-700"/>
                            <div className="flex-1 text-teal-500 font-black uppercase italic tracking-widest truncate text-lg">{activeSeason?.title}</div>
                            <button onClick={() => setViewLore(!viewLore)} className={`p-4 rounded-xl border flex items-center gap-2 uppercase text-[10px] font-black transition-all ${viewLore ? 'bg-teal-500 text-black border-teal-500' : 'border-slate-800 text-slate-500 hover:border-teal-500'}`}><History size={16}/> View Lore</button>
                        </>
                    )}
                </div>

                {!activeId ? (
                    <div className="grid grid-cols-2 gap-8 overflow-y-auto pr-4 custom-scrollbar">
                        {seasons.map(s => (
                            <div key={s.id} onClick={() => setActiveId(s.id)} className="bg-[#1c1f23] p-10 border border-slate-800 rounded-[2rem] cursor-pointer hover:border-teal-500 transition-all relative group shadow-2xl">
                                <button onClick={(e) => { e.stopPropagation(); deleteItem('season', s.id); }} className="absolute top-8 right-8 text-red-900 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={24}/></button>
                                <h4 className="text-white font-black uppercase italic text-2xl tracking-tighter">{s.title}</h4>
                                <div className="mt-3 flex items-center gap-3 text-teal-600 font-black uppercase text-[10px] italic">
                                    <span>{s.rel}</span>
                                    <span className="text-slate-800">|</span>
                                    <span>{s.episodes?.length || 0} Production Nodes</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col h-full gap-8 overflow-hidden">
                        {viewLore ? (
                            <div className="flex-1 bg-black/30 border border-slate-800 rounded-3xl p-10 overflow-y-auto custom-scrollbar space-y-6">
                                <h3 className="text-teal-500 font-black uppercase mb-6 flex items-center gap-2 border-b border-teal-900/20 pb-4 text-xl tracking-[0.2em] italic">Host Shared History</h3>
                                {activeSeason?.shared_history?.length > 0 ? (
                                    activeSeason.shared_history.map((lore, i) => (
                                        <div key={i} className="p-8 bg-slate-900/50 border border-slate-800 rounded-3xl text-slate-300 uppercase text-[12px] leading-relaxed italic shadow-xl"><span className="text-teal-500 font-black mr-3">HIST_NODE_{i+1}:</span> {lore}</div>
                                    ))
                                ) : (
                                    <div className="text-center p-20 text-slate-700 font-black uppercase italic tracking-widest">No shared history generated for this host pair.</div>
                                )}
                            </div>
                        ) : activeEp !== null ? (
                            <div className="flex-1 bg-black/30 border border-slate-800 rounded-[2.5rem] p-12 flex flex-col gap-8 overflow-hidden relative shadow-inner">
                                <button onClick={() => setActiveEp(null)} className="absolute top-8 right-12 text-slate-500 hover:text-white uppercase text-[10px] font-black italic tracking-[0.2em]">[ Exit_Node ]</button>
                                <div className="space-y-3 border-b border-slate-800 pb-8">
                                    <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter">{activeSeason.episodes[activeEp].title}</h3>
                                    <p className="text-teal-500 uppercase font-black text-[11px] tracking-[0.3em] italic">6-Act Sequential Script Production | {activeSeason.runtime}m Target</p>
                                </div>
                                <div className="flex-1 overflow-y-auto custom-scrollbar pr-6 space-y-10">
                                    {activeSeason.episodes[activeEp].full_script ? (
                                        <div className="bg-slate-950/80 p-12 rounded-3xl border border-teal-900/20 text-slate-300 uppercase text-[13px] leading-[2] whitespace-pre-wrap select-text italic shadow-2xl">{activeSeason.episodes[activeEp].full_script}</div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full gap-8">
                                            <FileText size={80} className="text-slate-800 animate-pulse" />
                                            <div className="text-center max-w-md space-y-4">
                                                <p className="text-slate-600 uppercase font-black text-[10px] tracking-widest leading-relaxed italic">No localized script found. Act-by-act generation will utilize host personality files and shared lore.</p>
                                                <button onClick={() => runProduction(activeEp)} className="px-12 py-5 bg-teal-500 text-black font-black uppercase text-[12px] rounded-2xl hover:bg-white transition-all shadow-[0_0_30px_rgba(20,184,166,0.3)]">Launch Sequential Generation</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 gap-6 overflow-y-auto pr-4 custom-scrollbar">
                                {activeSeason.episodes.map((e, idx) => (
                                    <div key={idx} onClick={() => setActiveEp(idx)} className="p-8 border border-slate-800 bg-slate-900/30 rounded-[2rem] hover:border-teal-500/50 cursor-pointer transition-all shadow-xl group h-fit">
                                        <div className="text-[10px] text-teal-800 font-black uppercase mb-3 tracking-widest italic group-hover:text-teal-500 transition-colors">ACT_NODE_{idx + 1}</div>
                                        <h5 className="text-white font-black uppercase italic text-lg mb-4 leading-tight">{e.title}</h5>
                                        <div className="space-y-2 border-t border-slate-800/50 pt-4">
                                            {Object.entries(e.act_outlines || {}).map(([num, act]) => (
                                                <div key={num} className="text-[9px] uppercase truncate text-slate-600 italic"><span className="text-slate-800 font-black mr-2">A{num}:</span> {act}</div>
                                            ))}
                                        </div>
                                        {e.full_script && <div className="mt-6 pt-4 border-t border-slate-800 text-teal-500 text-[10px] font-black uppercase italic flex items-center gap-2"><Zap size={12}/> Script Finalized</div>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* RIGHT SIDEBAR: IDENTITY & ARCHITECT */}
            <aside className="w-[380px] bg-black/60 p-10 border-l border-slate-800 overflow-y-auto shrink-0 flex flex-col gap-12 shadow-2xl custom-scrollbar">
                
                {/* IDENTITY SPAWN */}
                <div className="space-y-6">
                    <h3 className="text-teal-500 text-[11px] font-black uppercase border-b border-teal-900/30 pb-3 tracking-widest italic flex items-center gap-2"><UserPlus size={18}/> Identity Spawn</h3>
                    <input className="w-full bg-slate-900/50 p-5 border border-slate-800 text-white font-bold rounded-2xl outline-none focus:border-teal-500 uppercase text-sm" placeholder="SUBJECT NAME" value={nP.name} onChange={e => setNP({...nP, name: e.target.value})} />
                    <div className="grid grid-cols-2 gap-4">
                        <select className="bg-slate-900/50 p-4 border border-slate-800 text-teal-500 rounded-2xl outline-none uppercase text-[10px] font-black cursor-pointer" value={nP.gender} onChange={e => setNP({...nP, gender: e.target.value})}>{CONFIG.G.map(g => <option key={g} value={g}>{g}</option>)}</select>
                        <select className="bg-slate-900/50 p-4 border border-slate-800 text-teal-500 rounded-2xl outline-none uppercase text-[10px] font-black cursor-pointer" value={nP.trauma} onChange={e => setNP({...nP, trauma: e.target.value})}>{CONFIG.T.map(t => <option key={t} value={t}>{t}</option>)}</select>
                    </div>
                    <input className="w-full bg-slate-900/50 p-4 border border-slate-800 text-slate-400 rounded-2xl outline-none uppercase text-[10px] font-black" placeholder="ASSIGNED ROLE (e.g. Hacker, Investigator)" value={nP.role} onChange={e => setNP({...nP, role: e.target.value})} />
                    <button onClick={async () => { setLoad(true); setStatus("Committing DNA Sequence..."); await fetch(`${BASE_URL}/persona/create`, {method:'POST', mode:'cors', headers:{'Content-Type':'application/json'}, body:JSON.stringify(nP)}); await sync(); setStatus(""); }} disabled={!nP.name || load} className="w-full py-6 bg-teal-500 text-black font-black uppercase text-[12px] rounded-[1.5rem] hover:bg-white transition-all shadow-2xl shadow-teal-500/20 disabled:opacity-30">Commit Subject DNA</button>
                    
                    <div className="flex flex-wrap gap-4 pt-6 border-t border-slate-900">
                        {personas.map(p => (
                            <div key={p.id} className="relative group">
                                <img src={p.portrait} onClick={() => setViewPersona(p)} className="w-16 h-16 rounded-2xl border-2 border-slate-800 hover:border-teal-500 cursor-pointer bg-black shadow-xl transition-all hover:scale-105" alt="p" />
                                <button onClick={() => deleteItem('persona', p.id)} className="absolute -top-3 -right-3 bg-red-600 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all shadow-xl hover:bg-red-500"><Trash2 size={12}/></button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* SEASON ARCHITECT */}
                <div className="space-y-6 border-t border-slate-800 pt-10">
                    <h3 className="text-teal-500 text-[11px] font-black uppercase border-b border-teal-900/30 pb-3 tracking-widest italic flex items-center gap-2"><Archive size={18}/> Season Architect</h3>
                    <input className="w-full bg-slate-900/50 p-5 border border-slate-800 text-white font-bold rounded-2xl outline-none focus:border-teal-500 uppercase text-sm" placeholder="RESEARCH TOPIC" value={nS.topic} onChange={e => setNS({...nS, topic: e.target.value})} />
                    <select className="w-full bg-slate-900/50 p-5 border border-slate-800 text-teal-400 rounded-2xl outline-none uppercase text-[11px] font-black cursor-pointer" value={nS.relationship} onChange={e => setNS({...nS, relationship: e.target.value})}>{CONFIG.D.map(d => <option key={d} value={d}>{d}</option>)}</select>
                    
                    <div className="space-y-6 p-8 bg-black/40 rounded-[2rem] border border-slate-800">
                        <div className="space-y-3">
                            <div className="flex justify-between text-[10px] font-black uppercase italic text-slate-500">
                                <span>Production Nodes</span>
                                <span className="text-teal-500">{nS.episodes_count} Episodes</span>
                            </div>
                            <input type="range" min="1" max="24" className="w-full accent-teal-500 h-1 bg-slate-800 rounded-full" value={nS.episodes_count} onChange={e => setNS({...nS, episodes_count: parseInt(e.target.value)})} />
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between text-[10px] font-black uppercase italic text-slate-500">
                                <span>Runtime Gravity</span>
                                <span className="text-teal-500">{nS.target_runtime} Minutes</span>
                            </div>
                            <input type="range" min="5" max="60" step="5" className="w-full accent-teal-500 h-1 bg-slate-800 rounded-full" value={nS.target_runtime} onChange={e => setNS({...nS, target_runtime: parseInt(e.target.value)})} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 max-h-40 overflow-y-auto p-4 bg-black/20 rounded-2xl border border-slate-800 custom-scrollbar">
                        {personas.map(p => (
                            <button key={p.id} onClick={() => { 
                                const ids = nS.host_ids.includes(p.id) ? nS.host_ids.filter(x => x !== p.id) : [...nS.host_ids, p.id]; 
                                setNS({...nS, host_ids: ids.slice(0, 2)}); 
                            }} className={`p-4 text-[9px] font-black border truncate uppercase rounded-2xl transition-all ${nS.host_ids.includes(p.id) ? 'border-teal-500 text-teal-400 bg-teal-500/10 shadow-[0_0_15px_rgba(20,184,166,0.1)]' : 'border-slate-800 text-slate-600 hover:border-slate-700'}`}>{p.name}</button>
                        ))}
                    </div>
                    <button onClick={createSeason} disabled={nS.host_ids.length !== 2 || !nS.topic || load} className="w-full py-6 bg-teal-500 text-black font-black uppercase text-[12px] rounded-[1.5rem] hover:bg-white transition-all shadow-2xl disabled:opacity-30">Establish Season Arc</button>
                </div>
            </aside>
        </div>
    );
};

export default App;
