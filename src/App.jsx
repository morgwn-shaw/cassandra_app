import React, { useState, useEffect, useCallback } from 'react';
import { Zap, Trash2, Database, Loader2, UserPlus, Wifi, Cpu, Dice5, PlayCircle, Globe, Calendar, RefreshCw, Terminal, MessageSquare, Archive, BookOpen, Mic, Copy } from 'lucide-react';

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
    const [rawFeed, setRawFeed] = useState("Audio Production Uplink Ready...");

    const [nP, setNP] = useState({ name: '', role: 'Forensic Analyst', trauma: CONFIG.T[0], gender: 'Male', voice_id: '' });
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
            if (d.raw) setRawFeed(d.raw);
            await sync(); return d;
        } catch (e) { window.alert(`LOG: ${e.message}`); } finally { setLoad(false); }
    };

    const activeSeason = seasons.find(x => x.id === activeId);

    return (
        <div className="h-screen w-screen font-mono flex bg-[#0a0c0e] text-slate-400 overflow-hidden select-none text-[12px]">
            {/* LEFT: STATUS */}
            <aside className="w-[280px] border-r border-slate-800 bg-black/60 p-8 flex flex-col gap-6 shrink-0 shadow-2xl">
                <div className="flex items-center gap-3 text-teal-500 font-black uppercase tracking-widest border-b border-teal-900/30 pb-4"><Cpu size={16}/> Apex_v152.0</div>
                <button onClick={() => run('/ping', null, 'GET')} className="w-full p-4 border border-teal-900/30 text-teal-500 text-[10px] font-black uppercase hover:bg-teal-500 hover:text-black rounded transition-all shadow-lg shadow-teal-500/10"><Wifi size={14}/> Handshake</button>
                <div className="mt-auto border-t border-slate-900 pt-6"><button onClick={() => run('/purge', {})} className="w-full p-3 bg-red-950/20 text-red-500 text-[10px] font-black border border-red-900/30 hover:bg-red-600 transition-all uppercase">Format Vault</button></div>
            </aside>

            {/* CENTER: TERMINAL (Copy-Paste Unlocked) */}
            <main className="flex-1 flex flex-col p-10 bg-[#0d0f11] relative overflow-hidden">
                {load && <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center backdrop-blur-sm"><Loader2 className="animate-spin text-teal-500" size={32}/></div>}
                
                <div className="flex gap-4 mb-6 border-b border-slate-800 pb-6 shrink-0">
                    <button onClick={() => setActiveId(null)} className={`px-8 py-3 font-black text-[10px] uppercase ${!activeId ? 'bg-teal-500 text-black shadow-lg shadow-teal-500/20' : 'bg-slate-800'}`}>Season_Library</button>
                    {activeId && <div className="flex-1 text-teal-500 font-black uppercase flex items-center gap-2 italic truncate tracking-widest">Active_Cluster: {activeSeason?.title}</div>}
                </div>

                {!activeId ? (
                    <div className="grid grid-cols-2 gap-4 overflow-y-auto custom-scrollbar pr-4">
                        {seasons.map(s => (
                            <div key={s.id} onClick={() => setActiveId(s.id)} className="bg-[#1c1f23] p-6 border border-slate-800 rounded-2xl cursor-pointer hover:border-teal-500 transition-all relative group h-fit">
                                <button onClick={(e) => { e.stopPropagation(); run(`/delete/season/${s.id}`, null, 'DELETE'); }} className="absolute top-4 right-4 text-red-900 hover:text-red-500"><Trash2 size={16}/></button>
                                <h4 className="text-white font-black uppercase italic text-lg tracking-tighter">{s.title}</h4>
                                <p className="text-[9px] text-teal-600 font-bold uppercase mt-1 italic">{s.rel}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col h-full gap-6 overflow-hidden">
                        <div className="bg-teal-950/10 p-6 border border-teal-900/30 rounded-2xl shrink-0 shadow-inner">
                           <h5 className="text-teal-500 text-[9px] font-black uppercase mb-2 flex items-center gap-2 tracking-[0.2em]"><BookOpen size={14}/> Forensic_Report</h5>
                           <p className="text-[11px] text-slate-300 leading-relaxed uppercase italic">"{activeSeason?.summary}"</p>
                        </div>

                        <div className="flex flex-wrap gap-2 overflow-y-auto max-h-[160px] custom-scrollbar p-2 border border-slate-900 rounded-xl bg-black/20 shrink-0">
                            {activeSeason?.episodes?.map(e => (
                                <button key={e.node} onClick={() => run('/showrunner/brief', {title: e.title, season_id: activeId})} className="px-4 py-3 bg-slate-900 border border-slate-800 text-[9px] font-black uppercase hover:border-teal-500 rounded-lg flex flex-col items-start min-w-[140px] max-w-[200px] shadow-lg active:scale-95 transition-all">
                                    <span className="text-teal-700 text-[7px] mb-1">Node {e.node}</span>
                                    <span className="text-slate-400 truncate w-full">{e.title}</span>
                                </button>
                            ))}
                        </div>

                        {/* THE TERMINAL: Hard-locked for selectability */}
                        <div className="flex-1 bg-black border border-teal-900/30 p-8 rounded-3xl overflow-auto shadow-2xl relative custom-scrollbar group/term">
                            <div className="sticky top-0 bg-black/90 backdrop-blur pb-4 mb-4 border-b border-teal-900/20 flex justify-between items-center z-10">
                                <span className="text-teal-500 font-black flex items-center gap-2 tracking-widest uppercase animate-pulse"><Terminal size={14}/> AUDIO_PRODUCTION_STREAM</span>
                                <div className="flex gap-4">
                                    <button onClick={() => { navigator.clipboard.writeText(rawFeed); window.alert("CLIPPED"); }} className="bg-slate-900 text-teal-500 px-4 py-2 rounded-full text-[8px] font-black hover:bg-teal-500 hover:text-black flex items-center gap-2 uppercase transition-all shadow-lg shadow-teal-500/5"><Copy size={12}/> Copy Script</button>
                                    <button onClick={() => run('/showrunner/script', {context: rawFeed, season_id: activeId})} className="bg-teal-600 text-black px-6 py-2 rounded-full text-[9px] font-black uppercase hover:bg-white flex items-center gap-2 shadow-xl tracking-widest italic transition-all"><MessageSquare size={12}/> Generate Ear-Only Script</button>
                                </div>
                            </div>
                            {/* Unlocking text selection here */}
                            <pre className="text-teal-400 text-[12px] leading-relaxed whitespace-pre-wrap font-mono uppercase italic p-4 tracking-tighter select-text selection:bg-teal-500 selection:text-black cursor-text">
                                {rawFeed}
                            </pre>
                        </div>
                    </div>
                )}
            </main>

            {/* RIGHT: CREATION SIDEBAR */}
            <aside className="w-[380px] bg-black/60 p-10 border-l border-slate-800 overflow-y-auto shrink-0 flex flex-col gap-10 shadow-2xl custom-scrollbar">
                <div className="space-y-6">
                    <h3 className="text-teal-500 text-[10px] font-black uppercase border-b border-slate-800 pb-2 flex items-center gap-2 tracking-widest"><UserPlus size={16}/> Identity Spawn</h3>
                    <input className="w-full bg-slate-900/50 p-4 border border-slate-800 text-white outline-none focus:border-teal-500 uppercase font-bold shadow-inner" placeholder="NAME" value={nP.name} onChange={e => setNP({...nP, name: e.target.value})} />
                    <div className="grid grid-cols-2 gap-2">
                        <select className="bg-slate-900 p-4 border border-slate-800 text-[10px] text-teal-500 outline-none" value={nP.gender} onChange={e => setNP({...nP, gender: e.target.value})}>{CONFIG.G.map(g => <option key={g} value={g}>{g}</option>)}</select>
                        <input className="bg-slate-900 p-4 border border-slate-800 text-[10px] uppercase outline-none focus:border-teal-500" placeholder="ROLE" value={nP.role} onChange={e => setNP({...nP, role: e.target.value})} />
                    </div>
                    <div className="relative">
                        <input className="w-full bg-slate-900/50 p-4 border border-slate-800 text-teal-500 text-[9px] outline-none focus:border-teal-500 uppercase" placeholder="TTS_VOICE_ID" value={nP.voice_id} onChange={e => setNP({...nP, voice_id: e.target.value})} />
                        <Mic size={14} className="absolute right-4 top-4 text-teal-900" />
                    </div>
                    <div className="relative">
                        <input className="w-full bg-slate-900 p-4 border border-slate-800 text-[9px] outline-none focus:border-teal-500" placeholder="CORE_TRAUMA" value={nP.trauma} onChange={e => setNP({...nP, trauma: e.target.value})} />
                        <button onClick={() => setNP({...nP, trauma: CONFIG.T[Math.floor(Math.random()*CONFIG.T.length)]})} className="absolute right-3 top-3 text-slate-700 hover:text-teal-500 transition-all duration-300 active:rotate-180"><Dice5 size={20}/></button>
                    </div>
                    <button onClick={() => run('/persona/create', nP)} disabled={!nP.name} className="w-full py-4 bg-teal-500 text-black font-black uppercase text-[10px] hover:bg-white tracking-widest italic shadow-xl shadow-teal-500/10 transition-all">Commit DNA</button>
                    <div className="flex gap-2 overflow-x-auto py-2 custom-scrollbar">
                        {personas.map(p => (
                            <div key={p.id} className="relative group shrink-0">
                                <img src={p.portrait} className="w-12 h-12 rounded border border-slate-800 group-hover:border-teal-500 transition-all bg-black object-cover shadow-lg" />
                                <button onClick={() => run(`/delete/persona/${p.id}`, null, 'DELETE')} className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={10}/></button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-6 border-t border-slate-900 pt-8">
                    <h3 className="text-teal-500 text-[10px] font-black uppercase border-b border-slate-800 pb-2 flex items-center gap-2 tracking-widest"><Archive size={16}/> Establish Season</h3>
                    <input className="w-full bg-slate-900 p-4 border border-slate-800 text-white font-bold outline-none focus:border-teal-500 uppercase" placeholder="TOPIC" value={nS.topic} onChange={e => setNS({...nS, topic: e.target.value})} />
                    <select className="w-full bg-slate-900 p-4 border border-slate-800 text-[10px] text-teal-400 outline-none cursor-pointer" value={nS.relationship} onChange={e => setNS({...nS, relationship: e.target.value})}>{CONFIG.D.map(d => <option key={d} value={d}>{d}</option>)}</select>
                    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-4 bg-black/40 rounded border border-slate-800 custom-scrollbar shadow-inner">
                        {personas.map(p => (
                            <button key={p.id} onClick={() => { const ids = nS.host_ids.includes(p.id) ? nS.host_ids.filter(x => x!==p.id) : [...nS.host_ids, p.id]; setNS({...nS, host_ids: ids.slice(0,2)}); }} className={`p-2 text-[8px] font-black border truncate uppercase rounded-md transition-all ${nS.host_ids.includes(p.id) ? 'border-teal-500 text-teal-400 bg-teal-500/10 shadow-lg' : 'border-slate-800 hover:border-slate-600'}`}>{p.name}</button>
                        ))}
                    </div>
                    <div className="flex justify-between text-[8px] font-black text-slate-500 px-1 uppercase italic"><span>1 Node</span><span>24 Nodes</span></div>
                    <input type="range" min="1" max="24" className="w-full accent-teal-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer shadow-inner" value={nS.episodes_count} onChange={e => setNS({...nS, episodes_count: e.target.value})} />
                    <button onClick={() => run('/season/reconcile', nS)} disabled={nS.host_ids.length !== 2} className="w-full py-4 bg-teal-500 text-black font-black uppercase text-[10px] hover:bg-white tracking-widest italic shadow-xl shadow-teal-500/10 transition-all">Establish Season</button>
                </div>
            </aside>
        </div>
    );
};

export default App;
