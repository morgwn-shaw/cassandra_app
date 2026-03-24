import React, { useState, useEffect } from 'react';
import { Zap, Trash2, Database, Quote, Loader2, UserPlus, History, FastForward, Wifi, Cpu, ThumbsUp, ThumbsDown, Dice5, ScrollText } from 'lucide-react';

const C = {
    G: ["Male", "Female", "Non-Binary", "Fluid"],
    D: ["UST - High Friction", "Grudging Respect", "Bitter Rivals", "Mentor / Mentee", "Buddy Cop", "Frenemies", "Shared Trauma Bond"],
    T: ["Witnessed server farm bleed-out.", "Neural-link betrayal.", "Identity wiped by ghost protocol.", "Exposed data laundering ring."]
};

const App = () => {
    const [view, setView] = useState('god'); const [tab, setTab] = useState('season');
    const [active, setActive] = useState(null); const [seasons, setSeasons] = useState([]); 
    const [personas, setPersonas] = useState([]); const [load, setLoad] = useState(false);
    const [eng, setEng] = useState('OFFLINE');

    const [nP, setNP] = useState({ name: '', role: 'Investigator', trauma: C.T[0], gender: 'Male' });
    const [nS, setNS] = useState({ topic: '', relationship: C.D[0], host_ids: [], episodes_count: 10 });

    const sync = async () => {
        try {
            const s = await fetch("https://shadow-cassandrafiles.pythonanywhere.com/api/v2/season/list"); if (s.ok) setSeasons(await s.json());
            const p = await fetch("https://shadow-cassandrafiles.pythonanywhere.com/api/v2/persona/list"); if (p.ok) setPersonas(await p.json());
        } catch (e) {}
    };
    useEffect(() => { sync(); }, []);

    const ping = async () => {
        setLoad(true); try {
            const r = await fetch("https://shadow-cassandrafiles.pythonanywhere.com/api/v2/ping");
            const d = await r.json(); setEng(d.status); window.alert("LINK ACTIVE: " + d.file);
        } catch (e) { window.alert("HANDSHAKE FAIL: " + e.message); } finally { setLoad(false); }
    };

    const runAction = async (path, body) => {
        setLoad(true); try {
            const r = await fetch("https://shadow-cassandrafiles.pythonanywhere.com/api/v2" + path, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body) });
            const d = await r.json(); if (d.error) window.alert(d.error); await sync();
        } catch (e) { window.alert("SIGNAL ERROR: " + e.message); } finally { setLoad(false); }
    };

    return (
        <div className="h-screen w-screen font-mono flex bg-[#0a0c0e] text-slate-400 overflow-hidden select-none">
            <aside className="w-[280px] border-r border-slate-800 bg-black/60 p-6 flex flex-col gap-6 shrink-0 shadow-2xl">
                <div className="border-b border-slate-900 pb-4"><div className="flex items-center gap-2 text-teal-500 font-black text-xs uppercase"><Cpu size={14}/> Apex_v78.0</div></div>
                <button onClick={ping} className="p-3 border border-teal-900/30 text-teal-500 text-[10px] font-black uppercase hover:bg-teal-500 hover:text-black rounded transition-all shadow-lg"><Wifi size={12}/> Handshake</button>
                <div className="mt-auto space-y-4 pt-6 border-t border-slate-900">
                    <div className="flex border border-slate-800 rounded overflow-hidden">
                        <button onClick={() => setView('god')} className={`flex-1 py-2 text-[10px] font-black ${view === 'god' ? 'bg-teal-500 text-black' : 'bg-slate-900'}`}>GOD</button>
                        <button onClick={() => setView('user')} className={`flex-1 py-2 text-[10px] font-black ${view === 'user' ? 'bg-teal-500 text-black' : 'bg-slate-900'}`}>USER</button>
                    </div>
                </div>
            </aside>

            <main className="flex-1 flex flex-col p-10 overflow-y-auto relative bg-[#121416]">
                {load && <div className="absolute inset-0 bg-black/95 z-[100] flex flex-col items-center justify-center backdrop-blur-xl"><Loader2 className="animate-spin text-teal-500 mb-2"/><p className="text-teal-500 text-[10px] font-black uppercase italic animate-pulse">Neural Linking...</p></div>}
                <div className="flex gap-4 mb-8 border-b border-slate-800 pb-6"><button onClick={() => {setActive(null); setTab('season');}} className={`px-10 py-3 text-[10px] font-black transition-all ${tab === 'season' && !active ? 'bg-teal-500 text-black shadow-lg' : 'bg-slate-800'}`}>SEASONS</button><button onClick={() => {setActive(null); setTab('persona');}} className={`px-10 py-3 text-[10px] font-black transition-all ${tab === 'persona' && !active ? 'bg-teal-500 text-black shadow-lg' : 'bg-slate-800'}`}>PERSONAS</button></div>
                
                {!active ? (<div className="grid grid-cols-2 gap-6 animate-in fade-in">
                    {((tab === 'season' ? seasons : personas) || []).map((i, k) => (
                        <div key={k} className="bg-[#1c1f23] border border-slate-800 p-6 rounded-2xl cursor-pointer hover:border-teal-500 flex gap-6 items-center group relative active:scale-95 transition-all shadow-inner" onClick={() => setActive(i)}>
                            <img src={i.portrait} className="w-16 h-16 rounded-xl grayscale group-hover:grayscale-0" alt="D"/>
                            <div className="min-w-0 flex-1"><h4 className="text-white font-black uppercase text-lg italic truncate">{i.title || i.name}</h4><p className="text-[10px] text-teal-500 font-black opacity-60 uppercase mt-1">{i.rel || i.role}</p></div>
                        </div>
                    ))}
                </div>) : (
                    <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="flex justify-between items-end border-b border-slate-800 pb-8"><h2 className="text-6xl font-black text-white uppercase italic tracking-tighter leading-none">{active.title || active.name}</h2><button onClick={() => setActive(null)} className="bg-teal-500 text-black px-10 py-3 text-[10px] font-black shadow-2xl">BACK</button></div>
                        {tab === 'season' && (<div className="space-y-10"><div className="bg-teal-950/10 p-10 border border-teal-900/30 rounded-3xl shadow-inner"><h4 className="text-teal-400 text-[10px] font-black uppercase mb-4 italic flex items-center gap-2"><ScrollText size={14}/> Blueprint</h4><p className="text-lg text-slate-300 leading-relaxed uppercase">{active.summary}</p></div>{view === 'god' && <div className="grid grid-cols-2 gap-8"><div className="bg-black/40 p-8 border border-slate-800 rounded-3xl h-[300px] overflow-y-auto custom-scrollbar"><h4 className="text-teal-500 text-[10px] font-black uppercase mb-4">Lore</h4>{(active.lore?.shared_anecdotes || []).map((a, j) => <p key={j} className="text-[10px] text-slate-500 italic mb-2 leading-tight">"{a}"</p>)}</div><div className="bg-black/40 p-8 border border-slate-800 rounded-3xl h-[300px] overflow-y-auto custom-scrollbar"><h4 className="text-teal-400 text-[10px] font-black uppercase mb-4">Roadmap</h4><p className="text-[12px] text-slate-400 leading-relaxed">{active.lore?.future_lore}</p></div></div>}</div>)}
                        {tab === 'persona' && (<div className="grid grid-cols-2 gap-10"><div className="bg-black/40 p-10 border border-slate-800 rounded-3xl flex flex-col gap-6 h-[750px] overflow-y-auto shadow-inner"><h4 className="text-teal-500 text-[10px] font-black uppercase flex items-center gap-2 italic tracking-widest"><Quote size={16}/> Dossier</h4><p className="text-teal-600 text-xs font-black uppercase border-b border-slate-900 pb-2">Role: {active.role} | Trauma: {active.trauma}</p><p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{active.archive?.bio}</p><div className="grid grid-cols-2 gap-6 border-t border-slate-800 pt-6"><div><h4 className="text-teal-600 text-[9px] font-black mb-3">Likes</h4>{(active.archive?.likes || []).map((l, j) => <p key={j} className="text-[9px] text-teal-400 italic mb-1">-{l}</p>)}</div><div><h4 className="text-red-900 text-[9px] font-black mb-3">Hates</h4>{(active.archive?.dislikes || []).map((d, j) => <p key={j} className="text-[9px] text-red-500 italic mb-1">-{d}</p>)}</div></div></div><div className="bg-black/40 p-10 border border-slate-800 rounded-3xl h-[750px] overflow-y-auto custom-scrollbar shadow-inner"><h4 className="text-teal-500 text-[10px] font-black uppercase mb-6 tracking-widest">DNA_Memories</h4>{(active.archive?.anecdotes || []).map((a, j) => <p key={j} className="p-4 bg-white/5 border border-white/5 text-[10px] text-slate-500 italic mb-3 rounded-lg leading-relaxed">"{a}"</p>)}</div></div>)}
                    </div>
                )}
            </main>

            <aside className="w-[380px] bg-[#0b0c0e] p-10 flex flex-col gap-10 border-l border-slate-800 overflow-y-auto shrink-0 shadow-2xl">
                <div className="space-y-6"><h3 className="text-teal-400 text-[10px] font-black uppercase border-b border-slate-900 pb-3 tracking-widest"><UserPlus size={16}/> Identity</h3>
                    <input className="w-full bg-[#1c1f23] p-4 border border-slate-800 text-xs text-white outline-none uppercase shadow-inner" placeholder="NAME" value={nP.name} onChange={(e) => setNP({...nP, name: e.target.value})} />
                    <div className="grid grid-cols-2 gap-4"><select className="bg-[#1c1f23] p-4 border border-slate-800 text-[10px] text-teal-500 font-black outline-none" value={nP.gender} onChange={(e) => setNP({...nP, gender: e.target.value})}>{C.G.map(g => <option key={g}>{g}</option>)}</select><input className="bg-[#1c1f23] p-4 border border-slate-800 text-[10px] text-slate-500 uppercase" placeholder="ROLE" value={nP.role} onChange={(e) => setNP({...nP, role: e.target.value})} /></div>
                    <div className="relative"><input className="w-full bg-[#1c1f23] p-4 border border-slate-800 text-[10px] text-slate-500 outline-none uppercase pr-12 shadow-inner" placeholder="TRAUMA" value={nP.trauma} onChange={(e) => setNP({...nP, trauma: e.target.value})} /><button onClick={() => setNP({...nP, trauma: C.T[Math.floor(Math.random() * C.T.length)]})} className="absolute right-3 top-3 text-slate-600 hover:text-teal-500"><Dice5 size={20}/></button></div>
                    <button onClick={() => runAction('/persona/create', nP)} disabled={load || !nP.name} className="w-full py-4 bg-teal-500 text-black text-[10px] font-black uppercase active:scale-95 transition-all shadow-xl">Commit DNA</button>
                </div>
                <div className="space-y-6 border-t border-slate-900 pt-10"><h3 className="text-teal-400 text-[10px] font-black uppercase border-b border-slate-900 pb-3 tracking-widest"><Database size={16}/> Reconcile</h3>
                    <input className="w-full bg-[#1c1f23] p-4 border border-slate-800 text-xs text-white focus:border-teal-500 outline-none uppercase shadow-inner" placeholder="TOPIC" value={nS.topic} onChange={(e) => setNS({...nS, topic: e.target.value})} />
                    <select className="w-full bg-[#1c1f23] p-4 border border-slate-800 text-[10px] text-teal-400 font-bold outline-none cursor-pointer" value={nS.relationship} onChange={(e) => setNS({...nS, relationship: e.target.value})}>{C.D.map(d => <option key={d}>{d}</option>)}</select>
                    <div className="grid grid-cols-2 gap-2 max-h-[160px] overflow-y-auto p-4 border border-slate-800 rounded-xl bg-black/40">{(personas || []).map(p => (<button key={p.id} onClick={() => { const ids = nS.host_ids.includes(p.id) ? nS.host_ids.filter(id => id !== p.id) : [...nS.host_ids, p.id]; setNS({...nS, host_ids: ids.slice(0, 2)}); }} className={`p-3 text-[9px] font-black border uppercase rounded truncate transition-all ${nS.host_ids.includes(p.id) ? 'border-teal-500 bg-teal-500/10 text-teal-400 shadow-lg' : 'border-slate-800 text-slate-600'}`}>{p.name}</button>))}</div>
                    <div className="space-y-2"><div className="flex justify-between text-[10px] font-black text-slate-600 uppercase italic">Nodes <span>{nS.episodes_count} Eps</span></div><input type="range" min="1" max="24" className="w-full accent-teal-500 h-1 bg-slate-900 rounded appearance-none cursor-pointer" value={nS.episodes_count} onChange={(e) => setNS({...nS, episodes_count: e.target.value})} /></div>
                    <button onClick={() => runAction('/season/reconcile', nS)} disabled={load || nS.host_ids.length !== 2} className="w-full py-4 bg-teal-500 text-black text-[10px] font-black uppercase shadow-2xl hover:bg-white transition-all">Establish Signal</button>
                </div>
            </aside>
        </div>
    );
};

export default App;
