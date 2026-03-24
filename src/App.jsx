import React, { useState, useEffect } from 'react';
import { Zap, Trash2, Database, Quote, Loader2, UserPlus, History, FastForward, Wifi, Cpu, ThumbsUp, ThumbsDown, Dice5, ScrollText, PlayCircle, Globe, Calendar, RefreshCw } from 'lucide-react';

const CONFIG = {
    G: ["Male", "Female", "Non-Binary", "Fluid"],
    D: ["Unresolved Sexual Tension", "Grudging Respect", "Bitter Rivals", "Buddy Cop", "Shared Trauma Bond"],
    T: ["Witnessed server farm bleed-out.", "Neural Betrayal.", "Identity Wiped."]
};

const App = () => {
    const [tab, setTab] = useState('season');
    const [active, setActive] = useState(null);
    const [seasons, setSeasons] = useState([]);
    const [personas, setPersonas] = useState([]);
    const [load, setLoad] = useState(false);
    const [eng, setEng] = useState('OFFLINE');
    const [brief, setBrief] = useState(null);
    const [today, setToday] = useState('CALIBRATING...');

    const sync = async () => {
        try {
            const s = await fetch("https://shadow-cassandrafiles.pythonanywhere.com/api/v2/season/list");
            if (s.ok) { const d = await s.json(); setSeasons(Array.isArray(d) ? d : []); }
            const p = await fetch("https://shadow-cassandrafiles.pythonanywhere.com/api/v2/persona/list");
            if (p.ok) { const d = await p.json(); setPersonas(Array.isArray(d) ? d : []); }
        } catch (e) {}
    };
    useEffect(() => { sync(); }, []);

    const [nP, setNP] = useState({ name: '', role: 'Investigator', trauma: CONFIG.T[0], gender: 'Male' });
    const [nS, setNS] = useState({ topic: '', relationship: CONFIG.D[0], host_ids: [], episodes_count: 10 });

    const ping = async () => {
        setLoad(true); try {
            const r = await fetch("https://shadow-cassandrafiles.pythonanywhere.com/api/v2/ping");
            const d = await r.json(); setEng(d.model?.toUpperCase() || 'ERROR'); setToday(d.date || '2026-03-24');
        } catch (e) { window.alert("LINK FAIL"); } finally { setLoad(false); }
    };

    const run = async (path, body, method = 'POST') => {
        setLoad(true); try {
            const r = await fetch("https://shadow-cassandrafiles.pythonanywhere.com/api/v2" + path, {
                method, headers: {'Content-Type': 'application/json'}, body: body ? JSON.stringify(body) : null
            });
            const d = await r.json(); if (d.error) window.alert("AI ERROR: " + d.error); await sync(); return d;
        } catch (e) { window.alert("TIMEOUT: Flash signal backgrounding. Refresh in 60s."); } finally { setLoad(false); }
    };

    return (
        <div className="h-screen w-screen font-mono flex bg-[#0a0c0e] text-slate-400 overflow-hidden select-none text-[12px]">
            <aside className="w-[300px] border-r border-slate-800 bg-black/60 p-8 flex flex-col gap-6 shrink-0 shadow-2xl">
                <div className="border-b border-slate-900 pb-4">
                    <div className="flex items-center gap-3 text-teal-500 font-black text-sm uppercase tracking-widest"><Cpu size={16}/> Apex_v106.0</div>
                    <div className="text-[9px] text-teal-900 font-black mt-1 italic uppercase flex items-center gap-2"><Calendar size={10}/> {today}</div>
                </div>
                <div className="space-y-2">
                    <button onClick={ping} className="w-full p-4 border border-teal-900/30 text-teal-500 text-[10px] font-black uppercase hover:bg-teal-500 rounded transition-all shadow-lg shadow-teal-500/10"><Wifi size={14}/> Handshake</button>
                    <button onClick={() => setLoad(false)} className="w-full p-2 text-[9px] text-teal-900 font-black uppercase hover:text-teal-400 flex items-center justify-center gap-2"><RefreshCw size={12}/> Clear Signal</button>
                </div>
                <div className="mt-auto space-y-4 pt-6 border-t border-slate-900"><button onClick={() => run('/purge', {})} className="w-full p-3 bg-red-950/20 text-red-500 text-[10px] font-black border border-red-900/30 hover:bg-red-600 transition-all uppercase">Purge Vault</button></div>
            </aside>

            <main className="flex-1 flex flex-col p-12 overflow-y-auto relative bg-[#121416]">
                {load && <div className="absolute inset-0 bg-black/95 z-[100] flex flex-col items-center justify-center backdrop-blur-3xl"><Loader2 className="animate-spin text-teal-500 mb-2" size={32}/><p className="text-teal-500 text-[10px] font-black uppercase tracking-widest animate-pulse">Establishing Flash Reality...</p></div>}
                <div className="flex gap-4 mb-10 border-b border-slate-800 pb-8"><button onClick={() => {setActive(null); setTab('season'); setBrief(null);}} className={`px-12 py-4 text-[11px] font-black ${tab === 'season' && !active ? 'bg-teal-500 text-black shadow-lg shadow-teal-500/20' : 'bg-slate-800'}`}>SEASONS</button><button onClick={() => {setActive(null); setTab('persona'); setBrief(null);}} className={`px-12 py-4 text-[11px] font-black ${tab === 'persona' && !active ? 'bg-teal-500 text-black shadow-lg shadow-teal-500/20' : 'bg-slate-800'}`}>DNA_VAULT</button></div>
                
                {!active ? (<div className="grid grid-cols-2 gap-8 animate-in fade-in">
                    {(tab === 'season' ? seasons : personas).map((i, k) => (
                        <div key={k} className="bg-[#1c1f23] border border-slate-800 p-8 rounded-3xl cursor-pointer hover:border-teal-500 flex gap-6 items-center group relative active:scale-95 transition-all shadow-inner" onClick={() => setActive(i)}>
                            <button onClick={(e) => { e.stopPropagation(); run(`/delete/${tab}/${i.id}`, null, 'DELETE'); }} className="absolute top-4 right-4 text-red-900 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all active:scale-125"><Trash2 size={16}/></button>
                            <img src={i?.portrait} className="w-20 h-20 rounded-2xl grayscale group-hover:grayscale-0 transition-all shadow-xl" alt="DNA"/>
                            <div className="min-w-0 flex-1"><h4 className="text-white font-black uppercase text-xl italic truncate tracking-tighter leading-none">{i?.title || i?.name}</h4><p className="text-[10px] text-teal-500 font-black opacity-60 uppercase mt-1 italic">{i?.rel || i?.role}</p></div>
                        </div>
                    ))}
                </div>) : (
                    <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="flex justify-between items-end border-b border-slate-800 pb-10"><h2 className="text-7xl font-black text-white uppercase italic tracking-tighter leading-none shadow-teal-500/5">{active?.title || active?.name}</h2><button onClick={() => setActive(null)} className="bg-teal-500 text-black px-12 py-4 text-[11px] font-black shadow-2xl active:scale-90 transition-all">BACK</button></div>
                        {tab === 'season' && (<div className="grid grid-cols-2 gap-10">
                            <div className="space-y-8">
                                <div className="bg-teal-950/10 p-10 border border-teal-900/30 rounded-3xl shadow-inner"><h4 className="text-teal-400 text-[11px] font-black uppercase mb-4 flex items-center gap-2 italic tracking-widest"><Globe size={14}/> 2026_Factual_Intelligence</h4><p className="text-xl text-slate-300 leading-relaxed uppercase">{active?.summary || "Incomplete Data"}</p></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-black/40 p-6 border border-slate-800 rounded-3xl"><h4 className="text-teal-500 text-[9px] font-black uppercase mb-4 flex items-center gap-2"><History size={14}/> Shared_Lore</h4>{(active?.lore?.shared_anecdotes || []).map((a, j) => <p key={j} className="text-[10px] text-slate-500 italic mb-2 leading-tight">"{a}"</p>)}</div>
                                    <div className="bg-black/40 p-6 border border-slate-800 rounded-3xl"><h4 className="text-teal-400 text-[9px] font-black uppercase mb-4 flex items-center gap-2"><FastForward size={14}/> Roadmap</h4><p className="text-[11px] text-slate-400 leading-relaxed italic">{active?.lore?.future_lore || "No roadmap linked."}</p></div>
                                </div>
                                <div className="space-y-4">
                                    {(active?.episodes || []).map((e, idx) => (
                                        <div key={idx} className="bg-[#1c1f23] p-6 border border-slate-800 rounded-2xl flex justify-between items-center group hover:border-teal-500 transition-all shadow-lg">
                                            <div><span className="text-[9px] text-teal-600 font-black uppercase tracking-widest">Node {e.node || idx+1}</span><h5 className="text-white font-bold italic uppercase leading-tight">{e.title}</h5></div>
                                            <button onClick={() => run('/showrunner/brief', { title: e.title, season_id: active.id }).then(d => setBrief(d?.acts))} className="p-3 bg-slate-900 text-teal-500 rounded-full hover:bg-teal-500 hover:text-black transition-all shadow-xl active:scale-95"><PlayCircle size={20}/></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-black/40 p-10 border border-slate-800 rounded-3xl h-fit sticky top-4 shadow-2xl shadow-black/80"><h4 className="text-teal-500 text-[11px] font-black uppercase mb-6 flex items-center gap-2 italic underline decoration-teal-900 underline-offset-8">Production_Brief</h4>{brief ? Object.entries(brief).map(([act, text], idx) => (
                                <div key={idx} className="mb-6 border-l-2 border-teal-900/30 pl-4 animate-in slide-in-from-left duration-300"><span className="text-[9px] text-teal-700 font-black uppercase tracking-tighter">{act.replace('_', ' ')}</span><p className="text-sm text-slate-400 italic leading-relaxed uppercase mt-1">"{text}"</p></div>
                            )) : <div className="h-64 flex flex-col items-center justify-center text-slate-700 text-[10px] font-black uppercase italic animate-pulse tracking-widest text-center">Select node to generate intelligence</div>}</div>
                        </div>)}
                        {tab === 'persona' && (<div className="grid grid-cols-2 gap-10 animate-in zoom-in-95"><div className="bg-black/40 p-12 border border-slate-800 rounded-3xl flex flex-col gap-6 h-[800px] overflow-y-auto shadow-inner shadow-black/80"><h4 className="text-teal-500 text-[11px] font-black uppercase flex items-center gap-3 tracking-[0.3em]"><Quote size={20}/> Forensic Dossier</h4><p className="text-teal-600 text-[10px] font-black uppercase border-b border-slate-900 pb-2 italic">Role: {active?.role} | MBTI: {active?.archive?.mbti || 'NX'}</p><p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{active?.archive?.bio || 'RAW_DATA_NULL'}</p><div className="grid grid-cols-2 gap-6 border-t border-slate-800 pt-6"><div><h4 className="text-teal-600 text-[9px] font-black mb-4 uppercase">Likes</h4>{(active?.archive?.likes || []).map((l, j) => <p key={j} className="text-[9px] text-teal-400 italic mb-1 uppercase leading-none">-{l}</p>)}</div><div><h4 className="text-red-900 text-[9px] font-black mb-4 uppercase">Dislikes</h4>{(active?.archive?.dislikes || []).map((d, j) => <p key={j} className="text-[9px] text-red-500 italic mb-1 uppercase leading-none">-{d}</p>)}</div></div></div><div className="bg-black/40 p-12 border border-slate-800 rounded-3xl h-[800px] overflow-y-auto custom-scrollbar shadow-2xl shadow-black/80"><h4 className="text-teal-500 text-[11px] font-black uppercase mb-6 tracking-[0.3em]">DNA_Memories (30)</h4>{(active?.archive?.anecdotes || []).map((a, j) => <p key={j} className="p-4 bg-white/5 border border-white/5 text-[10px] text-slate-500 italic mb-3 rounded-lg leading-relaxed uppercase shadow-sm">"{a}"</p>)}</div></div>)}
                    </div>
                )}
            </main>

            <aside className="w-[420px] bg-[#0b0c0e] p-12 flex flex-col gap-14 border-l border-slate-800 overflow-y-auto shrink-0 shadow-2xl shadow-black/80">
                <div className="space-y-8"><h3 className="text-teal-400 text-[11px] font-black uppercase border-b border-slate-900 pb-4 tracking-widest"><UserPlus size={20}/> Identity_Spawn</h3>
                    <input className="w-full bg-[#1c1f23] p-5 border border-slate-800 text-sm text-white font-bold outline-none uppercase focus:border-teal-500 transition-all shadow-inner" placeholder="NAME" value={nP.name} onChange={(e) => setNP({...nP, name: e.target.value})} />
                    <div className="grid grid-cols-2 gap-4"><select className="bg-[#1c1f23] p-5 border border-slate-800 text-[11px] text-teal-500 font-black outline-none cursor-pointer shadow-inner" value={nP.gender} onChange={(e) => setNP({...nP, gender: e.target.value})}>{CONFIG.G.map(g => <option key={g}>{g}</option>)}</select>
                    <input className="bg-[#1c1f23] p-5 border border-slate-800 text-[11px] text-slate-500 uppercase shadow-inner outline-none focus:border-teal-500" placeholder="ROLE" value={nP.role} onChange={(e) => setNP({...nP, role: e.target.value})} /></div>
                    <div className="relative"><input className="w-full bg-[#1c1f23] p-5 border border-slate-800 text-[10px] text-slate-500 outline-none uppercase pr-14 shadow-inner focus:border-teal-500" placeholder="CORE_TRAUMA" value={nP.trauma} onChange={(e) => setNP({...nP, trauma: e.target.value})} /><button onClick={() => setNP({...nP, trauma: CONFIG.T[Math.floor(Math.random() * CONFIG.T.length)]})} className="absolute right-4 top-4 text-slate-600 hover:text-teal-500 transition-all active:rotate-180 duration-300"><Dice5 size={24}/></button></div>
                    <button onClick={() => run('/persona/create', nP)} disabled={load || !nP.name} className="w-full py-6 bg-teal-500 text-black text-[11px] font-black uppercase shadow-2xl hover:bg-white active:scale-95 transition-all shadow-teal-500/20 italic tracking-widest">Commit DNA</button>
                </div>
                <div className="space-y-8 border-t border-slate-900 pt-14"><h3 className="text-teal-400 text-[11px] font-black uppercase border-b border-slate-900 pb-4 tracking-widest"><Database size={20}/> Establish Season</h3>
                    <input className="w-full bg-[#1c1f23] p-5 border border-slate-800 text-sm text-white font-bold outline-none focus:border-teal-500 uppercase shadow-inner" placeholder="TOPIC" value={nS.topic} onChange={(e) => setNS({...nS, topic: e.target.value})} />
                    <select className="w-full bg-[#1c1f23] p-5 border border-slate-800 text-[11px] text-teal-400 font-bold outline-none cursor-pointer shadow-inner" value={nS.relationship} onChange={(e) => setNS({...nS, relationship: e.target.value})}>{CONFIG.D.map(d => <option key={d}>{d}</option>)}</select>
                    <div className="grid grid-cols-2 gap-2 max-h-[180px] overflow-y-auto p-4 border border-slate-800 rounded-xl bg-black/40 custom-scrollbar shadow-inner shadow-black/80">{(personas || []).map(p => (<button key={p.id} onClick={() => { const ids = nS.host_ids.includes(p.id) ? nS.host_ids.filter(id => id !== p.id) : [...nS.host_ids, p.id]; setNS({...nS, host_ids: ids.slice(0, 2)}); }} className={`p-4 text-[9px] font-black border uppercase rounded-lg truncate transition-all ${nS.host_ids.includes(p.id) ? 'border-teal-500 bg-teal-500/10 text-teal-400 shadow-xl' : 'border-slate-800 text-slate-600 hover:border-slate-600'}`}>{p.name}</button>))}</div>
                    <div className="space-y-4">
                        <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase italic">Nodes <span>{nS.episodes_count} Eps</span></div>
                        <input type="range" min="1" max="24" className="w-full accent-teal-500 bg-slate-900 h-2 rounded-lg appearance-none cursor-pointer shadow-inner transition-all hover:accent-white shadow-teal-500/10" value={nS.episodes_count} onChange={(e) => setNS({...nS, episodes_count: e.target.value})} />
                    </div>
                    <button onClick={() => run('/season/reconcile', nS)} disabled={load || nS.host_ids.length !== 2} className="w-full py-6 bg-teal-500 text-black text-[11px] font-black uppercase shadow-2xl hover:bg-white active:scale-95 transition-all shadow-teal-500/20 italic tracking-widest">Establish Signal</button>
                </div>
            </aside>
        </div>
    );
};

export default App;
