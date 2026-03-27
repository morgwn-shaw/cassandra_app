import React, { useState, useEffect, useCallback } from 'react';
import { Trash2, Loader2, UserPlus, Wifi, Cpu, RefreshCw, X, Archive, BookOpen, Mic, Copy, Clock, Layers, Music, PlayCircle } from 'lucide-react';

const BASE_URL = "https://shadow-cassandrafiles.pythonanywhere.com/api/v2";

const CONFIG = {
    G: ["Male", "Female", "Non-Binary", "Fluid"],
    D: ["Unresolved Sexual Tension", "Mentor / Mentee", "Enemies", "Frenemies", "Grudging Respect", "Buddy Cop", "Bitter Rivals", "Strategic Alliance"],
    EXAMPLES: [
        "A hyper-fixated conspiracy theorist who thinks birds are government drones.",
        "A former corporate spy who now reviews kitchen appliances with extreme intensity.",
        "A bored billionaire who bought a podcast kit to feel 'relatable'."
    ]
};

const App = () => {
    const [activeId, setActiveId] = useState(null); 
    const [activeEpIdx, setActiveEpIdx] = useState(null);
    const [viewPersona, setViewPersona] = useState(null); 
    const [seasons, setSeasons] = useState([]);
    const [personas, setPersonas] = useState([]);
    const [load, setLoad] = useState(false);
    const [terminalMode, setTerminalMode] = useState('brief');

    const [nP, setNP] = useState({ name: '', role: 'Forensic Analyst', description: '', gender: 'Male' });
    const [nS, setNS] = useState({ topic: '', relationship: CONFIG.D[0], host_ids: [], episodes_count: 10, target_runtime: 15 });

    const sync = useCallback(async () => {
        try {
            const s = await fetch(`${BASE_URL}/season/list`);
            const p = await fetch(`${BASE_URL}/persona/list`);
            if (s.ok) { 
                setSeasons(await s.json()); 
                setPersonas(await p.json()); 
            }
        } catch (e) { console.error("Sync Failure"); }
    }, []);

    useEffect(() => { sync(); }, [sync]);

    const run = async (path, body) => {
        setLoad(true); try {
            const r = await fetch(BASE_URL + path, {
                method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body)
            });
            const d = await r.json(); await sync(); return d;
        } catch (e) { window.alert(`FAIL: ${e.message}`); } finally { setLoad(false); }
    };

    const activeSeason = seasons.find(x => x.id === activeId);
    const activeEp = activeSeason?.episodes && activeEpIdx !== null ? activeSeason.episodes[activeEpIdx] : null;

    const getMasterScript = () => {
        if (!activeEp?.acts) return [];
        return Object.keys(activeEp.acts).sort().map(k => activeEp.acts[k]).flat();
    };

    return (
        <div className="h-screen w-screen font-mono flex bg-[#0a0c0e] text-slate-400 overflow-hidden text-[12px] select-none">
            {viewPersona && (
                <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-20 backdrop-blur-3xl" onClick={() => setViewPersona(null)}>
                    <div className="bg-[#0d0f11] w-full h-full border border-teal-900/40 rounded-3xl p-12 flex gap-12 overflow-hidden relative" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setViewPersona(null)} className="absolute top-8 right-8 text-slate-500 hover:text-white"><X size={32}/></button>
                        <div className="w-[300px] shrink-0 space-y-6">
                            <img src={viewPersona?.portrait} className="w-full aspect-square rounded-2xl border border-teal-900/20 bg-black object-cover" />
                            <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">{viewPersona?.name}</h2>
                        </div>
                        <div className="flex-1 overflow-y-auto pr-6 space-y-8 select-text">
                            <div className="bg-black/40 p-8 rounded-2xl border border-slate-800"><p className="text-slate-300 text-sm leading-relaxed uppercase">{viewPersona?.archive?.bio}</p></div>
                            <div className="p-4 bg-white/5 rounded-xl text-slate-500 uppercase italic">"{viewPersona?.description}"</div>
                        </div>
                    </div>
                </div>
            )}

            <aside className="w-[260px] border-r border-slate-800 bg-black/60 p-8 flex flex-col gap-6 shrink-0 shadow-2xl">
                <div className="flex items-center gap-3 text-teal-500 font-black uppercase tracking-widest border-b border-teal-900/30 pb-4"><Cpu size={16}/> Apex_v166.0</div>
                <button onClick={sync} className="w-full p-4 border border-teal-900/30 text-teal-500 text-[10px] font-black uppercase hover:bg-teal-500 hover:text-black rounded transition-all"><Wifi size={14}/> Sync Data</button>
            </aside>

            <main className="flex-1 flex flex-col p-10 bg-[#0d0f11] relative overflow-hidden">
                {load && <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center backdrop-blur-sm"><Loader2 className="animate-spin text-teal-500" size={48}/></div>}
                <div className="flex gap-4 mb-6 border-b border-slate-800 pb-6 shrink-0">
                    <button onClick={() => setActiveId(null)} className={`px-8 py-3 font-black text-[10px] uppercase transition-all ${!activeId ? 'bg-teal-500 text-black shadow-lg shadow-teal-500/20' : 'bg-slate-800'}`}>Library</button>
                    {activeId && <div className="flex-1 text-teal-500 font-black uppercase flex items-center gap-4 italic truncate tracking-widest"><span>Season: {activeSeason?.title}</span></div>}
                </div>

                {!activeId ? (
                    <div className="grid grid-cols-2 gap-6 overflow-y-auto pr-4 custom-scrollbar">
                        {seasons.map(s => (
                            <div key={s.id} onClick={() => setActiveId(s.id)} className="bg-[#1c1f23] p-8 border border-slate-800 rounded-3xl cursor-pointer hover:border-teal-500 transition-all relative group h-fit shadow-xl">
                                <button onClick={(e) => { e.stopPropagation(); fetch(`${BASE_URL}/delete/season/${s.id}`, {method:'DELETE'}).then(sync); }} className="absolute top-6 right-6 text-red-900 hover:text-red-500 transition-all"><Trash2 size={20}/></button>
                                <h4 className="text-white font-black uppercase italic text-xl tracking-tighter">{s.title}</h4>
                                <div className="flex items-center gap-4 mt-2 font-black uppercase text-[10px] text-teal-600 italic"><span>{s.rel}</span><span className="text-slate-600">|</span><span>{s.ep_count} Eps</span></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col h-full gap-6 overflow-hidden">
                        <div className="flex flex-wrap gap-2 overflow-y-auto max-h-[140px] custom-scrollbar p-3 border border-slate-900 rounded-2xl bg-black/20 shrink-0">
                            {activeSeason?.episodes?.map((e, idx) => (
                                <button key={idx} onClick={() => setActiveEpIdx(idx)} className={`px-5 py-3 border text-[10px] font-black uppercase rounded-xl min-w-[160px] transition-all ${activeEpIdx === idx ? 'bg-teal-500 text-black border-white shadow-lg' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-teal-500'}`}>
                                    Node_{e.node}: {e.title}
                                </button>
                            ))}
                        </div>

                        {activeEpIdx !== null && activeEp && (
                            <div className="flex-1 bg-black border border-teal-900/30 p-10 rounded-[40px] overflow-auto shadow-2xl relative custom-scrollbar select-text cursor-text">
                                <div className="sticky top-0 bg-black/95 backdrop-blur-xl pb-6 mb-6 border-b border-teal-900/20 flex justify-between items-center z-10">
                                    <div className="flex gap-4">
                                        <button onClick={() => setTerminalMode('brief')} className={`text-[10px] font-black uppercase transition-all ${terminalMode==='brief' ? 'text-teal-500 border-b-2 border-teal-500' : 'text-slate-600'}`}>The Brief</button>
                                        <button onClick={() => setTerminalMode('script')} className={`text-[10px] font-black uppercase transition-all ${terminalMode==='script' ? 'text-teal-500 border-b-2 border-teal-500' : 'text-slate-600'}`}>Master Script</button>
                                    </div>
                                    <div className="flex gap-2">
                                        {terminalMode === 'brief' && <button onClick={() => run('/showrunner/brief', {title: activeEp.title, season_id: activeId})} className="bg-slate-900 text-teal-400 px-4 py-2 rounded-full text-[9px] font-black border border-teal-900/30">Establish Brief</button>}
                                        {terminalMode === 'brief' && activeEp.saved_brief && (
                                            <div className="flex gap-1 ml-4 border-l border-slate-800 pl-4">
                                                {[1,2,3,4,5,6].map(n => (
                                                    <button key={n} onClick={() => run('/showrunner/script', {title: activeEp.title, season_id: activeId, act_num: n, context: activeEp.saved_brief})} className={`px-3 py-1 rounded text-[8px] font-black transition-all ${activeEp.acts?.[n] ? 'bg-teal-600 text-black shadow-lg shadow-teal-600/30' : 'bg-slate-800 text-slate-500 hover:bg-teal-900'}`}>Act_{n}</button>
                                                ))}
                                            </div>
                                        )}
                                        {terminalMode === 'script' && <button onClick={() => { navigator.clipboard.writeText(JSON.stringify(getMasterScript())); window.alert("JSON_COPIED"); }} className="bg-teal-600 text-black px-6 py-2 rounded-full text-[9px] font-black uppercase hover:bg-white flex items-center gap-2"><Copy size={14}/> Copy JSON</button>}
                                    </div>
                                </div>
                                <div className="selection:bg-teal-500 selection:text-black">
                                    {terminalMode === 'brief' && <pre className="text-teal-400 text-[13px] leading-relaxed whitespace-pre-wrap italic uppercase p-4">{activeEp.saved_brief || "Establish brief to unlock production segments."}</pre>}
                                    {terminalMode === 'script' && (
                                        <div className="space-y-6">
                                            {getMasterScript().length > 0 ? getMasterScript().map((line, idx) => (
                                                <div key={idx} className="border-l-2 border-teal-900/40 pl-6 group">
                                                    <span className="text-[9px] font-black text-teal-700 uppercase italic">[{line.voice_id}] {line.name}</span>
                                                    <p className="text-slate-300 text-sm leading-relaxed mt-1 uppercase">"{line.content}"</p>
                                                </div>
                                            )) : <div className="h-40 flex items-center justify-center text-slate-700 italic uppercase tracking-tighter">Acts 1-6 not yet committed.</div>}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>

            <aside className="w-[380px] bg-black/60 p-10 border-l border-slate-800 overflow-y-auto shrink-0 flex flex-col gap-10 custom-scrollbar shadow-2xl">
                <div className="space-y-6">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                        <h3 className="text-teal-500 text-[11px] font-black uppercase flex items-center gap-2"><UserPlus size={18}/> Identity Spawn</h3>
                        <button onClick={() => setNP({...nP, description: CONFIG.EXAMPLES[Math.floor(Math.random()*CONFIG.EXAMPLES.length)]})} className="text-[8px] text-slate-600 hover:text-teal-500 uppercase font-black"><RefreshCw size={10} className="inline mr-1"/> Randomize</button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <input className="bg-slate-900/50 p-4 border border-slate-800 text-white uppercase font-bold rounded-xl outline-none focus:border-teal-500" placeholder="NAME" value={nP.name} onChange={e => setNP({...nP, name: e.target.value})} />
                        <select className="bg-slate-900/50 p-4 border border-slate-800 text-teal-500 uppercase rounded-xl outline-none" value={nP.gender} onChange={e => setNP({...nP, gender: e.target.value})}>{CONFIG.G.map(g => <option key={g} value={g}>{g}</option>)}</select>
                    </div>
                    <textarea className="w-full h-24 bg-slate-900/50 p-4 border border-slate-800 text-slate-400 text-[10px] outline-none focus:border-teal-500 uppercase rounded-xl resize-none" placeholder="PERSONA BACKSTORY (MAX 250 CHARS)" maxLength={250} value={nP.description} onChange={e => setNP({...nP, description: e.target.value})} />
                    <button onClick={() => run('/persona/create', nP)} disabled={!nP.name || !nP.description} className="w-full py-4 bg-teal-500 text-black font-black uppercase text-[10px] rounded-xl hover:bg-white transition-all disabled:opacity-30">Commit DNA</button>
                    <div className="flex flex-wrap gap-2 pt-4">
                        {personas.map(p => (<img key={p.id} src={p.portrait} onClick={() => setViewPersona(p)} className="w-12 h-12 rounded-xl border border-slate-800 hover:border-teal-500 cursor-pointer bg-black" alt={p.name} />))}
                    </div>
                </div>

                <div className="space-y-6 border-t border-slate-800 pt-8">
                    <h3 className="text-teal-500 text-[11px] font-black uppercase flex items-center gap-2"><Archive size={18}/> Establish Season</h3>
                    <input className="w-full bg-slate-900/50 p-4 border border-slate-800 text-white uppercase font-bold rounded-xl outline-none focus:border-teal-500" placeholder="TOPIC" value={nS.topic} onChange={e => setNS({...nS, topic: e.target.value})} />
                    <select className="w-full bg-slate-900/50 p-4 border border-slate-800 text-teal-500 uppercase rounded-xl outline-none" value={nS.relationship} onChange={e => setNS({...nS, relationship: e.target.value})}>{CONFIG.D.map(d => <option key={d} value={d}>{d}</option>)}</select>
                    <div className="space-y-4 bg-black/40 p-4 rounded-xl border border-slate-800">
                        <div className="flex justify-between text-[10px] uppercase font-black text-slate-500 italic"><span>Nodes: {nS.episodes_count}</span><span>Runtime: {nS.target_runtime}m</span></div>
                        <input type="range" min="1" max="24" className="w-full accent-teal-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer" value={nS.episodes_count} onChange={e => setNS({...nS, episodes_count: parseInt(e.target.value)})} />
                        <input type="range" min="5" max="20" className="w-full accent-teal-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer" value={nS.target_runtime} onChange={e => setNS({...nS, target_runtime: parseInt(e.target.value)})} />
                    </div>
                    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 bg-black/20 rounded-xl custom-scrollbar border border-slate-800">
                        {personas.map(p => (
                            <button key={p.id} onClick={() => { 
                                const ids = nS.host_ids.includes(p.id) ? nS.host_ids.filter(x => x !== p.id) : [...nS.host_ids, p.id]; 
                                setNS({...nS, host_ids: ids.slice(0, 2)}); 
                            }} className={`p-2 text-[8px] font-black border truncate uppercase rounded-md transition-all ${nS.host_ids.includes(p.id) ? 'border-teal-500 text-teal-400 bg-teal-500/10' : 'border-slate-800 text-slate-500'}`}>{p.name}</button>
                        ))}
                    </div>
                    <button onClick={() => run('/season/reconcile', nS)} disabled={nS.host_ids.length !== 2 || !nS.topic} className="w-full py-4 bg-teal-500 text-black font-black uppercase text-[10px] rounded-xl hover:bg-white transition-all disabled:opacity-30 shadow-teal-500/10">Establish Season</button>
                </div>
            </aside>
        </div>
    );
};

export default App;
