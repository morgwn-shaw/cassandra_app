import React, { useState, useEffect } from 'react';
import { Zap, Trash2, Database, Quote, Loader2, Fingerprint, ScrollText, ShieldCheck, Dice5, UserPlus, ShieldAlert, PlayCircle, MessageSquare, History, FastForward, Wifi, Cpu, ThumbsUp, ThumbsDown } from 'lucide-react';

const CONFIG = {
    GENDERS: ["Male", "Female", "Non-Binary"],
    DYNAMICS: ["UST - High Friction", "Buddy Cop", "Bitter Rivals", "Frenemies", "Unresolved Sexual Tension", "Grudging Respect"],
    TRAUMAS: ["Witnessed server farm bleed-out.", "Neural-link betrayal.", "Identity wiped by ghost protocol.", "Exposed data laundering ring."]
};

const BASE = "[https://cassandrafiles.pythonanywhere.com/api/v2](https://cassandrafiles.pythonanywhere.com/api/v2)";

const App = () => {
    const [view, setView] = useState('god'); 
    const [tab, setTab] = useState('season');
    const [active, setActive] = useState(null);
    const [brief, setBrief] = useState(null);
    const [seasons, setSeasons] = useState([]);
    const [personas, setPersonas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [engine, setEngine] = useState('OFFLINE');

    const [newP, setNewP] = useState({ name: '', trauma: CONFIG.TRAUMAS[0], gender: 'Male' });
    const [newS, setNewS] = useState({ topic: '', relationship: CONFIG.DYNAMICS[0], host_ids: [], episodes_count: 10 });

    useEffect(() => { sync(); }, []);

    const sync = async () => {
        try {
            const s = await fetch(`${BASE}/season/list`); if (s.ok) setSeasons(await s.json());
            const p = await fetch(`${BASE}/persona/list`); if (p.ok) setPersonas(await p.json());
        } catch (e) {}
    };

    const handshake = async () => {
        setLoading(true);
        try {
            const r = await fetch(`${BASE}/ping`);
            const d = await r.json();
            setEngine(d.engine);
            window.alert(`Handshake Success: ${d.engine}`);
        } catch (e) { window.alert(`Handshake Failed: ${e.message}`); }
        finally { setLoading(false); }
    };

    const run = async (path, body) => {
        setLoading(true);
        try {
            const r = await fetch(`${BASE}${path}`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body) });
            const d = await r.json();
            if (d.error) window.alert(d.error);
            await sync();
        } catch (e) { window.alert(e.message); }
        finally { setLoading(false); }
    };

    const getBrief = async (id, idx) => {
        setLoading(true); setBrief(null);
        try {
            const r = await fetch(`${BASE}/showrunner/brief`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ season_id: id, node_index: idx }) });
            if (r.ok) setBrief(await r.json());
        } finally { setLoading(false); }
    };

    const list = tab === 'season' ? (seasons || []) : (personas || []);

    return (
        <div className="h-screen w-screen font-mono flex overflow-hidden bg-[#0a0c0e] text-slate-400 select-none">
            <aside className="w-[300px] border-r border-slate-800 bg-black/60 p-8 flex flex-col gap-6 shadow-2xl shrink-0">
                <div className="border-b border-slate-900 pb-6">
                    <div className="flex items-center gap-3 text-teal-500 font-black text-sm uppercase tracking-widest"><Cpu size={16}/> Apex_v54.0</div>
                    <div className="text-[10px] text-teal-900 uppercase font-black italic mt-2">{engine}</div>
                </div>
                <button onClick={handshake} className="w-full p-4 border border-teal-900/30 bg-teal-500/5 text-teal-500 text-[10px] font-black uppercase flex items-center justify-center gap-2 hover:bg-teal-500 hover:text-black transition-all rounded shadow-lg"><Wifi size={14}/> Ping_Apex</button>
                <div className="mt-auto space-y-4">
                    <div className="flex border border-slate-800 rounded overflow-hidden">
                        <button onClick={() => setView('god')} className={`flex-1 py-2 text-[10px] font-black ${view === 'god' ? 'bg-teal-500 text-black' : 'bg-slate-900'}`}>GOD</button>
                        <button onClick={() => setView('user')} className={`flex-1 py-2 text-[10px] font-black ${view === 'user' ? 'bg-teal-500 text-black' : 'bg-slate-900'}`}>USER</button>
                    </div>
                    <button onClick={() => run('/purge', {})} className="w-full p-4 bg-red-950/20 border border-red-900/30 text-red-500 text-[10px] font-black uppercase hover:bg-red-600 hover:text-white transition-all">Nuclear_Reset</button>
                </div>
            </aside>

            <main className="flex-1 flex flex-col p-12 overflow-y-auto relative bg-[#121416]">
                {loading && <div className="absolute inset-0 bg-black/95 z-[100] flex flex-col items-center justify-center backdrop-blur-xl"><Loader2 className="w-16 h-16 text-teal-500 animate-spin mb-4"/><p className="text-teal-400 text-xs font-black uppercase tracking-[1em] animate-pulse italic">Engaging_Neural_Sync...</p></div>}
                <div className="flex gap-4 mb-12 border-b border-slate-800 pb-8">
                    <button onClick={() => {setActive(null); setTab('season');}} className={`px-12 py-4 text-[11px] font-black transition-all ${tab === 'season' && !active ? 'bg-teal-500 text-black shadow-[0_0_20px_#2dd4bf30]' : 'bg-slate-800'}`}>SEASONS</button>
                    <button onClick={() => {setActive(null); setTab('persona');}} className={`px-12 py-4 text-[11px] font-black transition-all ${tab === 'persona' && !active ? 'bg-teal-500 text-black shadow-[0_0_20px_#2dd4bf30]' : 'bg-slate-800'}`}>DNA_VAULT</button>
                </div>

                {!active ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in">
                        {list.map((item, i) => (
                            <div key={i} className="bg-[#1c1f23] border border-slate-800 p-10 rounded-3xl cursor-pointer hover:border-teal-500 transition-all flex gap-8 items-center shadow-xl group relative" onClick={() => setActive(item)}>
                                {view === 'god' && <button onClick={async (e) => { e.stopPropagation(); await fetch(`${BASE}/delete/${tab}/${item.id}`, {method:'DELETE'}); sync(); }} className="absolute top-6 right-6 text-red-900 hover:text-red-500 transition-all z-10"><Trash2 size={18}/></button>}
                                <div className="w-24 h-24 rounded-2xl bg-slate-900 overflow-hidden border border-slate-800 shrink-0">
                                    {item?.portrait ? <img src={item.portrait} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" alt="DNA" /> : <Fingerprint className="m-8 text-slate-700" size={32}/>}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-white font-black uppercase text-2xl italic truncate tracking-tighter leading-none">{item?.title || item?.name}</h4>
                                    <p className="text-[10px] text-teal-500 uppercase font-black opacity-60 tracking-[0.2em] mt-2">{item?.rel || item?.archive?.mbti || 'Awaiting DNA'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="animate-in slide-in-from-bottom-8 duration-500 space-y-12">
                        <div className="flex justify-between items-end border-b border-slate-800 pb-12">
                            <h2 className="text-8xl font-black text-white uppercase italic tracking-tighter leading-none">{active?.title || active?.name}</h2>
                            <button onClick={() => setActive(null)} className="bg-teal-500 text-black px-14 py-5 text-xs font-black shadow-2xl active:scale-95">CLOSE</button>
                        </div>
                        {tab === 'season' && (
                            <div className="flex flex-col gap-12">
                                <div className="bg-teal-950/10 p-12 border border-teal-900/30 rounded-3xl">
                                    <h4 className="text-teal-400 text-[11px] font-black uppercase mb-6 flex items-center gap-3 italic tracking-[0.3em]"><ScrollText size={20}/> Grounded_Investigation</h4>
                                    <p className="text-[19px] text-slate-300 leading-relaxed uppercase">{active?.summary}</p>
                                </div>
                                {view === 'god' && (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                        <div className="bg-black/40 p-10 border border-slate-800 rounded-3xl">
                                            <h4 className="text-teal-500 text-[11px] font-black uppercase mb-6 flex items-center gap-2 italic"><History size={16}/> Shared_Lore</h4>
                                            <div className="space-y-3 h-[300px] overflow-y-auto custom-scrollbar">
                                                {(active?.lore?.shared_anecdotes || []).map((a, i) => <p key={i} className="text-[11px] text-slate-500 italic uppercase border-l-2 border-slate-800 pl-4 py-1 hover:text-white transition-all">"{a}"</p>)}
                                            </div>
                                        </div>
                                        <div className="bg-black/40 p-10 border border-slate-800 rounded-3xl">
                                            <h4 className="text-teal-400 text-[11px] font-black uppercase mb-6 flex items-center gap-2 italic"><FastForward size={16}/> Roadmap</h4>
                                            <p className="text-[15px] text-slate-400 p-4">{active?.lore?.future_lore}</p>
                                        </div>
                                    </div>
                                )}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 border-t border-slate-900 pt-14">
                                    <div className="space-y-6">
                                        {(active?.episodes || []).map((ep, idx) => (
                                            <div key={idx} className="p-8 bg-[#1c1f23] border border-slate-800 group hover:border-teal-500 transition-all flex flex-col gap-4 shadow-xl rounded-2xl">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-teal-500 text-[10px] font-black uppercase">NODE {ep?.act}</span>
                                                    <button onClick={() => getBrief(active.id, idx)} className="px-8 py-2 bg-slate-800 text-teal-500 text-[10px] font-black uppercase border border-slate-700 hover:bg-teal-500 hover:text-black">Ground</button>
                                                </div>
                                                <h4 className="text-white font-black text-2xl uppercase italic leading-none">{ep?.title}</h4>
                                                <p className="text-[13px] text-slate-500 uppercase italic leading-snug">{ep?.topic_summary}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="bg-black/60 border border-slate-800 rounded-3xl p-12 h-[900px] overflow-y-auto shadow-2xl relative">
                                        <h4 className="text-teal-500 text-[12px] font-black uppercase mb-10 border-b border-slate-900 pb-6">Production_Brief</h4>
                                        {brief?.acts ? Object.entries(brief.acts).map(([k, v], i) => (
                                            <div key={i} className="mb-14 animate-in slide-in-from-right-4">
                                                <span className="text-[11px] text-teal-400 font-black uppercase mb-5 block opacity-50 tracking-[0.4em]">{k.replace(/_/g, ' ')}</span>
                                                <p className="text-[17px] text-slate-400 uppercase italic">"{v}"</p>
                                            </div>
                                        )) : <div className="h-full flex items-center justify-center text-slate-800 text-xs font-black uppercase opacity-20 italic">Awaiting_Neural_Sync</div>}
                                    </div>
                                </div>
                            </div>
                        )}
                        {tab === 'persona' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in slide-in-from-bottom-10">
                                <div className="bg-black/40 p-12 border border-slate-800 rounded-3xl h-[800px] overflow-y-auto custom-scrollbar flex flex-col gap-10">
                                    <h4 className="text-teal-500 text-[12px] font-black uppercase border-b border-slate-800 pb-4 flex items-center gap-3"><Quote size={20}/> Forensic Dossier</h4>
                                    <p className="text-[16px] text-slate-300 uppercase tracking-wide">{active?.archive?.bio}</p>
                                    <div className="grid grid-cols-2 gap-8 border-t border-slate-800 pt-10">
                                        <div><h4 className="text-teal-600 text-[10px] font-black uppercase mb-4"><ThumbsUp size={14}/> Likes</h4>{(active?.archive?.likes || []).map((l, i) => <p key={i} className="text-[11px] text-teal-400 italic mb-2 border-l border-teal-900/50 pl-4">{l}</p>)}</div>
                                        <div><h4 className="text-red-900 text-[10px] font-black uppercase mb-4"><ThumbsDown size={14}/> Dislikes</h4>{(active?.archive?.dislikes || []).map((d, i) => <p key={i} className="text-[11px] text-red-500 italic mb-2 border-l border-red-900/50 pl-4">{d}</p>)}</div>
                                    </div>
                                </div>
                                <div className="bg-black/40 p-12 border border-slate-800 rounded-3xl h-[800px] overflow-y-auto custom-scrollbar">
                                    <h4 className="text-teal-500 text-[12px] font-black uppercase mb-8 border-b border-slate-800 pb-4">DNA_Memories</h4>
                                    {(active?.archive?.anecdotes || []).map((a, i) => <p key={i} className="p-6 bg-white/5 border border-white/5 text-[12px] text-slate-500 italic mb-5 rounded-xl">"{a}"</p>)}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>

            <aside className="w-[420px] bg-[#0b0c0e] p-12 flex flex-col gap-14 border-l border-slate-800 overflow-y-auto shadow-2xl shrink-0">
                <div className="space-y-8">
                    <h3 className="text-teal-400 text-xs font-black uppercase tracking-[0.3em] flex items-center gap-3 border-b border-slate-900 pb-4"><UserPlus size={20}/> Identity_Spawn</h3>
                    <input className="w-full bg-[#1c1f23] p-6 border border-slate-800 text-sm text-white font-bold outline-none uppercase focus:border-teal-500" placeholder="NAME" value={newP.name} onChange={(e) => setNewP({...newP, name: e.target.value})} />
                    <div className="grid grid-cols-2 gap-4">
                        <select className="bg-[#1c1f23] p-6 border border-slate-800 text-xs text-teal-500 font-black outline-none" value={newP.gender} onChange={(e) => setNewP({...newP, gender: e.target.value})}>{CONFIG.GENDERS.map(g => <option key={g}>{g}</option>)}</select>
                        <input className="w-full bg-[#1c1f23] p-6 border border-slate-800 text-xs text-slate-500 outline-none uppercase" value={newP.trauma} onChange={(e) => setNewP({...newP, trauma: e.target.value})} />
                    </div>
                    <button onClick={() => run('/persona/create', newP)} disabled={loading || !newP.name} className="w-full py-6 bg-teal-500 text-black text-xs font-black uppercase shadow-2xl hover:bg-white transition-all active:scale-95">COMMIT_DNA</button>
                </div>
                <div className="space-y-8 border-t border-slate-900 pt-14">
                    <h3 className="text-teal-400 text-xs font-black uppercase tracking-[0.3em] flex items-center gap-3 border-b border-slate-900 pb-4"><Database size={20}/> Establish_Season</h3>
                    <input className="w-full bg-[#1c1f23] p-6 border border-slate-800 text-sm text-white font-bold outline-none focus:border-teal-500 uppercase" placeholder="TOPIC" value={newS.topic} onChange={(e) => setNewS({...newS, topic: e.target.value})} />
                    <select className="w-full bg-[#1c1f23] p-6 border border-slate-800 text-xs text-teal-400 font-bold" value={newS.relationship} onChange={(e) => setNewS({...newS, relationship: e.target.value})}>{CONFIG.DYNAMICS.map(d => <option key={d}>{d}</option>)}</select>
                    <div className="grid grid-cols-2 gap-3 max-h-[220px] overflow-y-auto p-4 border border-slate-800 rounded-xl bg-black/40 custom-scrollbar">
                        {personas.map(p => (<button key={p.id} onClick={() => { const ids = newS.host_ids.includes(p.id) ? newS.host_ids.filter(id => id !== p.id) : [...newS.host_ids, p.id]; setNewS({...newS, host_ids: ids.slice(0, 2)}); }} className={`p-4 text-[10px] font-black border uppercase rounded-lg truncate transition-all ${newS.host_ids.includes(p.id) ? 'border-teal-500 bg-teal-500/10 text-teal-400' : 'border-slate-800 text-slate-600'}`}>{p.name}</button>))}
                    </div>
                    <button onClick={() => run('/season/reconcile', newS)} disabled={loading || newS.host_ids.length !== 2} className="w-full py-6 bg-teal-500 text-black text-xs font-black uppercase shadow-2xl hover:bg-white transition-all">ESTABLISH_SIGNAL</button>
                </div>
            </aside>
        </div>
    );
};

export default App;
