import React, { useState, useEffect } from 'react';
import { Zap, Trash2, Database, Quote, Loader2, Fingerprint, ScrollText, UserPlus, History, FastForward, Wifi, Cpu, ThumbsUp, ThumbsDown, Dice5 } from 'lucide-react';

const CONFIG = {
    G: ["Male", "Female", "Non-Binary", "Fluid"],
    D: ["Unresolved Sexual Tension", "Grudging Respect", "Bitter Rivals", "Mentor / Mentee", "Buddy Cop", "Frenemies", "Strategic Alliance", "Professional Disdain", "Shared Trauma Bond", "Competitive Peers", "Master / Apprentice", "Reluctant Partners"],
    T: ["Witnessed server farm bleed-out.", "Neural-link betrayal.", "Identity wiped by ghost protocol.", "Exposed data laundering ring.", "Neural-scanned without consent.", "Escaped digital cult."]
};

const App = () => {
    const [view, setView] = useState('god'); const [tab, setTab] = useState('season');
    const [active, setActive] = useState(null); const [seasons, setSeasons] = useState([]); 
    const [personas, setPersonas] = useState([]); const [load, setLoad] = useState(false);
    const [eng, setEng] = useState('OFFLINE');

    const [nP, setNP] = useState({ name: '', role: 'Forensic Investigator', trauma: CONFIG.T[0], gender: 'Male' });
    const [nS, setNS] = useState({ topic: '', relationship: CONFIG.D[0], host_ids: [], episodes_count: 10 });

    const sync = async () => {
        try {
            const s = await fetch("[https://shadow-cassandrafiles.pythonanywhere.com/api/v2/season/list](https://shadow-cassandrafiles.pythonanywhere.com/api/v2/season/list)"); if (s.ok) setSeasons(await s.json());
            const p = await fetch("[https://shadow-cassandrafiles.pythonanywhere.com/api/v2/persona/list](https://shadow-cassandrafiles.pythonanywhere.com/api/v2/persona/list)"); if (p.ok) setPersonas(await p.json());
        } catch (e) {}
    };
    useEffect(() => { sync(); }, []);

    const testPing = async () => {
        setLoad(true); try {
            const r = await fetch("[https://shadow-cassandrafiles.pythonanywhere.com/api/v2/ping](https://shadow-cassandrafiles.pythonanywhere.com/api/v2/ping)");
            const d = await r.json(); setEng(d.engine); window.alert("HANDSHAKE SUCCESS: " + d.status);
        } catch (e) { window.alert("HANDSHAKE FAIL: " + e.message); } finally { setLoad(false); }
    };

    const runAction = async (path, body) => {
        setLoad(true); 
        try {
            const r = await fetch("[https://shadow-cassandrafiles.pythonanywhere.com/api/v2](https://shadow-cassandrafiles.pythonanywhere.com/api/v2)" + path, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body) });
            const d = await r.json(); if (d.error) window.alert("BACKEND: " + d.error); await sync();
        } catch (e) { window.alert("FETCH_ERROR: " + e.message); } finally { setLoad(false); }
    };

    const list = (tab === 'season' ? seasons : personas) || [];

    return (
        <div className="h-screen w-screen font-mono flex bg-[#0a0c0e] text-slate-400 overflow-hidden select-none">
            <aside className="w-[300px] border-r border-slate-800 bg-black/60 p-8 flex flex-col gap-6 shrink-0 shadow-2xl">
                <div className="border-b border-slate-900 pb-6">
                    <div className="flex items-center gap-3 text-teal-500 font-black text-sm uppercase tracking-widest"><Cpu size={16}/> Apex_v64.0</div>
                    <div className="text-[10px] text-teal-900 uppercase font-black italic mt-2 tracking-tighter">{eng}</div>
                </div>
                <button onClick={testPing} className="p-4 border border-teal-900/30 text-teal-500 text-[10px] font-black uppercase hover:bg-teal-500 hover:text-black rounded transition-all shadow-lg"><Wifi size={14}/> Ping_Apex</button>
                <div className="mt-auto space-y-4">
                    <div className="flex border border-slate-800 rounded">
                        <button onClick={() => setView('god')} className={`flex-1 py-2 text-[10px] font-black ${view === 'god' ? 'bg-teal-500 text-black' : 'bg-slate-900'}`}>GOD</button>
                        <button onClick={() => setView('user')} className={`flex-1 py-2 text-[10px] font-black ${view === 'user' ? 'bg-teal-500 text-black' : 'bg-slate-900'}`}>USER</button>
                    </div>
                    <button onClick={() => runAction('/purge', {})} className="w-full p-3 bg-red-950/20 text-red-500 text-[10px] font-black uppercase border border-red-900/30 hover:bg-red-600 transition-all">World_Reset</button>
                </div>
            </aside>

            <main className="flex-1 flex flex-col p-12 overflow-y-auto relative bg-[#121416]">
                {load && <div className="absolute inset-0 bg-black/95 z-[100] flex flex-col items-center justify-center backdrop-blur-xl"><Loader2 className="animate-spin text-teal-500 mb-2"/><p className="text-teal-500 text-[10px] font-black uppercase tracking-widest">Neural Syncing...</p></div>}
                <div className="flex gap-4 mb-10 border-b border-slate-800 pb-8">
                    <button onClick={() => {setActive(null); setTab('season');}} className={`px-12 py-4 text-[11px] font-black transition-all ${tab === 'season' && !active ? 'bg-teal-500 text-black shadow-lg' : 'bg-slate-800'}`}>SEASONS</button>
                    <button onClick={() => {setActive(null); setTab('persona');}} className={`px-12 py-4 text-[11px] font-black transition-all ${tab === 'persona' && !active ? 'bg-teal-500 text-black shadow-lg' : 'bg-slate-800'}`}>DNA_VAULT</button>
                </div>

                {!active ? (
                    <div className="grid grid-cols-2 gap-8 animate-in fade-in">
                        {list.map((i, k) => (
                            <div key={k} className="bg-[#1c1f23] border border-slate-800 p-8 rounded-3xl cursor-pointer hover:border-teal-500 flex gap-6 items-center group relative active:scale-95 transition-all" onClick={() => setActive(i)}>
                                <img src={i.portrait} className="w-20 h-20 rounded-2xl grayscale group-hover:grayscale-0 transition-all" alt="DNA"/>
                                <div className="min-w-0 flex-1"><h4 className="text-white font-black uppercase text-xl italic truncate tracking-tighter leading-none">{i.title || i.name}</h4><p className="text-[10px] text-teal-500 font-black opacity-60 uppercase mt-2">{i.rel || i.role || 'Established'}</p></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="flex justify-between items-end border-b border-slate-800 pb-10"><h2 className="text-7xl font-black text-white uppercase italic tracking-tighter leading-none">{active.title || active.name}</h2><button onClick={() => setActive(null)} className="bg-teal-500 text-black px-12 py-4 text-[11px] font-black active:scale-95 shadow-2xl">BACK</button></div>
                        {tab === 'season' && (
                            <div className="space-y-12">
                                <div className="bg-teal-950/10 p-12 border border-teal-900/30 rounded-3xl"><h4 className="text-teal-400 text-[11px] font-black uppercase mb-4 italic tracking-widest">Blueprint</h4><p className="text-xl text-slate-300 leading-relaxed uppercase">{active.summary}</p></div>
                                {view === 'god' && <div className="grid grid-cols-2 gap-8"><div className="bg-black/40 p-10 border border-slate-800 rounded-3xl h-[400px] overflow-y-auto custom-scrollbar"><h4 className="text-teal-500 text-[11px] font-black uppercase mb-6 flex items-center gap-2 italic"><History size={16}/> Shared_History</h4>{(active.lore?.shared_anecdotes || []).map((a, j) => <p key={j} className="text-[11px] text-slate-500 italic mb-4 leading-tight">"{a}"</p>)}</div><div className="bg-black/40 p-10 border border-slate-800 rounded-3xl h-[400px] overflow-y-auto custom-scrollbar"><h4 className="text-teal-400 text-[11px] font-black uppercase mb-6 flex items-center gap-2 italic"><FastForward size={16}/> Roadmap</h4><p className="text-sm text-slate-400 leading-relaxed">{active.lore?.future_lore}</p></div></div>}
                            </div>
                        )}
                        {tab === 'persona' && (
                            <div className="grid grid-cols-2 gap-10"><div className="bg-black/40 p-12 border border-slate-800 rounded-3xl flex flex-col gap-8 h-[800px] overflow-y-auto shadow-inner"><h4 className="text-teal-500 text-[11px] font-black uppercase flex items-center gap-3"><Quote size={20}/> Forensic Dossier</h4><p className="text-teal-600 text-xs font-black uppercase border-b border-slate-900 pb-2 italic">Role: {active.role} | Trauma: {active.trauma}</p><p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{active.archive?.bio}</p><div className="grid grid-cols-2 gap-8 border-t border-slate-800 pt-8"><div><h4 className="text-teal-600 text-[9px] font-black uppercase mb-4 flex items-center gap-2"><ThumbsUp size={14}/> DNA_Likes</h4>{(active.archive?.likes || []).map((l, j) => <p key={j} className="text-[10px] text-teal-400 italic mb-2">-{l}</p>)}</div><div><h4 className="text-red-900 text-[9px] font-black uppercase mb-4 flex items-center gap-2"><ThumbsDown size={14}/> DNA_Hates</h4>{(active.archive?.dislikes || []).map((d, j) => <p key={j} className="text-[10px] text-red-500 italic mb-2">-{d}</p>)}</div></div></div><div className="bg-black/40 p-12 border border-slate-800 rounded-3xl h-[800px] overflow-y-auto custom-scrollbar shadow-inner"><h4 className="text-teal-500 text-[11px] font-black uppercase mb-6">DNA_Memories</h4>{(active.archive?.anecdotes || []).map((a, j) => <p key={j} className="p-6 bg-white/5 border border-white/5 text-[11px] text-slate-500 italic mb-4 rounded-xl leading-relaxed">"{a}"</p>)}</div></div>
                        )}
                    </div>
                )}
            </main>

            <aside className="w-[420px] bg-[#0b0c0e] p-12 flex flex-col gap-14 border-l border-slate-800 overflow-y-auto shrink-0 shadow-2xl">
                <div className="space-y-8">
                    <h3 className="text-teal-400 text-[11px] font-black uppercase flex items-center gap-3 border-b border-slate-900 pb-4 tracking-widest"><UserPlus size={20}/> Identity_Spawn</h3>
                    <input className="w-full bg-[#1c1f23] p-5 border border-slate-800 text-sm text-white font-bold outline-none uppercase focus:border-teal-500 transition-all shadow-inner" placeholder="NAME" value={nP.name} onChange={(e) => setNP({...nP, name: e.target.value})} />
                    <div className="grid grid-cols-2 gap-4">
                        <select className="bg-[#1c1f23] p-5 border border-slate-800 text-[11px] text-teal-500 font-black outline-none cursor-pointer" value={nP.gender} onChange={(e) => setNP({...nP, gender: e.target.value})}>{CONFIG.G.map(g => <option key={g}>{g}</option>)}</select>
                        <input className="bg-[#1c1f23] p-5 border border-slate-800 text-[11px] text-slate-500 uppercase shadow-inner" placeholder="ROLE" value={nP.role} onChange={(e) => setNP({...nP, role: e.target.value})} />
                    </div>
                    <div className="relative">
                        <input className="w-full bg-[#1c1f23] p-5 border border-slate-800 text-[10px] text-slate-500 outline-none uppercase pr-14 shadow-inner" placeholder="CORE_TRAUMA" value={nP.trauma} onChange={(e) => setNP({...nP, trauma: e.target.value})} />
                        <button onClick={() => setNP({...nP, trauma: CONFIG.T[Math.floor(Math.random() * CONFIG.T.length)]})} className="absolute right-4 top-4 text-slate-600 hover:text-teal-500 transition-all active:rotate-180 duration-300"><Dice5 size={24}/></button>
                    </div>
                    <button onClick={() => runAction('/persona/create', nP)} disabled={load || !nP.name} className="w-full py-6 bg-teal-500 text-black text-[11px] font-black uppercase shadow-2xl hover:bg-white active:scale-95 transition-all">Commit_DNA</button>
                </div>

                <div className="space-y-8 border-t border-slate-900 pt-14">
                    <h3 className="text-teal-400 text-[11px] font-black uppercase flex items-center gap-3 border-b border-slate-900 pb-4 tracking-widest"><Database size={20}/> Season_Establish</h3>
                    <input className="w-full bg-[#1c1f23] p-5 border border-slate-800 text-sm text-white font-bold outline-none focus:border-teal-500 uppercase shadow-inner" placeholder="TOPIC" value={nS.topic} onChange={(e) => setNS({...nS, topic: e.target.value})} />
                    <select className="w-full bg-[#1c1f23] p-5 border border-slate-800 text-[11px] text-teal-400 font-bold outline-none cursor-pointer" value={nS.relationship} onChange={(e) => setNS({...nS, relationship: e.target.value})}>{CONFIG.D.map(d => <option key={d}>{d}</option>)}</select>
                    <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto p-4 border border-slate-800 rounded-xl bg-black/40 custom-scrollbar shadow-inner">
                        {(personas || []).map(p => (<button key={p.id} onClick={() => { const ids = nS.host_ids.includes(p.id) ? nS.host_ids.filter(id => id !== p.id) : [...nS.host_ids, p.id]; setNS({...nS, host_ids: ids.slice(0, 2)}); }} className={`p-4 text-[10px] font-black border uppercase rounded-lg truncate transition-all ${nS.host_ids.includes(p.id) ? 'border-teal-500 bg-teal-500/10 text-teal-400 shadow-lg' : 'border-slate-800 text-slate-600'}`}>{p.name}</button>))}
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase italic">Nodes <span>{nS.episodes_count} Episodes</span></div>
                        <input type="range" min="1" max="24" className="w-full accent-teal-500 bg-slate-900 h-2 rounded-lg appearance-none cursor-pointer" value={nS.episodes_count} onChange={(e) => setNS({...nS, episodes_count: e.target.value})} />
                    </div>
                    <button onClick={() => runAction('/season/reconcile', nS)} disabled={load || nS.host_ids.length !== 2} className="w-full py-6 bg-teal-500 text-black text-[11px] font-black uppercase shadow-2xl hover:bg-white active:scale-95 transition-all">Establish_Signal</button>
                </div>
            </aside>
        </div>
    );
};

export default App;
