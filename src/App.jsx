import React, { useState, useEffect } from 'react';
import { Zap, Trash2, Database, Quote, Loader2, UserPlus, History, FastForward, Wifi, Cpu, ThumbsUp, ThumbsDown, Dice5, ScrollText, PlayCircle, Globe, Calendar, Music } from 'lucide-react';

const CONFIG = {
    G: ["Male", "Female", "Non-Binary", "Fluid"],
    D: ["Unresolved Sexual Tension", "Grudging Respect", "Bitter Rivals", "Mentor / Mentee", "Buddy Cop", "Frenemies", "Strategic Alliance", "Shared Trauma Bond"],
    T: ["Witnessed server farm bleed-out.", "Neural Betrayal.", "Identity Wiped.", "Exposed laundering ring."]
};

const App = () => {
    const [tab, setTab] = useState('season');
    const [active, setActive] = useState(null);
    const [seasons, setSeasons] = useState([]);
    const [personas, setPersonas] = useState([]);
    const [load, setLoad] = useState(false);
    const [eng, setEng] = useState('LOCKING...');
    const [brief, setBrief] = useState(null);
    const [today, setToday] = useState('CALIBRATING...');

    const sync = async () => {
        try {
            const s = await fetch("https://shadow-cassandrafiles.pythonanywhere.com/api/v2/season/list");
            if (s.ok) setSeasons(await s.json() || []);
            const p = await fetch("https://shadow-cassandrafiles.pythonanywhere.com/api/v2/persona/list");
            if (p.ok) setPersonas(await p.json() || []);
        } catch (e) { console.error("Vault Disconnected"); }
    };
    useEffect(() => { sync(); }, []);

    const [nP, setNP] = useState({ name: '', role: 'Investigator', trauma: CONFIG.T[0], gender: 'Male' });
    const [nS, setNS] = useState({ topic: '', relationship: CONFIG.D[0], host_ids: [], episodes_count: 10 });

    const ping = async () => {
        setLoad(true); try {
            const r = await fetch("https://shadow-cassandrafiles.pythonanywhere.com/api/v2/ping");
            const d = await r.json(); setEng(d.model?.toUpperCase() || 'ERROR'); setToday(d.date || '2026-03-24');
            window.alert("APEX HARD-LOCK: " + d.model);
        } catch (e) { window.alert("LINK FAIL"); } finally { setLoad(false); }
    };

    const run = async (path, body, method = 'POST') => {
        setLoad(true); try {
            const r = await fetch("https://shadow-cassandrafiles.pythonanywhere.com/api/v2" + path, {
                method, headers: {'Content-Type': 'application/json'}, body: body ? JSON.stringify(body) : null
            });
            const d = await r.json(); if (d.error) window.alert("AI_ERROR: " + d.error); await sync(); return d;
        } catch (e) { window.alert("TIMEOUT: Server background pass in progress. Refresh in 60s."); } finally { setLoad(false); }
    };

    return (
        <div className="h-screen w-screen font-mono flex bg-[#0a0c0e] text-slate-400 overflow-hidden select-none text-[12px]">
            <aside className="w-[280px] border-r border-slate-800 bg-black/60 p-6 flex flex-col gap-6 shrink-0 shadow-2xl">
                <div className="border-b border-slate-900 pb-4">
                    <div className="flex items-center gap-2 text-teal-500 font-black text-[11px] uppercase tracking-widest"><Cpu size={14}/> Apex_v98.1</div>
                    <div className="text-[9px] text-teal-900 font-black mt-1 italic uppercase flex items-center gap-1"><Calendar size={10}/> {today}</div>
                </div>
                <button onClick={ping} className="p-3 border border-teal-900/30 text-teal-500 text-[10px] font-black uppercase hover:bg-teal-500 hover:text-black rounded transition-all shadow-lg"><Wifi size={12}/> Chronos_Handshake</button>
                <div className="mt-auto space-y-4 pt-6 border-t border-slate-900">
                    <button onClick={() => run('/purge', {})} className="w-full p-3 bg-red-950/20 text-red-500 text-[10px] font-black border border-red-900/30 hover:bg-red-600 transition-all uppercase">Reset Vault</button>
                </div>
            </aside>

            <main className="flex-1 flex flex-col p-10 overflow-y-auto relative bg-[#121416]">
                {load && <div className="absolute inset-0 bg-black/95 z-[100] flex flex-col items-center justify-center backdrop-blur-3xl"><Loader2 className="animate-spin text-teal-500 mb-2" size={32}/><p className="text-teal-500 text-[10px] font-black uppercase tracking-widest">Grounding Apex 3.1 Pro Reality...</p></div>}
                <div className="flex gap-4 mb-8 border-b border-slate-800 pb-6"><button onClick={() => {setActive(null); setTab('season');}} className={`px-10 py-3 text-[10px] font-black ${tab === 'season' && !active ? 'bg-teal-500 text-black shadow-lg shadow-teal-500/20' : 'bg-slate-800'}`}>SEASONS</button><button onClick={() => {setActive(null); setTab('persona');}} className={`px-10 py-3 text-[10px] font-black ${tab === 'persona' && !active ? 'bg-teal-500 text-black shadow-lg shadow-teal-500/20' : 'bg-slate-800'}`}>DNA_VAULT</button></div>
                
                {!active ? (<div className="grid grid-cols-2 gap-6">
                    {(tab === 'season' ? seasons : personas).map((i, k) => (
                        <div key={k} className="bg-[#1c1f23] border border-slate-800 p-6 rounded-2xl cursor-pointer hover:border-teal-500 flex gap-6 items-center group relative active:scale-95 transition-all shadow-inner" onClick={() => setActive(i)}>
                            <button onClick={(e) => { e.stopPropagation(); run(`/delete/${tab}/${i.id}`, null, 'DELETE'); }} className="absolute top-3 right-3 text-red-900 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14}/></button>
                            <img src={i?.portrait} className="w-16 h-16 rounded-xl grayscale group-hover:grayscale-0 transition-all" alt="D"/>
                            <div className="min-w-0 flex-1"><h4 className="text-white font-black uppercase text-lg italic truncate leading-none">{i?.title || i?.name}</h4><p className="text-[10px] text-teal-500 font-black opacity-60 uppercase mt-1 italic">{i?.rel || i?.role}</p></div>
                        </div>
                    ))}
                </div>) : (
                    <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="flex justify-between items-end border-b border-slate-800 pb-8"><h2 className="text-6xl font-black text-white uppercase italic tracking-tighter leading-none">{active?.title || active?.name}</h2><button onClick={() => setActive(null)} className="bg-teal-500 text-black px-10 py-3 text-[10px] font-black shadow-2xl active:scale-90">BACK</button></div>
                        {tab === 'season' && (<div className="grid grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div className="bg-teal-950/10 p-8 border border-teal-900/30 rounded-3xl shadow-inner"><h4 className="text-teal-400 text-[10px] font-black uppercase mb-3 flex items-center gap-2 italic tracking-widest"><Globe size={14}/> 2026_Report</h4><p className="text-lg text-slate-300 leading-relaxed uppercase">{active?.summary}</p></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-black/40 p-5 border border-slate-800 rounded-3xl shadow-inner"><h4 className="text-teal-500 text-[9px] font-black uppercase mb-3 flex items-center gap-1"><History size={12}/> Shared_Lore</h4>{active?.lore?.shared_anecdotes?.slice(0,5).map((a, j) => <p key={j} className="text-[9px] text-slate-500 italic mb-1 leading-tight">"{a}"</p>)}</div>
                                    <div className="bg-black/40 p-5 border border-slate-800 rounded-3xl shadow-inner"><h4 className="text-teal-400 text-[9px] font-black uppercase mb-3 flex items-center gap-1"><FastForward size={12}/> Roadmap</h4><p className="text-[10px] text-slate-400 leading-relaxed italic">{active?.lore?.future_lore}</p></div>
                                </div>
                                <div className="space-y-3">
                                    {active?.episodes?.map((e, idx) => (
                                        <div key={idx} className="bg-[#1c1f23] p-5 border border-slate-800 rounded-xl flex justify-between items-center group hover:border-teal-500 transition-all shadow-lg">
                                            <div><span className="text-[8px] text-teal-600 font-black uppercase tracking-widest">Node {e.node} - {e.phase}</span><h5 className="text-white font-bold italic uppercase leading-tight">{e.title}</h5></div>
                                            <button onClick={() => run('/showrunner/brief', { title: e.title, season_id: active.id }).then(d => setBrief(d?.acts))} className="p-2 bg-slate-900 text-teal-500 rounded-full hover:bg-teal-500 hover:text-black transition-all shadow-xl active:scale-95"><PlayCircle size={18}/></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-black/40 p-8 border border-slate-800 rounded-3xl h-fit sticky top-4 shadow-2xl shadow-black/80"><h4 className="text-teal-500 text-[10px] font-black uppercase mb-6 flex items-center gap-2 italic underline decoration-teal-900 underline-offset-8">Production_Intelligence</h4>{brief ? Object.entries(brief).map(([act, text], idx) => (
                                <div key={idx} className="mb-5 border-l-2 border-teal-900/30 pl-4 animate-in slide-in-from-left duration-300"><span className="text-[8px] text-teal-700 font-black uppercase tracking-tighter">{act.replace('_', ' ')}</span><p className="text-[12px] text-slate-400 italic leading-relaxed uppercase mt-1">"{text}"</p></div>
                            )) : <div className="h-64 flex flex-col items-center justify-center text-slate-700 text-[9px] font-black uppercase italic animate-pulse tracking-widest text-center">Select node to generate<br/>integrated brief</div>}</div>
                        </div>)}
                        {tab === 'persona' && (<div className="grid grid-cols-2 gap-8 animate-in zoom-in-95"><div className="bg-black/40 p-10 border border-slate-800 rounded-3xl flex flex-col gap-6 h-[700px] overflow-y-auto shadow-inner shadow-black/80"><h4 className="text-teal-500 text-[11px] font-black uppercase flex items-center gap-3 tracking-widest"><Quote size={20}/> Forensic Dossier</h4><p className="text-teal-600 text-[10px] font-black uppercase border-b border-slate-900 pb-2 italic">Role: {active?.role} | MBTI: {active?.archive?.mbti}</p><p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{active?.archive?.bio}</p><div className="grid grid-cols-2 gap-6 border-t border-slate-800 pt-6"><div><h4 className="text-teal-600 text-[9px] font-black mb-4 uppercase flex items-center gap-1"><Music size={12}/> Tangible_Likes</h4>{active?.archive?.likes?.map((l, j) => <p key={j} className="text-[9px] text-teal-400 italic mb-1 uppercase tracking-tighter leading-none">-{l}</p>)}</div><div><h4 className="text-red-900 text-[9px] font-black mb-4 uppercase flex items-center gap-1"><ThumbsDown size={12}/> Dislikes</h4>{active?.archive?.dislikes?.map((d, j) => <p key={j} className="text-[9px] text-red-500 italic mb-1 uppercase tracking-tighter leading-none">-{d}</p>)}</div></div></div><div className="bg-black/40 p-10 border border-slate-800 rounded-3xl h-[700px] overflow-y-auto custom-scrollbar shadow-2xl shadow-black/80"><h4 className="text-teal-500 text-[11px] font-black uppercase mb-6 tracking-widest">DNA_Memories (30)</h4>{active?.archive?.anecdotes?.map((a, j) => <p key={j} className="p-4 bg-white/5 border border-white/5 text-[10px] text-slate-500 italic mb-3 rounded-lg leading-relaxed uppercase shadow-sm">"{a}"</p>)}</div></div>)}
                    </div>
                )}
            </main>

            <aside className="w-[380px] bg-[#0b0c0e] p-10 flex flex-col gap-10 border-l border-slate-800 overflow-y-auto shrink-0 shadow-2xl">
                <div className="space-y-6"><h3 className="text-teal-400 text-[10px] font-black uppercase border-b border-slate-900 pb-3 tracking-widest"><UserPlus size={16}/> Identity_Spawn</h3>
                    <input className="w-full bg-[#1c1f23] p-4 border border-slate-800 text-[11px] text-white outline-none uppercase focus:border-teal-500 shadow-inner" placeholder="NAME" value={nP.name} onChange={(e) => setNP({...nP, name: e.target.value})} />
                    <div className="grid grid-cols-2 gap-3"><select className="bg-[#1c1f23] p-4 border border-slate-800 text-[10px] text-teal-500 font-black outline-none cursor-pointer shadow-inner" value={nP.gender} onChange={(e) => setNP({...nP, gender: e.target.value})}>{CONFIG.G.map(g => <option key={g}>{g}</option>)}</select>
                    <input className="bg-[#1c1f23] p-4 border border-slate-800 text-[10px] text-slate-500 uppercase shadow-inner outline-none focus:border-teal-500" placeholder="ROLE" value={nP.role} onChange={(e) => setNP({...nP, role: e.target.value})} /></div>
                    <div className="relative"><input className="w-full bg-[#1c1f23] p-4 border border-slate-800 text-[10px] text-slate-500 outline-none uppercase pr-12 shadow-inner focus:border-teal-500" placeholder="CORE_TRAUMA" value={nP.trauma} onChange={(e) => setNP({...nP, trauma: e.target.value})} /><button onClick={() => setNP({...nP, trauma: CONFIG.T[Math.floor(Math.random() * CONFIG.T.length)]})} className="absolute right-3 top-3 text-slate-600 hover:text-teal-500 transition-all active:rotate-180 duration-300"><Dice5 size={20}/></button></div>
                    <button onClick={() => run('/persona/create', nP)} disabled={load || !nP.name} className="w-full py-5 bg-teal-500 text-black text-[10px] font-black uppercase shadow-2xl hover:bg-white active:scale-95 transition-all italic tracking-widest">Commit DNA</button>
                </div>
                <div className="space-y-6 border-t border-slate-900 pt-10"><h3 className="text-teal-400 text-[11px] font-black uppercase border-b border-slate-900 pb-3 tracking-widest"><Database size={16}/> Establish Season</h3>
                    <input className="w-full bg-[#1c1f23] p-4 border border-slate-800 text-[11px] text-white outline-none focus:border-teal-500 uppercase shadow-inner" placeholder="TOPIC" value={nS.topic} onChange={(e) => setNS({...nS, topic: e.target.value})} />
                    <select className="w-full bg-[#1c1f23] p-4 border border-slate-800 text-[10px] text-teal-400 font-bold outline-none cursor-pointer shadow-inner" value={nS.relationship} onChange={(e) => setNS({...nS, relationship: e.target.value})}>{CONFIG.D.map(d => <option key={d}>{d}</option>)}</select>
                    <div className="grid grid-cols-2 gap-2 max-h-[160px] overflow-y-auto p-4 border border-slate-800 rounded-xl bg-black/40 custom-scrollbar shadow-inner">{(personas || []).map(p => (<button key={p.id} onClick={() => { const ids = nS.host_ids.includes(p.id) ? nS.host_ids.filter(id => id !== p.id) : [...nS.host_ids, p.id]; setNS({...nS, host_ids: ids.slice(0, 2)}); }} className={`p-3 text-[9px] font-black border uppercase rounded-lg truncate transition-all ${nS.host_ids.includes(p.id) ? 'border-teal-500 bg-teal-500/10 text-teal-400 shadow-xl' : 'border-slate-800 text-slate-600 hover:border-slate-600'}`}>{p.name}</button>))}</div>
                    <div className="space-y-4">
                        <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase italic">Nodes <span>{nS.episodes_count} Eps</span></div>
                        <input type="range" min="1" max="24" className="w-full accent-teal-500 bg-slate-900 h-2 rounded-lg appearance-none cursor-pointer shadow-inner transition-all hover:accent-white shadow-teal-500/10" value={nS.episodes_count} onChange={(e) => setNS({...nS, episodes_count: e.target.value})} />
                    </div>
                    <button onClick={() => run('/season/reconcile', nS)} disabled={load || nS.host_ids.length !== 2} className="w-full py-5 bg-teal-500 text-black text-[11px] font-black uppercase shadow-2xl hover:bg-white active:scale-95 transition-all shadow-teal-500/20 italic tracking-widest">Establish Signal</button>
                </div>
            </aside>
        </div>
    );
};

export default App;
