import React, { useState, useEffect, useCallback } from 'react';
import { Zap, Trash2, Database, Loader2, UserPlus, Wifi, Cpu, Dice5, PlayCircle, Globe, Calendar, RefreshCw, Terminal, MessageSquare, Archive, BookOpen, Mic, Copy, User, X, ShieldCheck, Clock, Layers, Music, Share2 } from 'lucide-react';

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
    const [terminalMode, setTerminalMode] = useState('brief');
    const [producingId, setProducingId] = useState(null);

    const [nP, setNP] = useState({ name: '', role: 'Forensic Analyst', trauma: CONFIG.T[0], gender: 'Male', voice_id: '' });
    const [nS, setNS] = useState({ topic: '', relationship: CONFIG.D[0], host_ids: [], episodes_count: 10, target_runtime: 15 });

    const sync = useCallback(async () => {
        try {
            const s = await fetch("https://shadow-cassandrafiles.pythonanywhere.com/api/v2/season/list");
            const p = await fetch("https://shadow-cassandrafiles.pythonanywhere.com/api/v2/persona/list");
            if (s.ok) { 
                setSeasons(await s.json()); 
                setPersonas(await p.json()); 
            }
        } catch (e) { console.error("Sync Error", e); }
    }, []);

    useEffect(() => { sync(); }, [sync]);

    const run = async (path, body) => {
        setLoad(true); try {
            const r = await fetch("https://shadow-cassandrafiles.pythonanywhere.com/api/v2" + path, {
                method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body)
            });
            const d = await r.json(); await sync(); return d;
        } catch (e) { window.alert(`FAIL: ${e.message}`); } finally { setLoad(false); }
    };

    const produceAudio = async (episode) => {
        setProducingId(episode.id);
        try {
            await run('/production/produce', {
                episode_id: episode.id,
                script: getMasterScript(),
                runtime: seasons.find(x => x.id === activeId)?.target_runtime || 15
            });
            window.alert("PRODUCTION_STARTED");
        } finally { setProducingId(null); }
    };

    const activeSeason = seasons.find(x => x.id === activeId);
    const activeEp = activeSeason?.episodes && activeEpIdx !== null ? activeSeason.episodes[activeEpIdx] : null;

    const getMasterScript = () => {
        if (!activeEp?.acts) return [];
        return Object.keys(activeEp.acts).sort().map(k => activeEp.acts[k]).flat();
    };

    return (
        <div className="h-screen w-screen font-mono flex bg-[#0a0c0e] text-slate-400 overflow-hidden text-[12px] select-none">
            {/* Nav and Main logic from your stable version */}
            <aside className="w-[260px] border-r border-slate-800 bg-black/60 p-8 flex flex-col gap-6 shrink-0 shadow-2xl">
                <div className="flex items-center gap-3 text-teal-500 font-black uppercase tracking-widest border-b border-teal-900/30 pb-4"><Cpu size={16}/> Apex_v165.0</div>
                <button onClick={sync} className="w-full p-4 border border-teal-900/30 text-teal-500 text-[10px] font-black uppercase hover:bg-teal-500 hover:text-black rounded transition-all"><Wifi size={14}/> Sync Data</button>
            </aside>

            <main className="flex-1 flex flex-col p-10 bg-[#0d0f11] relative overflow-hidden">
                {load && <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center backdrop-blur-sm"><Loader2 className="animate-spin text-teal-500" size={48}/></div>}
                <div className="flex gap-4 mb-6 border-b border-slate-800 pb-6 shrink-0">
                    <button onClick={() => setActiveId(null)} className={`px-8 py-3 font-black text-[10px] uppercase transition-all ${!activeId ? 'bg-teal-500 text-black shadow-lg' : 'bg-slate-800'}`}>Library</button>
                </div>

                {!activeId ? (
                    <div className="grid grid-cols-2 gap-6 overflow-y-auto custom-scrollbar pr-4">
                        {seasons.map(s => (
                            <div key={s.id} onClick={() => setActiveId(s.id)} className="bg-[#1c1f23] p-8 border border-slate-800 rounded-3xl cursor-pointer hover:border-teal-500 relative">
                                <button onClick={(e) => { e.stopPropagation(); fetch(`https://shadow-cassandrafiles.pythonanywhere.com/api/v2/delete/season/${s.id}`, {method:'DELETE'}).then(sync); }} className="absolute top-6 right-6 text-red-900 hover:text-red-500"><Trash2 size={20}/></button>
                                <h4 className="text-white font-black uppercase italic text-xl tracking-tighter">{s.title}</h4>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col h-full gap-6">
                        <div className="flex flex-wrap gap-2 overflow-y-auto max-h-[140px] p-3 border border-slate-900 rounded-2xl bg-black/20 shrink-0">
                            {activeSeason?.episodes?.map((e, idx) => (
                                <button key={idx} onClick={() => setActiveEpIdx(idx)} className={`px-5 py-3 border text-[10px] font-black uppercase rounded-xl ${activeEpIdx === idx ? 'bg-teal-500 text-black shadow-lg' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-teal-500'}`}>Node_{e.node}: {e.title}</button>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default App;
