import React, { useState, useEffect, useCallback } from 'react';
import { Trash2, Loader2, UserPlus, Wifi, Cpu, X, Archive, Clock, Layers, RefreshCw, ChevronRight, BookOpen, History } from 'lucide-react';

const BASE_URL = "https://shadow-cassandrafiles.pythonanywhere.com/api/v2";

const CONFIG = {
    G: ["Male", "Female", "Non-Binary", "Fluid"],
    D: ["Unresolved Sexual Tension", "Mentor / Mentee", "Enemies", "Frenemies", "Grudging Respect", "Buddy Cop", "Bitter Rivals", "Strategic Alliance"],
    T: ["Witnessed server farm bleed-out.", "Neural Betrayal.", "Identity Wiped.", "None", "Exposed laundering ring."]
};

const App = () => {
    const [activeId, setActiveId] = useState(null); 
    const [viewPersona, setViewPersona] = useState(null); 
    const [viewLore, setViewLore] = useState(false);
    const [seasons, setSeasons] = useState([]);
    const [personas, setPersonas] = useState([]);
    const [load, setLoad] = useState(false);

    // Form States
    const [nP, setNP] = useState({ name: '', role: 'Analyst', trauma: CONFIG.T[0], gender: 'Male' });
    const [nS, setNS] = useState({ topic: '', relationship: CONFIG.D[0], host_ids: [], episodes_count: 10, target_runtime: 15 });

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

    const run = async (path, body) => {
        setLoad(true);
        try {
            const r = await fetch(BASE_URL + path, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const d = await r.json();
            if (!r.ok) throw new Error(d.error || 'Server logic failure');
            await sync(); 
            return d;
        } catch (e) {
            console.error("ACTION_ERR", e);
            window.alert(`CRITICAL_FAIL: ${e.message}`);
        } finally { setLoad(false); }
    };

    const deleteItem = async (type, id) => {
        if (!window.confirm(`Purge this ${type} from memory?`)) return;
        setLoad(true);
        try {
            await fetch(`${BASE_URL}/delete/${type}/${id}`, { method: 'DELETE' });
            await sync();
            if (activeId === id) setActiveId(null);
        } catch (e) { console.error("DELETE_ERR", e); }
        finally { setLoad(false); }
    };

    const activeSeason = seasons.find(x => x.id === activeId);

    return (
        <div className="h-screen w-screen font-mono flex bg-[#0a0c0e] text-slate-400 overflow-hidden text-[12px] select-none">
            
            {/* OVERLAY: Persona Dossier */}
            {viewPersona && (
                <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-20 backdrop-blur-3xl" onClick={() => setViewPersona(null)}>
                    <div className="bg-[#0d0f11] w-full h-full border border-teal-900/40 rounded-3xl p-12 flex gap-12 overflow-hidden relative shadow-2xl" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setViewPersona(null)} className="absolute top-8 right-8 text-slate-500 hover:text-white"><X size={32}/></button>
                        <div className="w-[300px] shrink-0 space-y-6 text-center">
                            <img src={viewPersona?.portrait} className="w-full aspect-square rounded-2xl border border-teal-900/20 bg-black shadow-2xl" alt="p" />
                            <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">{viewPersona?.name}</h2>
                            <div className="inline-block px-4 py-2 bg-teal-500/10 border border-teal-500/30 text-teal-500 rounded-full text-[10px] font-black uppercase tracking-widest">{viewPersona?.mbti}</div>
                            <div className="p-4 bg-red-950/20 border border-red-900/30 text-red-500 rounded-xl text-[9px] uppercase font-black italic">Trauma: {viewPersona?.trauma}</div>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-8 select-text custom-scrollbar pr-6">
                            <div className="bg-black/40 p-8 rounded-2xl border border-slate-800 shadow-inner">
                                <h4 className="text-teal-500 font-black mb-4 uppercase flex items-center gap-2"><BookOpen size={14}/> Behavioral Summary</h4>
                                <p className="text-slate-300 text-sm leading-relaxed uppercase">{viewPersona?.archive?.bio}</p>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-teal-500 font-black uppercase flex items-center gap-2"><History size={14}/> Historical Anecdotes</h4>
                                {(viewPersona?.archive?.anecdotes || []).map((a, i) => (
                                    <p key={i} className="p-5 bg-white/5 rounded-xl text-[11px] italic uppercase border border-white/5 hover:border-teal-900/40 transition-all">"{a}"</p>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* SIDEBAR: NAVIGATION */}
            <aside className="w-[260px] border-r border-slate-800 bg-black/60 p-8 flex flex-col gap-6 shrink-0 shadow-2xl">
                <div className="flex items-center gap-3 text-teal-500 font-black uppercase tracking-widest border-b border-teal-900/30 pb-4 italic"><Cpu size={16}/> Apex_v168.1</div>
                <button onClick={sync} className="w-full p-4 border border-teal-900/30 text-teal-500 text-[10px] font-black uppercase hover:bg-teal-500 hover:text-black rounded transition-all shadow-lg shadow-teal-500/10 flex items-center justify-center gap-2">
                    <Wifi size={14}/> Sync Data
                </button>
            </aside>

            {/* MAIN WORKSPACE */}
            <main className="flex-1 flex flex-col p-10 bg-[#0d0f11] relative overflow-hidden">
                {load && <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center backdrop-blur-sm"><Loader2 className="animate-spin text-teal-500" size={48}/></div>}
                
                <div className="flex gap-4 mb-6 border-b border-slate-800 pb-6 shrink-0 items-center">
                    <button onClick={() => { setActiveId(null); setViewLore(false); }} className={`px-8 py-3 font-black text-[10px] uppercase transition-all rounded-lg ${!activeId ? 'bg-teal-500 text-black shadow-lg shadow-teal-500/20' : 'bg-slate-800 hover:bg-slate-700'}`}>Library</button>
                    {activeId && (
                        <>
                            <ChevronRight size={16} className="text-slate-700"/>
                            <div className="flex-1 text-teal-500 font-black uppercase flex items-center gap-4 italic truncate tracking-widest">
                                <span>{activeSeason?.title}</span>
                            </div>
                            <button onClick={() => setViewLore(!viewLore)} className={`p-3 rounded-lg border transition-all flex items-center gap-2 uppercase text-[10px] font-black ${viewLore ? 'bg-teal-500 text-black border-teal-500' : 'border-slate-800 text-slate-500 hover:border-teal-500'}`}>
                                <History size={14}/> Shared Lore
                            </button>
                        </>
                    )}
                </div>

                {!activeId ? (
                    <div className="grid grid-cols-2 gap-6 overflow-y-auto pr-4 custom-scrollbar">
                        {seasons.map(s => (
                            <div key={s.id} onClick={() => setActiveId(s.id)} className="bg-[#1c1f23] p-8 border border-slate-800 rounded-3xl cursor-pointer hover:border-teal-500 transition-all relative h-fit shadow-xl group">
                                <button onClick={(e) => { e.stopPropagation(); deleteItem('season', s.id); }} className="absolute top-6 right-6 text-red-900 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"><Trash2 size={20}/></button>
                                <h4 className="text-white font-black uppercase italic text-xl tracking-tighter">{s.title}</h4>
                                <div className="mt-2 flex items-center gap-2 text-teal-600 font-black uppercase text-[10px] italic">
                                    <span>{s.rel}</span>
                                    <span className="text-slate-800">|</span>
                                    <span>{s.episodes?.length || 0} Nodes</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col h-full gap-6 overflow-hidden">
                        {viewLore ? (
                            <div className="flex-1 bg-black/30 border border-slate-800 rounded-3xl p-8 overflow-y-auto custom-scrollbar">
                                <h3 className="text-teal-500 font-black uppercase mb-6 flex items-center gap-2 border-b border-teal-900/20 pb-4 italic underline underline-offset-8 decoration-teal-500/30 text-lg tracking-widest">Shared History Log</h3>
                                <div className="space-y-4">
                                    {(activeSeason?.shared_history || []).map((lore, i) => (
                                        <div key={i} className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl text-slate-300 uppercase text-[11px] leading-relaxed shadow-lg">
                                            <span className="text-teal-500 font-black mr-2">LOG_{i+1}:</span> {lore}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 gap-4 overflow-y-auto pr-4 custom-scrollbar">
                                {activeSeason?.episodes?.map((e, idx) => (
                                    <div key={idx} className="p-6 border border-slate-800 bg-slate-900/30 text-slate-400 rounded-2xl hover:border-teal-500/50 transition-all shadow-xl group">
                                        <div className="text-[9px] text-teal-700 font-black uppercase mb-2 group-hover:text-teal-500 transition-colors">ACT_NODE_{e.node}</div>
                                        <h5 className="text-white font-black uppercase italic text-sm mb-3">{e.title}</h5>
                                        <p className="text-[10px] leading-relaxed uppercase line-clamp-3 text-slate-500 group-hover:text-slate-400 transition-colors">{e.summary}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* SIDEBAR: TOOLS */}
            <aside className="w-[380px] bg-black/60 p-10 border-l border-slate-800 overflow-y-auto shrink-0 flex flex-col gap-10 shadow-2xl custom-scrollbar">
                
                {/* PERSONA SPAWN */}
                <div className="space-y-6">
                    <h3 className="text-teal-500 text-[11px] font-black uppercase flex items-center gap-2 border-b border-teal-900/30 pb-2 tracking-widest"><UserPlus size={18}/> Identity Spawn</h3>
                    <input className="w-full bg-slate-900/50 p-4 border border-slate-800 text-white font-bold rounded-xl outline-none focus:border-teal-500 uppercase" placeholder="NAME" value={nP.name} onChange={e => setNP({...nP, name: e.target.value})} />
                    <div className="grid grid-cols-2 gap-3">
                        <select className="bg-slate-900/50 p-4 border border-slate-800 text-teal-500 rounded-xl outline-none text-[10px] uppercase font-black" value={nP.gender} onChange={e => setNP({...nP, gender: e.target.value})}>{CONFIG.G.map(g => <option key={g} value={g}>{g}</option>)}</select>
                        <select className="bg-slate-900/50 p-4 border border-slate-800 text-teal-500 rounded-xl outline-none text-[10px] uppercase font-black" value={nP.trauma} onChange={e => setNP({...nP, trauma: e.target.value})}>{CONFIG.T.map(t => <option key={t} value={t}>{t}</option>)}</select>
                    </div>
                    <input className="w-full bg-slate-900/50 p-4 border border-slate-800 text-slate-400 rounded-xl outline-none uppercase text-[10px] font-black" placeholder="CORE_ROLE" value={nP.role} onChange={e => setNP({...nP, role: e.target.value})} />
                    <button onClick={() => run('/persona/create', nP)} disabled={!nP.name || load} className="w-full py-5 bg-teal-500 text-black font-black uppercase text-[11px] rounded-2xl hover:bg-white transition-all shadow-2xl shadow-teal-500/20 disabled:opacity-30 flex items-center justify-center gap-2">
                        Commit DNA
                    </button>
                    
                    <div className="flex flex-wrap gap-3 pt-6 border-t border-slate-900">
                        {personas.map(p => (
                            <div key={p.id} className="relative group">
                                <img src={p.portrait} onClick={() => setViewPersona(p)} className="w-14 h-14 rounded-2xl border-2 border-slate-800 hover:border-teal-500 cursor-pointer bg-black transition-all shadow-xl" alt="p" />
                                <button onClick={() => deleteItem('persona', p.id)} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:scale-110 active:scale-90"><Trash2 size={10}/></button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* SEASON ARCHITECT */}
                <div className="space-y-6 border-t border-slate-800 pt-8">
                    <h3 className="text-teal-500 text-[11px] font-black uppercase flex items-center gap-2 border-b border-teal-900/30 pb-2 tracking-widest"><Archive size={18}/> Establish Season</h3>
                    <input className="w-full bg-slate-900/50 p-4 border border-slate-800 text-white font-bold rounded-xl outline-none focus:border-teal-500 uppercase" placeholder="CORE_TOPIC" value={nS.topic} onChange={e => setNS({...nS, topic: e.target.value})} />
                    <select className="w-full bg-slate-900/50 p-4 border border-slate-800 text-teal-400 rounded-xl outline-none uppercase text-[10px] font-black" value={nS.relationship} onChange={e => setNS({...nS, relationship: e.target.value})}>{CONFIG.D.map(d => <option key={d} value={d}>{d}</option>)}</select>
                    
                    <div className="space-y-5 p-6 bg-black/20 rounded-2xl border border-slate-800">
                        <div className="space-y-2">
                            <div className="flex justify-between text-[9px] font-black uppercase italic text-slate-500">
                                <span>Nodes (Episodes)</span>
                                <span className="text-teal-500">{nS.episodes_count}</span>
                            </div>
                            <input type="range" min="1" max="24" className="w-full accent-teal-500 h-1" value={nS.episodes_count} onChange={e => setNS({...nS, episodes_count: parseInt(e.target.value)})} />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-[9px] font-black uppercase italic text-slate-500">
                                <span>Target Runtime</span>
                                <span className="text-teal-500">{nS.target_runtime}m</span>
                            </div>
                            <input type="range" min="5" max="60" step="5" className="w-full accent-teal-500 h-1" value={nS.target_runtime} onChange={e => setNS({...nS, target_runtime: parseInt(e.target.value)})} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 bg-black/20 rounded-xl border border-slate-800 custom-scrollbar">
                        {personas.map(p => (
                            <button key={p.id} onClick={() => { 
                                const ids = nS.host_ids.includes(p.id) ? nS.host_ids.filter(x => x !== p.id) : [...nS.host_ids, p.id]; 
                                setNS({...nS, host_ids: ids.slice(0, 2)}); 
                            }} className={`p-3 text-[8px] font-black border truncate uppercase rounded-xl transition-all ${nS.host_ids.includes(p.id) ? 'border-teal-500 text-teal-400 bg-teal-500/10 shadow-[0_0_15px_rgba(20,184,166,0.1)]' : 'border-slate-800 text-slate-500 hover:border-slate-600'}`}>{p.name}</button>
                        ))}
                    </div>
                    <button onClick={() => run('/season/reconcile', nS)} disabled={nS.host_ids.length !== 2 || !nS.topic || load} className="w-full py-5 bg-teal-500 text-black font-black uppercase text-[11px] rounded-2xl hover:bg-white transition-all shadow-2xl disabled:opacity-30">Establish Season</button>
                </div>
            </aside>
        </div>
    );
};

export default App;
