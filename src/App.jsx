import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Trash2, UserPlus, Wifi, Cpu, X, Archive, BookOpen, History, ChevronRight, FileText, Activity, Zap, Terminal, Mic2, Headphones, Sparkles, UserCircle, MessageSquare, Copy, BarChart3, ClipboardCheck, Info, Volume2, Wand2, Radio } from 'lucide-react';

const BASE_URL = "https://shadow-cassandrafiles.pythonanywhere.com/api/v2";
const CONFIG = { G: ["Male", "Female", "Non-Binary", "Fluid"], D: ["Unresolved Sexual Tension", "Mentor / Mentee", "Enemies", "Frenemies", "Grudging Respect", "Buddy Cop", "Bitter Rivals", "Strategic Alliance"] };

const App = () => {
    const [view, setView] = useState('library'); // library | vault
    const [activeId, setActiveId] = useState(null); 
    const [viewPersona, setViewPersona] = useState(null); 
    const [activeEp, setActiveEp] = useState(null);
    const [viewLore, setViewLore] = useState(false);
    const [seasons, setSeasons] = useState([]);
    const [personas, setPersonas] = useState([]);
    const [load, setLoad] = useState(false);
    const [status, setStatus] = useState("");
    const [audioManifest, setAudioManifest] = useState(null);
    const [masterAudio, setMasterAudio] = useState(null);
    const [logs, setLogs] = useState([{ t: new Date().toLocaleTimeString(), m: "APEX_V204_VAULT_ACTIVE", type: "system" }]);

    const logRef = useRef(null);
    const addLog = (m, type = "info") => setLogs(p => [...p, { t: new Date().toLocaleTimeString(), m: typeof m === 'string' ? m : JSON.stringify(m), type }].slice(-50));

    const sync = useCallback(async () => {
        try {
            const resP = await fetch(`${BASE_URL}/persona/list`);
            const resS = await fetch(`${BASE_URL}/season/list`);
            if (resP.ok && resS.ok) { setPersonas(await resP.json()); setSeasons(await resS.json()); }
        } catch (e) { addLog("SYNC_FAIL", "error"); }
    }, []);

    useEffect(() => { sync(); }, [sync]);
    useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [logs]);

    const scoutAudio = async (epIdx) => {
        const ep = activeSeason.episodes[epIdx];
        if (!ep.full_script_blocks) return;
        try {
            const res = await fetch(`${BASE_URL}/episode/check_audio`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ season_id: activeId, ep_idx: epIdx, blocks_count: ep.full_script_blocks.length }) });
            const data = await res.json();
            setAudioManifest(data.audio_manifest);
            setMasterAudio(data.master_url);
        } catch (e) { console.error("Scout failed"); }
    };

    useEffect(() => { if (activeEp !== null) scoutAudio(activeEp); }, [activeEp]);

    const runProduction = async (epIdx) => {
        setLoad(true); let allBlocks = [];
        try {
            for (let i = 1; i <= 6; i++) {
                setStatus(`PRODUCING ACT ${i} / 6...`);
                const response = await fetch(`${BASE_URL}/episode/act_script`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ season_id: activeId.toString(), ep_idx: epIdx, act_num: i, previous_script: JSON.stringify(allBlocks.slice(-8)) }) });
                const data = await response.json(); allBlocks = [...allBlocks, ...(data.script_blocks || [])];
            }
            setStatus("Finalizing Assessment...");
            const resAss = await fetch(`${BASE_URL}/episode/assess`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ season_id: activeId.toString(), ep_idx: epIdx, sample: JSON.stringify(allBlocks.slice(0, 5)) }) });
            const assData = await resAss.json();
            const curS = seasons.find(s => s.id === activeId); const updatedEps = [...curS.episodes];
            updatedEps[epIdx].full_script_blocks = allBlocks; updatedEps[epIdx].assessment = assData.assessment;
            await fetch(`${BASE_URL}/episode/save_full`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ season_id: activeId.toString(), episodes: updatedEps }) });
            await sync();
        } finally { setLoad(false); setStatus(""); }
    };

    const generateAudio = async () => {
        setStatus("AURA DISPATCHER ACTIVE..."); setLoad(true);
        try {
            const res = await fetch(`${BASE_URL}/episode/generate_audio`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ season_id: activeId, ep_idx: activeEp, blocks: activeSeason.episodes[activeEp].full_script_blocks }) });
            const data = await res.json(); 
            if (data.error) addLog(data.error, "error"); else setAudioManifest(data.audio_manifest);
        } finally { setLoad(false); setStatus(""); }
    };

    const stitchAudio = async () => {
        setStatus("ASSEMBLING MASTER EPISODE..."); setLoad(true);
        try {
            const res = await fetch(`${BASE_URL}/episode/stitch_audio`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ season_id: activeId, ep_idx: activeEp, manifest: audioManifest }) });
            const data = await res.json(); 
            setMasterAudio(data.master_url);
            await sync();
        } finally { setLoad(false); setStatus(""); }
    };

    const activeSeason = seasons?.find(x => x.id === activeId);
    
    // VAULT AGGREGATOR
    const vaultEpisodes = seasons.reduce((acc, s) => {
        const mastered = s.episodes.filter(e => e.master_audio_url).map(e => ({ ...e, seasonTitle: s.title, seasonId: s.id }));
        return [...acc, ...mastered];
    }, []);

    return (
        <div className="h-screen w-screen font-mono flex bg-[#0a0c0e] text-slate-400 overflow-hidden text-[11px] select-none">
            {load && <div className="fixed inset-0 bg-black/90 z-[500] flex flex-col items-center justify-center text-teal-500 backdrop-blur-md font-black uppercase tracking-[0.4em]"><Activity className="animate-pulse mb-6" size={64}/>{status}</div>}
            
            <aside className="w-[260px] border-r border-slate-800 bg-black/80 flex flex-col shrink-0 p-4">
                <div className="text-teal-500 font-black uppercase text-[10px] italic flex items-center gap-2 mb-4"><Terminal size={14}/> Telemetry</div>
                <div ref={logRef} className="flex-1 overflow-y-auto space-y-2 opacity-60 custom-scrollbar text-[9px] uppercase">{logs.map((l, i) => <div key={i}>[{l.t}] {l.m}</div>)}</div>
            </aside>

            <main className="flex-1 flex flex-col p-8 bg-[#0d0f11] relative overflow-hidden">
                <div className="flex gap-4 mb-6 border-b border-slate-800 pb-6 shrink-0 items-center">
                    <button onClick={() => { setView('library'); setActiveId(null); setActiveEp(null); }} className={`px-8 py-3 font-black uppercase rounded-lg transition-all ${view === 'library' && !activeId ? 'bg-teal-500 text-black shadow-lg' : 'bg-slate-800'}`}>Library</button>
                    <button onClick={() => { setView('vault'); setActiveId(null); setActiveEp(null); }} className={`px-8 py-3 font-black uppercase rounded-lg transition-all flex items-center gap-2 ${view === 'vault' ? 'bg-teal-500 text-black shadow-lg' : 'bg-slate-800'}`}><Radio size={14}/> Broadcast Vault</button>
                    {activeId && <div className="flex-1 text-teal-500 font-black uppercase italic truncate text-lg px-4 truncate"><ChevronRight className="inline mr-2"/>{activeSeason?.title}</div>}
                </div>

                {view === 'vault' ? (
                    <div className="grid grid-cols-1 gap-4 overflow-y-auto custom-scrollbar pr-4">
                        <div className="bg-teal-950/10 p-6 border border-teal-900/30 rounded-3xl mb-4">
                            <h3 className="text-teal-500 font-black uppercase italic tracking-widest flex items-center gap-3"><Radio size={20}/> Produced Master Archives</h3>
                            <p className="text-[10px] text-slate-500 uppercase mt-2 italic">Every finalized broadcast is permanently stored here.</p>
                        </div>
                        {vaultEpisodes.map((e, i) => (
                            <div key={i} className="p-8 bg-slate-900/40 border border-slate-800 rounded-[2rem] flex items-center gap-8 hover:border-teal-500 transition-all shadow-xl group">
                                <div className="w-16 h-16 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-500"><Headphones size={32}/></div>
                                <div className="flex-1">
                                    <div className="text-[9px] text-teal-600 font-black uppercase mb-1">{e.seasonTitle}</div>
                                    <h4 className="text-white font-black uppercase text-xl italic">{e.title}</h4>
                                    <div className="text-[9px] text-slate-500 uppercase mt-1">Mastered: {e.produced_at}</div>
                                </div>
                                <audio controls className="h-10 accent-teal-500 w-80"><source src={`https://shadow-cassandrafiles.pythonanywhere.com${e.master_audio_url}`} type="audio/mpeg"/></audio>
                            </div>
                        ))}
                    </div>
                ) : activeId && activeEp !== null ? (
                    <div className="flex-1 flex flex-col gap-6 overflow-hidden">
                        <div className="bg-black/30 border border-slate-800 rounded-[2.5rem] p-8 flex flex-col overflow-hidden relative shadow-2xl">
                            <div className="flex justify-between items-center mb-6 shrink-0">
                                <div className="flex gap-4">
                                    <button onClick={() => { setActiveEp(null); setAudioManifest(null); setMasterAudio(null); }} className="text-slate-500 hover:text-white uppercase font-black italic text-[10px]">[ Close ]</button>
                                    {!audioManifest && activeSeason.episodes[activeEp].full_script_blocks && <button onClick={generateAudio} className="px-6 py-2 bg-teal-500 text-black font-black uppercase rounded-lg text-[9px] flex items-center gap-2 shadow-xl"><Volume2 size={12}/> Synthesize Aura</button>}
                                    {audioManifest && !masterAudio && <button onClick={stitchAudio} className="px-6 py-2 bg-teal-500 text-black font-black uppercase rounded-lg text-[9px] flex items-center gap-2 animate-pulse"><Wand2 size={12}/> Assemble Master</button>}
                                </div>
                                {masterAudio && (
                                    <div className="bg-teal-950/20 px-6 py-2 rounded-xl border border-teal-500/30 flex items-center gap-4">
                                        <Headphones className="text-teal-500" size={16}/>
                                        <audio controls className="h-6 accent-teal-500 w-64"><source src={`https://shadow-cassandrafiles.pythonanywhere.com${masterAudio}`} type="audio/mpeg"/></audio>
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
                                {audioManifest ? (
                                    <div className="space-y-3">
                                        {audioManifest.map((a, i) => (
                                            <div key={i} className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl flex items-center gap-6 hover:border-teal-500 transition-all group">
                                                <div className="w-10 h-10 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-500 font-black italic">{i+1}</div>
                                                <div className="flex-1"><div className="text-[9px] text-teal-600 font-black uppercase mb-1">{a.name}</div><audio controls className="h-8 accent-teal-500 w-full max-w-sm"><source src={`https://shadow-cassandrafiles.pythonanywhere.com${a.url}`} type="audio/mpeg"/></audio></div>
                                            </div>
                                        ))}
                                    </div>
                                ) : activeSeason?.episodes?.[activeEp]?.full_script_blocks ? (
                                    <><textarea readOnly className="w-full h-[40vh] bg-slate-950/80 p-8 rounded-3xl border border-teal-900/20 text-teal-300 font-mono text-[9px] resize-none outline-none select-text custom-scrollbar" value={JSON.stringify(activeSeason.episodes[activeEp].full_script_blocks, null, 4)} /><div className="bg-teal-950/10 p-8 border border-teal-900/30 rounded-3xl shadow-xl"><h4 className="text-teal-500 font-black uppercase italic flex items-center gap-2 mb-4"><ClipboardCheck size={20}/> Post-Production Assessment</h4><p className="text-slate-300 uppercase text-[10px] leading-relaxed">{activeSeason.episodes[activeEp].assessment}</p></div></>
                                ) : <div className="flex flex-col items-center justify-center h-full gap-8 opacity-40 hover:opacity-100 transition-opacity"><Mic2 size={80}/><button onClick={() => runProduction(activeEp)} className="px-12 py-5 bg-teal-500 text-black font-black uppercase text-[12px] rounded-2xl shadow-xl">Launch Master Engine</button></div>}
                            </div>
                        </div>
                    </div>
                ) : !activeId ? (
                    <div className="grid grid-cols-2 gap-8 overflow-y-auto custom-scrollbar pr-4">{seasons.map(s => (
                        <div key={s.id} onClick={() => setActiveId(s.id)} className="bg-[#1c1f23] p-10 border border-slate-800 rounded-[2rem] cursor-pointer hover:border-teal-500 transition-all relative group h-fit shadow-2xl shadow-teal-500/5">
                            <button onClick={(e) => { e.stopPropagation(); fetch(`${BASE_URL}/delete/season/${s.id}`, {method:'DELETE'}).then(sync); }} className="absolute top-6 right-6 text-red-900 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={20}/></button>
                            <h4 className="text-white font-black uppercase italic text-2xl">{s.title}</h4>
                            <div className="mt-3 text-teal-600 font-black uppercase italic">{s.rel} | {s.runtime}m Target</div>
                        </div>
                    ))}</div>
                ) : (
                    <div className="flex flex-col h-full gap-8 overflow-hidden">
                        <div className="bg-slate-900/50 p-10 border border-slate-800 rounded-[2.5rem] shadow-2xl relative overflow-hidden group"><div className="absolute top-0 right-0 p-8 text-teal-900 group-hover:text-teal-500 transition-colors"><Info size={40}/></div><h3 className="text-teal-500 font-black uppercase italic tracking-widest mb-6 flex items-center gap-3"><BookOpen size={20}/> Factual Season Briefing</h3><p className="text-slate-200 text-lg leading-relaxed uppercase select-text italic relative z-10">{activeSeason?.description || "Researching factual data..."}</p></div>
                        <div className="grid grid-cols-3 gap-6 overflow-y-auto pr-4 custom-scrollbar">{activeSeason?.episodes?.map((e, idx) => (
                            <div key={idx} className="relative group">
                                <div onClick={() => setActiveEp(idx)} className="p-8 border border-slate-800 bg-slate-900/30 rounded-[2rem] hover:border-teal-500 cursor-pointer text-center h-fit group transition-all shadow-lg shadow-teal-500/5">
                                    <div className="text-[10px] text-teal-800 font-black uppercase mb-3 italic">Node_{idx + 1}</div><h5 className="text-white font-black uppercase italic text-lg mb-4">{e?.title || "Researching..."}</h5>{e.full_script_blocks && <div className="mt-4 text-teal-500 text-[10px] font-black uppercase italic flex items-center justify-center gap-2"><Zap size={12}/> json_locked</div>}
                                </div>
                            </div>
                        ))}</div>
                    </div>
                )}
            </main>

            <aside className="w-[340px] bg-black/60 p-8 border-l border-slate-800 overflow-y-auto shrink-0 flex flex-col gap-10 shadow-2xl custom-scrollbar shadow-teal-500/10">
                <div className="space-y-6"><h3 className="text-teal-500 font-black uppercase border-b border-teal-900/30 pb-3 tracking-widest italic flex items-center gap-2"><UserPlus size={18}/> Identity Spawn</h3>
                <input className="w-full bg-slate-900/50 p-4 border border-slate-800 text-white font-bold rounded-xl outline-none focus:border-teal-500 uppercase text-[12px]" placeholder="NAME" value={nP.name} onChange={e => setNP({...nP, name: e.target.value})} /><textarea className="w-full bg-slate-900/50 p-4 border border-slate-800 text-slate-300 rounded-xl outline-none focus:border-teal-500 uppercase text-[10px] h-32 leading-relaxed" placeholder="DESCRIPTION" value={nP.description} onChange={e => setNP({...nP, description: e.target.value})} /><input className="w-full bg-slate-900/50 p-4 border border-slate-800 text-teal-300 rounded-xl outline-none focus:border-teal-500 uppercase text-[10px]" placeholder="CORE TRAUMA (OPTIONAL)" value={nP.trauma} onChange={e => setNP({...nP, trauma: e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                    <select className="bg-slate-900/50 p-4 border border-slate-800 text-teal-500 rounded-2xl outline-none uppercase font-black" value={nP.gender} onChange={e => setNP({...nP, gender: e.target.value})}>{CONFIG.G.map(g => <option key={g} value={g}>{g}</option>)}</select>
                    <select className="bg-slate-900/50 p-4 border border-slate-800 text-teal-500 rounded-2xl outline-none uppercase font-black" value={nP.role} onChange={e => setNP({...nP, role: e.target.value})}><option value="Host">Host</option><option value="Analyst">Analyst</option><option value="Skeptic">Skeptic</option></select>
                </div>
                <button onClick={async () => { setLoad(true); await fetch(`${BASE_URL}/persona/create`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(nP)}); await sync(); setLoad(false); }} disabled={!nP.name || load} className="w-full py-5 bg-teal-500 text-black font-black uppercase rounded-[1.5rem] shadow-2xl hover:bg-white transition-all">Commit DNA</button>
                <div className="flex flex-wrap gap-4 pt-6 border-t border-slate-900">{personas?.map(p => <div key={p.id} className="relative group"><img src={p.portrait} onClick={() => setViewPersona(p)} className="w-14 h-14 rounded-xl border-2 border-slate-800 hover:border-teal-500 cursor-pointer bg-black shadow-xl shadow-teal-500/5" alt="p" /><button onClick={(e) => { e.stopPropagation(); fetch(`${BASE_URL}/delete/persona/${p.id}`, {method:'DELETE'}).then(sync); }} className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500"><Trash2 size={10}/></button></div>)}</div></div>

                <div className="space-y-6 border-t border-slate-800 pt-10"><h3 className="text-teal-500 font-black uppercase border-b border-teal-900/30 pb-3 tracking-widest italic flex items-center gap-2"><Archive size={18}/> Season Architect</h3>
                <input className="w-full bg-slate-900/50 p-5 border border-slate-800 text-white font-bold rounded-2xl outline-none focus:border-teal-500 uppercase text-[12px]" placeholder="TOPIC" value={nS.topic} onChange={e => setNS({...nS, topic: e.target.value})} />
                <select className="w-full bg-slate-900/50 p-4 border border-slate-800 text-teal-400 rounded-2xl outline-none font-black text-[10px]" value={nS.relationship} onChange={e => setNS({...nS, relationship: e.target.value})}>{CONFIG.D.map(d => <option key={d} value={d}>{d}</option>)}</select>
                <div className="space-y-6 p-8 bg-black/40 rounded-[2rem] border border-slate-800 shadow-inner shadow-teal-500/5"><div className="flex justify-between text-[9px] font-black uppercase text-slate-500"><span>Nodes: {nS.episodes_count}</span><span>{nS.target_runtime}m</span></div><input type="range" min="1" max="24" className="w-full accent-teal-500 h-1" value={nS.episodes_count} onChange={e => setNS({...nS, episodes_count: parseInt(e.target.value)})} /><input type="range" min="5" max="25" className="w-full accent-teal-500 h-1" value={nS.target_runtime} onChange={e => setNS({...nS, target_runtime: parseInt(e.target.value)})} /></div>
                <div className="grid grid-cols-2 gap-3 max-h-40 overflow-y-auto">{personas?.map(p => (<button key={p.id} onClick={() => { const ids = nS.host_ids.includes(p.id) ? nS.host_ids.filter(x => x !== p.id) : [...nS.host_ids, p.id]; setNS({...nS, host_ids: ids.slice(0, 2)}); }} className={`p-4 text-[9px] font-black border truncate rounded-2xl transition-all ${nS.host_ids.includes(p.id) ? 'border-teal-500 text-teal-400 bg-teal-500/10 shadow-[0_0_15px_rgba(20,184,166,0.1)]' : 'border-slate-800 text-slate-600'}`}>{p.name}</button>))}</div>
                <button onClick={async () => { setLoad(true); await fetch(`${BASE_URL}/season/init`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(nS)}); await sync(); setLoad(false); }} disabled={nS.host_ids.length !== 2 || !nS.topic || load} className="w-full py-6 bg-teal-500 text-black font-black uppercase rounded-[1.5rem] shadow-2xl shadow-teal-500/10">Establish Season</button></div>
            </aside>

            {viewPersona && (
                <div className="fixed inset-0 z-[600] bg-black/95 flex items-center justify-center p-12 backdrop-blur-3xl" onClick={() => setViewPersona(null)}>
                    <div className="bg-[#0d0f11] w-full max-w-6xl h-[85vh] border border-teal-900/40 rounded-3xl p-10 flex gap-10 overflow-hidden relative shadow-2xl shadow-teal-500/20" onClick={e => e.stopPropagation()}>
                        <div className="w-[300px] shrink-0 space-y-6"><img src={viewPersona?.portrait} className="w-full aspect-square rounded-2xl border-2 border-teal-900/20 bg-black shadow-xl shadow-teal-500/10" alt="p" /><h2 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">{viewPersona?.name}</h2><div className="p-4 bg-teal-950/20 border border-teal-900/30 rounded-xl font-black text-white text-[12px] uppercase">{viewPersona?.dna?.mbti || "INTJ"} Profile / {viewPersona?.voice_id}</div><div className="bg-black/40 p-4 border border-slate-800 rounded-xl italic text-slate-400 text-[11px]">"{viewPersona?.dna?.intro}"</div></div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 space-y-8 uppercase text-[10px]"><div className="p-8 bg-black/40 border border-slate-800 rounded-2xl leading-relaxed select-text italic text-teal-500 font-bold uppercase shadow-inner">CORE TRAUMA: {viewPersona?.dna?.core_trauma}</div><div className="p-8 bg-black/40 border border-slate-800 rounded-2xl leading-relaxed italic">{viewPersona?.dna?.personality_blurb}</div><div className="grid grid-cols-2 gap-6"><div className="space-y-4 border-l border-teal-900/30 pl-6 text-[9px] uppercase shadow-teal-500/5"><div className="font-black text-teal-500 mb-2 italic text-[10px]">Cultural Likes</div>{viewPersona?.dna?.likes?.map((l, i) => <span key={i} className="mr-2 opacity-70">[{l}]</span>)}</div><div className="space-y-4 border-l border-red-900/30 pl-6 text-[9px] uppercase"><div className="font-black text-red-500 mb-2 italic text-[10px]">Aversions</div>{viewPersona?.dna?.dislikes?.map((d, i) => <span key={i} className="mr-2 opacity-70">[{d}]</span>)}</div></div><div className="space-y-3 pt-6 border-t border-slate-800"><h4 className="text-teal-500 font-black uppercase italic text-[10px] mb-4">25 Core Memories</h4>{viewPersona?.dna?.core_memories?.map((m, i) => <div key={i} className="p-3 bg-white/5 rounded-xl text-[10px] italic leading-relaxed opacity-70">[{i+1}] {m}</div>)}</div></div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default App;
