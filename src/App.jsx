import React, { useState, useEffect } from 'react';
import { Zap, Trash2, Database, Quote, Loader2, UserPlus, History, FastForward, Wifi, Cpu, ThumbsUp, ThumbsDown } from 'lucide-react';

const CONFIG = {
    G: ["Male", "Female", "Non-Binary"],
    D: ["Buddy Cop", "UST - Friction", "Bitter Rivals", "Mentor/Mentee"],
    T: ["Server bleed-out.", "Neural betrayal.", "Identity wiped."]
};

const App = () => {
    const [view, setView] = useState('god'); const [tab, setTab] = useState('season');
    const [active, setActive] = useState(null); const [seasons, setSeasons] = useState([]); 
    const [personas, setPersonas] = useState([]); const [load, setLoad] = useState(false);
    const [brief, setBrief] = useState(null);
    const [nP, setNP] = useState({ name: '', trauma: CONFIG.T[0], gender: 'Male' });
    const [nS, setNS] = useState({ topic: '', relationship: CONFIG.D[0], host_ids: [], episodes_count: 10 });

    const sync = async () => {
        try {
            const s = await fetch("[https://shadow-cassandrafiles.pythonanywhere.com/api/v2/season/list](https://shadow-cassandrafiles.pythonanywhere.com/api/v2/season/list)"); if (s.ok) setSeasons(await s.json());
            const p = await fetch("[https://shadow-cassandrafiles.pythonanywhere.com/api/v2/persona/list](https://shadow-cassandrafiles.pythonanywhere.com/api/v2/persona/list)"); if (p.ok) setPersonas(await p.json());
        } catch (e) {}
    };
    useEffect(() => { sync(); }, []);

    const ping = async () => {
        setLoad(true); try {
            const r = await fetch("[https://shadow-cassandrafiles.pythonanywhere.com/api/v2/ping](https://shadow-cassandrafiles.pythonanywhere.com/api/v2/ping)");
            const d = await r.json(); window.alert("LINK_ACTIVE: " + d.status);
        } catch (e) { window.alert("PING_FAIL: " + e.message); } finally { setLoad(false); }
    };

    const createPersona = async () => {
        setLoad(true); try {
            const r = await fetch("[https://shadow-cassandrafiles.pythonanywhere.com/api/v2/persona/create](https://shadow-cassandrafiles.pythonanywhere.com/api/v2/persona/create)", { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(nP) });
            await sync();
        } finally { setLoad(false); }
    };

    const createSeason = async () => {
        setLoad(true); try {
            const r = await fetch("[https://shadow-cassandrafiles.pythonanywhere.com/api/v2/season/reconcile](https://shadow-cassandrafiles.pythonanywhere.com/api/v2/season/reconcile)", { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(nS) });
            await sync();
        } finally { setLoad(false); }
    };

    const getBrief = async (id, idx) => {
        setLoad(true); setBrief(null);
        try {
            const r = await fetch("[https://shadow-cassandrafiles.pythonanywhere.com/api/v2/showrunner/brief](https://shadow-cassandrafiles.pythonanywhere.com/api/v2/showrunner/brief)", { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ season_id: id, node_index: idx }) });
            const d = await r.json(); setBrief(d);
        } finally { setLoad(false); }
    };

    return (
        <div className="h-screen w-screen font-mono flex bg-[#0a0c0e] text-slate-400 overflow-hidden">
            <aside className="w-[280px] border-r border-slate-800 bg-black/60 p-6 flex flex-col gap-6 shrink-0 shadow-2xl">
                <div className="border-b border-slate-900 pb-4">
                    <div className="flex items-center gap-2 text-teal-500 font-black text-xs uppercase"><Cpu size={14}/> Apex_v61.0</div>
                </div>
                <button onClick={ping} className="p-3 border border-teal-900/30 text-teal-500 text-[10px] font-black uppercase hover:bg-teal-500 hover:text-black rounded"><Wifi size={12}/> Ping_Handshake</button>
                <div className="mt-auto space-y-4">
                    <div className="flex border border-slate-800 rounded">
                        <button onClick={() => setView('god')} className={`flex-1 py-2 text-[10px] font-black ${view === 'god' ? 'bg-teal-500 text-black' : 'bg-slate-900'}`}>GOD</button>
                        <button onClick={() => setView('user')} className={`flex-1 py-2 text-[10px] font-black ${view === 'user' ? 'bg-teal-500 text-black' : 'bg-slate-900'}`}>USER</button>
                    </div>
                </div>
            </aside>

            <main className="flex-1 flex flex-col p-10 overflow-y-auto relative bg-[#121416]">
                {load && <div className="absolute inset-0 bg-black/95 z-[100] flex flex-col items-center justify-center"><Loader2 className="animate-spin text-teal-500 mb-2"/><p className="text-teal-500 text-[10px] font-black uppercase">Syncing Neural Vault...</p></div>}
                <div className="flex gap-4 mb-8 border-b border-slate-800 pb-6">
                    <button onClick={() => {setActive(null); setTab('season');}} className={`px-10 py-3 text-[10px] font-black ${tab === 'season' && !active ? 'bg-teal-500 text-black' : 'bg-slate-800'}`}>SEASONS</button>
                    <button onClick={() => {setActive(null); setTab('persona');}} className={`px-10 py-3 text-[10px] font-black ${tab === 'persona' && !active ? 'bg-teal-500 text-black' : 'bg-slate-800'}`}>DNA_VAULT</button>
                </div>
                {!active ? (
                    <div className="grid grid-cols-2 gap-6">
                        {(tab === 'season' ? seasons : personas).map((i, k) => (
                            <div key={k} className="bg-[#1c1f23] border border-slate-800 p-6 rounded-2xl cursor-pointer hover:border-teal-500 flex gap-6 items-center group relative" onClick={() => setActive(i)}>
                                <div className="min-w-0 flex-1"><h4 className="text-white font-black uppercase text-lg italic truncate leading-none">{i.title || i.name}</h4><p className="text-[10px] text-teal-500 font-black opacity-60 uppercase mt-2">{i.rel || i.archive?.mbti}</p></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-10 animate-in slide-in-from-bottom-4">
                        <div className="flex justify-between items-end border-b border-slate-800 pb-8"><h2 className="text-6xl font-black text-white uppercase italic leading-none">{active.title || active.name}</h2><button onClick={() => setActive(null)} className="bg-teal-500 text-black px-10 py-3 text-[10px] font-black">BACK</button></div>
                        {tab === 'season' && (
                            <div className="space-y-10">
                                <div className="bg-teal-950/10 p-10 border border-teal-900/30 rounded-3xl"><h4 className="text-teal-400 text-[10px] font-black uppercase mb-4 italic tracking-widest">Blueprint</h4><p className="text-lg text-slate-300 leading-relaxed uppercase">{active.summary}</p></div>
                                {view === 'god' && <div className="grid grid-cols-2 gap-8"><div className="bg-black/40 p-8 border border-slate-800 rounded-3xl h-[300px] overflow-y-auto custom-scrollbar"><h4 className="text-teal-500 text-[10px] font-black uppercase mb-4">Lore</h4>{(active.lore?.shared_anecdotes || []).map((a, j) => <p key={j} className="text-[10px] text-slate-500 italic mb-2">"{a}"</p>)}</div><div className="bg-black/40 p-8 border border-slate-800 rounded-3xl h-[300px] overflow-y-auto custom-scrollbar"><h4 className="text-teal-400 text-[10px] font-black uppercase mb-4">Future</h4><p className="text-[12px] text-slate-400 leading-relaxed">{active.lore?.future_lore}</p></div></div>}
                                <div className="grid grid-cols-2 gap-10">
                                    <div className="space-y-4">{(active.episodes || []).map((e, j) => (<div key={j} className="p-6 bg-[#1c1f23] border border-slate-800 rounded-xl flex flex-col gap-3 group hover:border-teal-500"><div className="flex justify-between items-center"><span className="text-teal-500 text-[9px] font-black uppercase">NODE {e.act}</span><button onClick={() => getBrief(active.id, j)} className="px-5 py-1 bg-slate-800 text-teal-500 text-[9px] font-black uppercase border border-slate-700 hover:bg-teal-500 hover:text-black">Brief</button></div><h4 className="text-white font-black text-xl italic leading-none">{e.title}</h4></div>))}</div>
                                    <div className="bg-black/60 border border-slate-800 rounded-3xl p-10 h-[750px] overflow-y-auto shadow-2xl"><h4 className="text-teal-500 text-[11px] font-black uppercase mb-8 border-b border-slate-900 pb-4">Production_Brief</h4>{brief?.acts ? Object.entries(brief.acts).map(([k, v], j) => (<div key={j} className="mb-10"><span className="text-[9px] text-teal-400 font-black uppercase mb-3 block opacity-50">{k}</span><p className="text-[15px] text-slate-400 uppercase leading-relaxed italic">"{v}"</p></div>)) : <div className="h-full flex items-center justify-center text-slate-800 text-[10px] font-black uppercase">Standby...</div>}</div>
                                </div>
                            </div>
                        )}
                        {tab === 'persona' && (
                            <div className="grid grid-cols-2 gap-10 animate-in fade-in"><div className="bg-black/40 p-10 border border-slate-800 rounded-3xl flex flex-col gap-8 h-[750px] overflow-y-auto shadow-inner"><h4 className="text-teal-500 text-[10px] font-black uppercase flex items-center gap-2 tracking-widest"><Quote size={16}/> Dossier</h4><p className="text-slate-300 text-sm leading-relaxed">{active.archive?.bio}</p><div className="grid grid-cols-2 gap-6 border-t border-slate-800 pt-8"><div><h4 className="text-teal-600 text-[9px] font-black uppercase mb-3"><ThumbsUp size={12}/> Likes</h4>{active.archive?.likes?.map((l, j) => <p key={j} className="text-[9px] text-teal-400 italic mb-2">-{l}</p>)}</div><div><h4 className="text-red-900 text-[9px] font-black uppercase mb-3"><ThumbsDown size={12}/> Hates</h4>{active.archive?.dislikes?.map((d, j) => <p key={j} className="text-[9px] text-red-500 italic mb-2">-{d}</p>)}</div></div></div><div className="bg-black/40 p-10 border border-slate-800 rounded-3xl h-[750px] overflow-y-auto custom-scrollbar shadow-inner"><h4 className="text-teal-500 text-[10px] font-black uppercase mb-6 tracking-widest">DNA_Memories</h4>{(active.archive?.anecdotes || []).map((a, j) => <p key={j} className="p-5 bg-white/5 border border-white/5 text-[10px] text-slate-500 italic mb-4 rounded-xl leading-relaxed">"{a}"</p>)}</div></div>
                        )}
                    </div>
                )}
            </main>

            <aside className="w-[380px] bg-[#0b0c0e] p-10 flex flex-col gap-12 border-l border-slate-800 overflow-y-auto shrink-0 shadow-2xl">
                <div className="space-y-6"><h3 className="text-teal-400 text-[10px] font-black uppercase border-b border-slate-900 pb-3">Identity</h3><input className="w-full bg-[#1c1f23] p-4 border border-slate-800 text-xs text-white font-bold outline-none uppercase" placeholder="NAME" value={nP.name} onChange={(e) => setNP({...nP, name: e.target.value})} /><div className="grid grid-cols-2 gap-4"><select className="bg-[#1c1f23] p-4 border border-slate-800 text-[10px] text-teal-500 font-black outline-none" value={nP.gender} onChange={(e) => setNP({...nP, gender: e.target.value})}>{CONFIG.G.map(g => <option key={g}>{g}</option>)}</select><input className="w-full bg-[#1c1f23] p-4 border border-slate-800 text-[10px] text-slate-500 outline-none uppercase" placeholder="TRAUMA" value={nP.trauma} onChange={(e) => setNP({...nP, trauma: e.target.value})} /></div><button onClick={createPersona} disabled={load || !nP.name} className="w-full py-5 bg-teal-500 text-black text-[10px] font-black uppercase shadow-2xl hover:bg-white active:scale-95 transition-all">Commit_DNA</button></div>
                <div className="space-y-6 border-t border-slate-900 pt-10"><h3 className="text-teal-400 text-[10px] font-black uppercase border-b border-slate-900 pb-3">Establish</h3><input className="w-full bg-[#1c1f23] p-4 border border-slate-800 text-xs text-white font-bold outline-none focus:border-teal-500 uppercase" placeholder="TOPIC" value={nS.topic} onChange={(e) => setNS({...nS, topic: e.target.value})} /><select className="w-full bg-[#1c1f23] p-4 border border-slate-800 text-[10px] text-teal-400 font-bold outline-none" value={nS.relationship} onChange={(e) => setNS({...nS, relationship: e.target.value})}>{CONFIG.D.map(d => <option key={d}>{d}</option>)}</select><div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto p-4 border border-slate-800 rounded-xl bg-black/40 custom-scrollbar shadow-inner">{(personas || []).map(p => (<button key={p.id} onClick={() => { const ids = nS.host_ids.includes(p.id) ? nS.host_ids.filter(id => id !== p.id) : [...nS.host_ids, p.id]; setNS({...nS, host_ids: ids.slice(0, 2)}); }} className={`p-3 text-[9px] font-black border uppercase rounded truncate ${nS.host_ids.includes(p.id) ? 'border-teal-500 bg-teal-500/10 text-teal-400' : 'border-slate-800 text-slate-600'}`}>{p.name}</button>))}</div><button onClick={createSeason} disabled={load || nS.host_ids.length !== 2} className="w-full py-5 bg-teal-500 text-black text-[10px] font-black uppercase shadow-2xl hover:bg-white active:scale-95 transition-all">Establish_Signal</button></div>
            </aside>
        </div>
    );
};

export default App;
