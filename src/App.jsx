import React, { useState, useEffect, useCallback } from 'react';
import { Zap, Trash2, Database, Loader2, UserPlus, Wifi, Cpu, Dice5, PlayCircle, Globe, Calendar, RefreshCw, Terminal, MessageSquare, Archive, BookOpen, Mic, Copy, User, X, ShieldCheck, Clock, Layers, Music } from 'lucide-react';

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
            const s = await fetch("https://your-app.pythonanywhere.com/api/v2/season/list");
            const p = await fetch("https://your-app.pythonanywhere.com/api/v2/persona/list");
            if (s.ok) { setSeasons(await s.json()); setPersonas(await p.json()); }
        } catch (e) {}
    }, []);

    useEffect(() => { sync(); }, [sync]);

    const run = async (path, body) => {
        setLoad(true); try {
            const r = await fetch("https://your-app.pythonanywhere.com/api/v2" + path, {
                method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body)
            });
            const d = await r.json(); await sync(); return d;
        } catch (e) { window.alert(`FAIL: ${e.message}`); } finally { setLoad(false); }
    };

    const activeSeason = seasons.find(x => x.id === activeId);
    const activeEp = activeSeason?.episodes && activeEpIdx !== null ? activeSeason.episodes[activeEpIdx] : null;

    return (
        <div className="h-screen w-screen font-mono flex bg-[#0a0c0e] text-slate-400 overflow-hidden text-[12px] select-none">
            {/* PERSONA OVERLAY */}
            {viewPersona && (
                <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-20 backdrop-blur-3xl" onClick={() => setViewPersona(null)}>
                    <div className="bg-[#0d0f11] w-full h-full border border-teal-900/40 rounded-3xl p-12 flex gap-12 overflow-hidden relative animate-in zoom-in" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setViewPersona(null)} className="absolute top-8 right-8 text-slate-500 hover:text-white"><X size={32}/></button>
                        <div className="w-[300px] shrink-0 space-y-6">
                            <img src={viewPersona?.portrait} className="w-full aspect-square rounded-2xl border border-teal-900/20 bg-black object-cover" />
                            <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">{viewPersona?.name}</h2>
                            <div className="p-4 bg-teal-950/20 border border-teal-900/30 text-teal-500 rounded-xl text-[9px] uppercase font-black italic">Role: {viewPersona?.role}</div>
                        </div>
                        <div className="flex-1 overflow-y-auto pr-6 space-y-8 select-text">
                            <div className="bg-black/40 p-8 rounded-2xl border border-slate-800"><h4 className="text-teal-400 font-black mb-4 uppercase tracking-widest">DNA_BIO</h4><p className="text-slate-300 text-sm leading-relaxed uppercase">{viewPersona?.archive?.bio}</p></div>
                            <div className="space-y-4"><h4 className="text-teal-400 font-black uppercase tracking-widest text-[10px]">Backstory</h4><p className="text-slate-500 uppercase italic">"{viewPersona?.description}"</p></div>
                        </div>
                    </div>
                </div>
            )}

            {/* SIDEBAR */}
            <aside className="w-[260px] border-r border-slate-800 bg-black/60 p-8 flex flex-col gap-6 shrink-0">
                <div className="flex items-center gap-3 text-teal-500 font-black uppercase tracking-widest border-b border-teal-900/30 pb-4"><Cpu size={16}/> Apex_v166.0</div>
                <button onClick={sync} className="w-full p-4 border border-teal-900/30 text-teal-500 text-[10px] font-black uppercase hover:bg-teal-500 hover:text-black rounded transition-all"><Wifi size={14}/> Sync Cloud</button>
            </aside>

            {/* MAIN AREA */}
            <main className="flex-1 flex flex-col p-10 bg-[#0d0f11] relative overflow-hidden">
                {load && <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center backdrop-blur-sm"><Loader2 className="animate-spin text-teal-500" size={48}/></div>}
                
                <div className="flex gap-4 mb-6 border-b border-slate-800 pb-6 shrink-0">
                    <button onClick={() => setActiveId(null)} className={`px-8 py-3 font-black text-[10px] uppercase ${!activeId ? 'bg-teal-500 text-black shadow-lg shadow-teal-500/20' : 'bg-slate-800'}`}>Library</button>
                </div>

                {!activeId ? (
                    <div className="grid grid-cols-2 gap-6 overflow-y-auto pr-4">
                        {seasons.map(s => (
                            <div key={s.id} onClick={() => setActiveId(s.id)} className="bg-[#1c1f23] p-8 border border-slate-800 rounded-3xl cursor-pointer hover:border-teal-500 transition-all relative">
                                <button onClick={(e) => { e.stopPropagation(); fetch(`https://your-app.pythonanywhere.com/api/v2/delete/season/${s.id}`, {method:'DELETE'}).then(sync); }} className="absolute top-6 right-6 text-red-900 hover:text-red-500"><Trash2 size={20}/></button>
                                <h4 className="text-white font-black uppercase italic text-xl tracking-tighter">{s.title}</h4>
                                <div className="flex items-center gap-4 mt-2">
                                    <span className="text-[10px] text-teal-600 font-black uppercase italic bg-teal-900/20 px-3 py-1 rounded-full">{s.rel}</span>
                                    <span className="text-[10px] text-slate-500">{s.ep_count} Eps</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col h-full gap-6 overflow-hidden">
                        {/* Render active episode/script views here as per previous code */}
                    </div>
                )}
            </main>

            {/* CONTROL PANEL */}
            <aside className="w-[380px] bg-black/60 p-10 border-l border-slate-800 overflow-y-auto shrink-0 flex flex-col gap-10">
                <div className="space-y-6">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                        <h3 className="text-teal-500 text-[11px] font-black uppercase flex items-center gap-2"><UserPlus size={18}/> Identity Spawn</h3>
                        <button onClick={() => setNP({...nP, description: CONFIG.EXAMPLES[Math.floor(Math.random()*CONFIG.EXAMPLES.length)]})} className="text-[8px] text-slate-600 hover:text-teal-500 uppercase font-black"><RefreshCw size={10} className="inline mr-1"/> Randomize</button>
                    </div>
                    <input className="w-full bg-slate-900/50 p-5 border border-slate-800 text-white outline-none focus:border-teal-500 uppercase font-bold rounded-xl" placeholder="NAME" value={nP.name} onChange={e => setNP({...nP, name: e.target.value})} />
                    <textarea 
                        className="w-full h-24 bg-slate-900/50 p-4 border border-slate-800 text-slate-400 text-[10px] outline-none focus:border-teal-500 uppercase rounded-xl resize-none" 
                        placeholder="DESCRIBE YOUR HOST (Max 250 Chars)..." 
                        maxLength={250}
                        value={nP.description} 
                        onChange={e => setNP({...nP, description: e.target.value})} 
                    />
                    <div className="text-right text-[8px] text-slate-600 font-black -mt-4 pr-2 tracking-widest">{nP.description?.length || 0} / 250</div>
                    <button onClick={() => run('/persona/create', nP)} disabled={!nP.name || !nP.description} className="w-full py-4 bg-teal-500 text-black font-black uppercase text-[10px] hover:bg-white rounded-xl shadow-xl transition-all shadow-teal-500/20 disabled:opacity-30">Commit DNA</button>
                    <div className="flex flex-wrap gap-3 py-6 border-t border-slate-900">
                        {personas.map(p => (
                            <div key={p.id} className="relative group cursor-pointer" onClick={() => setViewPersona(p)}>
                                <img src={p.portrait} className="w-16 h-16 rounded-2xl border-2 border-slate-800 group-hover:border-teal-500 bg-black object-cover shadow-2xl" />
                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-teal-500 text-black text-[6px] font-black px-1 rounded opacity-0 group-hover:opacity-100">{p.mbti}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </aside>
        </div>
    );
};

export default App;
