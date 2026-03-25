import React, { useState, useEffect, useCallback } from 'react';
import { Zap, Trash2, Database, Loader2, UserPlus, Wifi, Cpu, Dice5, PlayCircle, Globe, Calendar, RefreshCw, Terminal, MessageSquare, Archive } from 'lucide-react';

const CONFIG = {
    G: ["Male", "Female", "Non-Binary", "Fluid"],
    D: ["Unresolved Sexual Tension", "Mentor / Mentee", "Enemies", "Frenemies", "Grudging Respect", "Buddy Cop", "Bitter Rivals", "Strategic Alliance"],
    T: ["Witnessed server farm bleed-out.", "Neural Betrayal.", "Identity Wiped.", "None", "Exposed laundering ring."]
};

const App = () => {
    const [activeId, setActiveId] = useState(null); 
    const [seasons, setSeasons] = useState([]);
    const [personas, setPersonas] = useState([]);
    const [load, setLoad] = useState(false);
    const [rawFeed, setRawFeed] = useState("Uplink standby...");

    const [nP, setNP] = useState({ name: '', role: 'Analyst', trauma: CONFIG.T[0], gender: 'Male' });
    const [nS, setNS] = useState({ topic: '', relationship: CONFIG.D[0], host_ids: [], episodes_count: 10 });

    const sync = useCallback(async () => {
        try {
            const s = await fetch("https://shadow-cassandrafiles.pythonanywhere.com/api/v2/season/list");
            const p = await fetch("https://shadow-cassandrafiles.pythonanywhere.com/api/v2/persona/list");
            if (s.ok) setSeasons(await s.json());
            if (p.ok) setPersonas(await p.json());
        } catch (e) {}
    }, []);

    const fetchRaw = async () => {
        const r = await fetch("https://shadow-cassandrafiles.pythonanywhere.com/api/v2/debug/raw");
        const d = await r.json(); setRawFeed(d.raw);
    };

    useEffect(() => { sync(); }, [sync]);

    const run = async (path, body, method = 'POST') => {
        setLoad(true); try {
            const r = await fetch("https://shadow-cassandrafiles.pythonanywhere.com/api/v2" + path, {
                method, headers: {'Content-Type': 'application/json'}, body: body ? JSON.stringify(body) : null
            });
            const d = await r.json();
            if (d.raw) setRawFeed(d.raw);
            await sync(); return d;
        } catch (e) { window.alert(`LOG: ${e.message}`); } finally { setLoad(false); }
    };

    const activeSeason = seasons.find(x => x.id === activeId);

    return (
        <div className="h-screen w-screen font-mono flex bg-[#0a0c0e] text-slate-400 overflow-hidden select-none text-[12px]">
            {/* LEFT: CONTROLS */}
            <aside className="w-[280px] border-r border-slate-800 bg-black/60 p-8 flex flex-col gap-6 shrink-0 shadow-2xl">
                <div className="flex items-center gap-3 text-teal-500 font-black uppercase tracking-widest border-b border-teal-900/30 pb-4"><Cpu size={16}/> Apex_v147.0</div>
                <button onClick={() => run('/ping', null, 'GET')} className="w-full p-4 border border-teal-900/30 text-teal-500 text-[10px] font-black uppercase hover:bg-teal-500 hover:text-black rounded transition-all"><Wifi size={14}/> Handshake</button>
                <button onClick={fetchRaw} className="w-full p-4 bg-teal-950/20 text-teal-400 border border-teal-900/30 text-[10px] font-black uppercase hover:bg-teal-500 hover:text-black rounded"><Terminal size={14}/> Sync Feed</button>
                <div className="mt-auto border-t border-slate-900 pt-6"><button onClick={() => run('/purge', {})} className="w-full p-3 bg-red-950/20 text-red-500 text-[10px] font-black border border-red-900/30 hover:bg-red-600 transition-all uppercase">Reset</button></div>
            </aside>

            {/* CENTER: FORENSIC FEED */}
            <main className="flex-1 flex flex-col p-10 bg-[#0d0f11] relative">
                {load && <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center"><Loader2 className="animate-spin text-teal-500" size={32}/></div>}
                
                <div className="flex gap-4 mb-6 border-b border-slate-800 pb-6">
                    <button onClick={() => setActiveId(null)} className={`px-8 py-3 font-black text-[10px] uppercase ${!activeId ? 'bg-teal-500 text-black' : 'bg-slate-800'}`}>Season List</button>
                    {activeId && <div className="flex-1 text-teal-500 font-black uppercase flex items-center gap-2 italic truncate"><Globe size={14}/> {activeSeason?.title}</div>}
                </div>

                {!activeId ? (
                    <div className="grid grid-cols-2 gap-4">
                        {seasons.map(s => (
                            <div key={s.id} onClick={() => setActiveId(s.id)} className="bg-[#1c1f23] p-6 border border-slate-800 rounded-2xl cursor-pointer hover:border-teal-500 transition-all relative group">
                                <button onClick={(e) => { e.stopPropagation(); run(`/delete/season/${s.id}`, null, 'DELETE'); }} className="absolute top-4 right-4 text-red-900 hover:text-red-500"><Trash2 size={16}/></button>
                                <h4 className="text-white font-black uppercase italic">{s.title}</h4>
                                <p className="text-[9px] text-teal-600 font-bold uppercase mt-1">{s.rel}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col h-full gap-6">
                        <div className="flex gap-2 overflow-x-auto pb-4 custom-scrollbar">
                            {activeSeason?.episodes?.map(e => (
                                <button key={e.node} onClick={() => run('/showrunner/brief', {title: e.title, phase: 'GOD_MODE', season_id: activeId})} className="px-4 py-2 bg-slate-900 border border-slate-800 text-[9px] font-black uppercase hover:border-teal-500 whitespace-nowrap">Brief_{e.node}</button>
                            ))}
                        </div>
                        <div className="flex-1 bg-black border border-teal-900/30 p-8 rounded-3xl overflow-auto shadow-inner">
                            <div className="flex justify-between items-center mb-6 border-b border-teal-900/20 pb-4">
                                <span className="text-teal-500 font-black flex items-center gap-2 tracking-widest"><Terminal size={14}/> RAW_INTELLIGENCE_STREAM</span>
                                <button onClick={() => run('/showrunner/script', {context: rawFeed, season_id: activeId})} className="bg-teal-600 text-black px-4 py-1 rounded text-[9px] font-black uppercase hover:bg-white flex items-center gap-2"><MessageSquare size={12}/> Generate Script</button>
                            </div>
                            <pre className="text-teal-400 text-[11px] leading-relaxed whitespace-pre-wrap font-mono uppercase italic">{rawFeed}</pre>
                        </div>
                    </div>
                )}
            </main>

            {/* RIGHT: CREATION SIDEBAR */}
            <aside className="w-[380px] bg-black/60 p-10 border-l border-slate-800 overflow-y-auto shrink-0 flex flex-col gap-10 shadow-2xl">
                <div className="space-y-6">
                    <h3 className="text-teal-500 text-[10px] font-black uppercase border-b border-slate-800 pb-2 flex items-center gap-2"><UserPlus size={16}/> Identity Spawn</h3>
                    <input className="w-full bg-slate-900/50 p-4 border border-slate-800 text-white outline-none focus:border-teal-500 uppercase font-bold" placeholder="NAME" value={nP.name} onChange={e => setNP({...nP, name: e.target.value})} />
                    <div className="grid grid-cols-2 gap-2">
                        <select className="bg-slate-900 p-4 border border-slate-800 text-[10px] text-teal-500 outline-none" value={nP.gender} onChange={e => setNP({...nP, gender: e.target.value})}>{CONFIG.G.map(g => <option key={g} value={g}>{g}</option>)}</select>
                        <input className="bg-slate-900 p-4 border border-slate-800 text-[10px] uppercase outline-none" placeholder="ROLE" value={nP.role} onChange={e => setNP({...nP, role: e.target.value})} />
                    </div>
                    <div className="relative">
                        <input className="w-full bg-slate-900 p-4 border border-slate-800 text-[9px] outline-none" placeholder="TRAUMA" value={nP.trauma} onChange={e => setNP({...nP, trauma: e.target.value})} />
                        <button onClick={() => setNP({...nP, trauma: CONFIG.T[Math.floor(Math.random()*CONFIG.T.length)]})} className="absolute right-3 top-3 text-slate-700 hover:text-teal-500"><Dice5 size={20}/></button>
                    </div>
                    <button onClick={() => run('/persona/create', nP)} disabled={!nP.name} className="w-full py-4 bg-teal-500 text-black font-black uppercase text-[10px] hover:bg-white transition-all">Commit DNA</button>
                    <div className="flex gap-2 overflow-x-auto py-2">
                        {personas.map(p => (
                            <div key={p.id} className="relative group shrink-0">
                                <img src={p.portrait} className="w-12 h-12 rounded border border-slate-800 group-hover:border-teal-500 transition-all bg-black" />
                                <button onClick={() => run(`/delete/persona/${p.id}`, null, 'DELETE')} className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={10}/></button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-6 border-t border-slate-900 pt-8">
                    <h3 className="text-teal-500 text-[10px] font-black uppercase border-b border-slate-800 pb-2 flex items-center gap-2"><Archive size={16}/> Establish Season</h3>
                    <input className="w-full bg-slate-900 p-4 border border-slate-800 text-white font-bold outline-none uppercase" placeholder="TOPIC" value={nS.topic} onChange={e => setNS({...nS, topic: e.target.value})} />
                    <select className="w-full bg-slate-900 p-4 border border-slate-800 text-[10px] text-teal-400 outline-none" value={nS.relationship} onChange={e => setNS({...nS, relationship: e.target.value})}>{CONFIG.D.map(d => <option key={d} value={d}>{d}</option>)}</select>
                    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-4 bg-black/40 rounded border border-slate-900">
                        {personas.map(p => (
                            <button key={p.id} onClick={() => { const ids = nS.host_ids.includes(p.id) ? nS.host_ids.filter(x => x!==p.id) : [...nS.host_ids, p.id]; setNS({...nS, host_ids: ids.slice(0,2)}); }} className={`p-2 text-[8px] font-black border truncate uppercase ${nS.host_ids.includes(p.id) ? 'border-teal-500 text-teal-400' : 'border-slate-800'}`}>{p.name}</button>
                        ))}
                    </div>
                    <input type="range" min="1" max="24" className="w-full accent-teal-500" value={nS.episodes_count} onChange={e => setNS({...nS, episodes_count: e.target.value})} />
                    <button onClick={() => run('/season/reconcile', nS)} disabled={nS.host_ids.length !== 2} className="w-full py-4 bg-teal-500 text-black font-black uppercase text-[10px] hover:bg-white transition-all">Establish Season</button>
                </div>
            </aside>
        </div>
    );
};

export default App;
