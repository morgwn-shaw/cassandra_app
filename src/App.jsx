import React, { useState, useEffect, useCallback } from 'react';
import { Trash2, Loader2, UserPlus, Wifi, Cpu, X, Archive, BookOpen, History, ChevronRight, PlayCircle, FileText } from 'lucide-react';

const BASE_URL = "https://shadow-cassandrafiles.pythonanywhere.com/api/v2";
const CONFIG = {
    G: ["Male", "Female", "Non-Binary", "Fluid"],
    D: ["Unresolved Sexual Tension", "Mentor / Mentee", "Enemies", "Frenemies", "Grudging Respect", "Buddy Cop"],
    T: ["Neural Betrayal.", "Identity Wiped.", "None", "Exposed laundering ring."]
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
            setPersonas(await resP.json());
            setSeasons(await resS.json());
        } catch (e) { console.error(e); }
        finally { setLoad(false); }
    }, []);

    useEffect(() => { sync(); }, [sync]);

    const createSeason = async () => {
        setLoad(true); setStatus("Establishing Season...");
        try {
            const r = await fetch(`${BASE_URL}/season/reconcile`, {
                method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(nS)
            });
            const s = await r.json();
            setStatus("Syncing Shared Lore...");
            await fetch(`${BASE_URL}/season/lore`, {
                method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ season_id: s.id })
            });
            await sync();
        } catch (e) { alert(e.message); }
        finally { setLoad(false); setStatus(""); }
    };

    const genScript = async (idx) => {
        setLoad(true); setStatus("Writing 6-Act Script...");
        try {
            await fetch(`${BASE_URL}/episode/script`, {
                method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ season_id: activeId, node_index: idx })
            });
            await sync();
        } catch (e) { alert(e.message); }
        finally { setLoad(false); setStatus(""); }
    };

    const activeSeason = seasons.find(x => x.id === activeId);

    return (
        <div className="h-screen w-screen font-mono flex bg-[#0a0c0e] text-slate-400 overflow-hidden text-[12px] select-none">
            {load && (
                <div className="fixed inset-0 bg-black/80 z-[300] flex flex-col items-center justify-center backdrop-blur-md">
                    <Loader2 className="animate-spin text-teal-500 mb-4" size={48}/>
                    <div className="text-teal-500 font-black uppercase tracking-widest">{status}</div>
                </div>
            )}

            {/* PERSONA DOSSIER */}
            {viewPersona && (
                <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-12 backdrop-blur-3xl" onClick={() => setViewPersona(null)}>
                    <div className="bg-[#0d0f11] w-full max-w-5xl h-[80vh] border border-teal-900/40 rounded-3xl p-10 flex gap-10 overflow-hidden relative" onClick={e => e.stopPropagation()}>
                        <div className="w-[250px] space-y-4">
                            <img src={viewPersona.portrait} className="w-full rounded-xl border border-teal-900/20 bg-black" />
                            <h2 className="text-2xl font-black text-white uppercase italic">{viewPersona.name}</h2>
                            <div className="text-teal-500 font-black uppercase text-[10px]">{viewPersona.mbti}</div>
                            <div className="text-[9px] uppercase p-2 bg-red-950/20 border border-red-900/30 text-red-500 rounded">Trauma: {viewPersona.trauma}</div>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6 pr-4">
                            <div className="p-6 bg-black/40 border border-slate-800 rounded-xl">
                                <h4 className="text-teal-500 font-black mb-2 uppercase italic text-[10px]">Behavioral_Bio</h4>
                                <p className="text-slate-300 uppercase leading-relaxed">{viewPersona.archive.bio}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 border border-teal-900/20 rounded-xl bg-teal-500/5">
                                    <h5 className="text-teal-500 font-black mb-2 uppercase text-[9px]">Likes</h5>
                                    <div className="flex flex-wrap gap-1">{(viewPersona.archive.likes || []).map(l => <span className="px-2 py-1 bg-black/40 rounded text-[8px] uppercase">{l}</span>)}</div>
                                </div>
                                <div className="p-4 border border-red-900/20 rounded-xl bg-red-500/5">
                                    <h5 className="text-red-500 font-black mb-2 uppercase text-[9px]">Dislikes</h5>
                                    <div className="flex flex-wrap gap-1">{(viewPersona.archive.dislikes || []).map(d => <span className="px-2 py-1 bg-black/40 rounded text-[8px] uppercase">{d}</span>)}</div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-teal-500 font-black uppercase text-[10px]">History_Anecdotes</h4>
                                {viewPersona.archive.anecdotes.map((a, i) => <p key={i} className="p-3 bg-white/5 rounded text-[10px] uppercase italic border border-white/5">{a}</p>)}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <aside className="w-[260px] border-r border-slate-800 bg-black/60 p-8 flex flex-col gap-6 shrink-0 shadow-2xl">
                <div className="flex items-center gap-3 text-teal-500 font-black uppercase italic tracking-widest border-b border-teal-900/30 pb-4"><Cpu size={16}/> Apex_Showrunner</div>
                <button onClick={sync} className="w-full p-4 border border-teal-900/30 text-teal-500 text-[10px] font-black uppercase hover:bg-teal-500 hover:text-black rounded transition-all italic flex items-center justify-center gap-2"><Wifi size={14}/> Sync Data</button>
            </aside>

            <main className="flex-1 flex flex-col p-10 bg-[#0d0f11] relative overflow-hidden">
                <div className="flex gap-4 mb-6 border-b border-slate-800 pb-6 shrink-0 items-center">
                    <button onClick={() => { setActiveId(null); setViewLore(false); setActiveEp(null); }} className={`px-8 py-3 font-black text-[10px] uppercase transition-all rounded-lg ${!activeId ? 'bg-teal-500 text-black' : 'bg-slate-800'}`}>Library</button>
                    {activeId && (
                        <>
                            <ChevronRight size={16} className="text-slate-700"/>
                            <div className="flex-1 text-teal-500 font-black uppercase italic tracking-widest truncate">{activeSeason?.title}</div>
                            <button onClick={() => setViewLore(!viewLore)} className={`p-3 rounded-lg border flex items-center gap-2 uppercase text-[10px] font-black ${viewLore ? 'bg-teal-500 text-black border-teal-500' : 'border-slate-800 text-slate-500'}`}><History size={14}/> Lore</button>
                        </>
                    )}
                </div>

                {!activeId ? (
                    <div className="grid grid-cols-2 gap-6 overflow-y-auto pr-4 custom-scrollbar">
                        {seasons.map(s => (
                            <div key={s.id} onClick={() => setActiveId(s.id)} className="bg-[#1c1f23] p-8 border border-slate-800 rounded-3xl cursor-pointer hover:border-teal-500 transition-all relative group h-fit">
                                <button onClick={(e) => { e.stopPropagation(); fetch(`${BASE_URL}/delete/season/${s.id}`, {method:'DELETE'}).then(sync); }} className="absolute top-6 right-6 text-red-900 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={20}/></button>
                                <h4 className="text-white font-black uppercase italic text-xl tracking-tighter">{s.title}</h4>
                                <div className="mt-2 text-teal-600 font-black uppercase text-[10px] italic">{s.rel} | {s.episodes.length} Episodes</div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col h-full gap-6 overflow-hidden">
                        {viewLore ? (
                            <div className="flex-1 bg-black/30 border border-slate-800 rounded-3xl p-8 overflow-y-auto custom-scrollbar space-y-4">
                                {(activeSeason?.shared_history || []).map((lore, i) => (
                                    <div key={i} className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl text-slate-300 uppercase text-[11px] leading-relaxed italic"><span className="text-teal-500 font-black mr-2">HISTORY_LOG_{i+1}:</span> {lore}</div>
                                ))}
                            </div>
                        ) : activeEp !== null ? (
                            <div className="flex-1 bg-black/30 border border-slate-800 rounded-3xl p-10 flex flex-col gap-6 overflow-hidden relative">
                                <button onClick={() => setActiveEp(null)} className="absolute top-6 right-6 text-slate-500 hover:text-white uppercase text-[10px] font-black italic">[ Back_to_Season ]</button>
                                <div className="space-y-2 border-b border-slate-800 pb-6">
                                    <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">{activeSeason.episodes[activeEp].title}</h3>
                                    <p className="text-teal-500 uppercase font-black text-[10px] tracking-widest italic">Node_{activeEp + 1} | 6-Act Production</p>
                                </div>
                                <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 space-y-8">
                                    {activeSeason.episodes[activeEp].script ? (
                                        <div className="bg-slate-900/50 p-8 rounded-2xl border border-teal-900/20 text-slate-300 uppercase text-[12px] leading-[1.8] whitespace-pre-wrap select-text">{activeSeason.episodes[activeEp].script}</div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full gap-6">
                                            <FileText size={64} className="text-slate-800" />
                                            <button onClick={() => genScript(activeEp)} className="px-10 py-4 bg-teal-500 text-black font-black uppercase text-[11px] rounded-xl hover:bg-white transition-all shadow-xl shadow-teal-500/20">Generate Script Dialogue</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 gap-4 overflow-y-auto pr-4 custom-scrollbar">
                                {activeSeason.episodes.map((e, idx) => (
                                    <div key={idx} onClick={() => setActiveEp(idx)} className="p-6 border border-slate-800 bg-slate-900/30 rounded-2xl hover:border-teal-500/50 cursor-pointer transition-all shadow-xl group">
                                        <div className="text-[9px] text-teal-700 font-black uppercase mb-2">Episode_{idx + 1}</div>
                                        <h5 className="text-white font-black uppercase italic text-sm mb-3 group-hover:text-teal-500 transition-colors">{e.title}</h5>
                                        <div className="space-y-1">
                                            {Object.entries(e.acts || {}).map(([num, act]) => <div key={num} className="text-[8px] uppercase truncate text-slate-600">Act_{num}: {act}</div>)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* SIDEBAR TOOLS */}
            <aside className="w-[380px] bg-black/60 p-10 border-l border-slate-800 overflow-y-auto shrink-0 flex flex-col gap-10 shadow-2xl custom-scrollbar">
                <div className="space-y-6">
                    <h3 className="text-teal-500 text-[11px] font-black uppercase border-b border-teal-900/30 pb-2 tracking-widest italic">Identity Spawn</h3>
                    <input className="w-full bg-slate-900/50 p-4 border border-slate-800 text-white font-bold rounded-xl outline-none focus:border-teal-500 uppercase" placeholder="NAME" value={nP.name} onChange={e => setNP({...nP, name: e.target.value})} />
                    <div className="grid grid-cols-2 gap-3">
                        <select className="bg-slate-900/50 p-4 border border-slate-800 text-teal-500 rounded-xl outline-none uppercase text-[10px]" value={nP.gender} onChange={e => setNP({...nP, gender: e.target.value})}>{CONFIG.G.map(g => <option key={g} value={g}>{g}</option>)}</select>
                        <select className="bg-slate-900/50 p-4 border border-slate-800 text-teal-500 rounded-xl outline-none uppercase text-[10px]" value={nP.trauma} onChange={e => setNP({...nP, trauma: e.target.value})}>{CONFIG.T.map(t => <option key={t} value={t}>{t}</option>)}</select>
                    </div>
                    <button onClick={async () => { setLoad(true); await fetch(`${BASE_URL}/persona/create`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(nP)}); sync(); }} className="w-full py-5 bg-teal-500 text-black font-black uppercase text-[11px] rounded-2xl hover:bg-white transition-all shadow-2xl">Commit DNA</button>
                    <div className="flex flex-wrap gap-3 pt-4">
                        {personas.map(p => <img key={p.id} src={p.portrait} onClick={() => setViewPersona(p)} className="w-12 h-12 rounded-xl border border-slate-800 hover:border-teal-500 cursor-pointer bg-black" />)}
                    </div>
                </div>

                <div className="space-y-6 border-t border-slate-800 pt-8">
                    <h3 className="text-teal-500 text-[11px] font-black uppercase border-b border-teal-900/30 pb-2 tracking-widest italic">Season Architect</h3>
                    <input className="w-full bg-slate-900/50 p-4 border border-slate-800 text-white font-bold rounded-xl outline-none focus:border-teal-500 uppercase" placeholder="CORE_TOPIC" value={nS.topic} onChange={e => setNS({...nS, topic: e.target.value})} />
                    <select className="w-full bg-slate-900/50 p-4 border border-slate-800 text-teal-400 rounded-xl outline-none uppercase text-[10px]" value={nS.relationship} onChange={e => setNS({...nS, relationship: e.target.value})}>{CONFIG.D.map(d => <option key={d} value={d}>{d}</option>)}</select>
                    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 bg-black/20 rounded-xl border border-slate-800">
                        {personas.map(p => (
                            <button key={p.id} onClick={() => { const ids = nS.host_ids.includes(p.id) ? nS.host_ids.filter(x => x !== p.id) : [...nS.host_ids, p.id]; setNS({...nS, host_ids: ids.slice(0, 2)}); }} className={`p-2 text-[8px] font-black border truncate uppercase rounded-md transition-all ${nS.host_ids.includes(p.id) ? 'border-teal-500 text-teal-400 bg-teal-500/10' : 'border-slate-800 text-slate-500'}`}>{p.name}</button>
                        ))}
                    </div>
                    <button onClick={createSeason} disabled={nS.host_ids.length !== 2 || !nS.topic || load} className="w-full py-5 bg-teal-500 text-black font-black uppercase text-[11px] rounded-2xl hover:bg-white transition-all shadow-2xl">Establish Season</button>
                </div>
            </aside>
        </div>
    );
};

export default App;
