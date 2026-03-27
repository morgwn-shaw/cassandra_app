import React, { useState, useEffect, useCallback } from 'react';
import { Trash2, Loader2, UserPlus, Wifi, Cpu, X, Archive, BookOpen, History, ChevronRight, FileText, Activity, Zap } from 'lucide-react';

const BASE_URL = "https://shadow-cassandrafiles.pythonanywhere.com/api/v2";

const App = () => {
    const [activeId, setActiveId] = useState(null); 
    const [viewPersona, setViewPersona] = useState(null); 
    const [activeEp, setActiveEp] = useState(null);
    const [viewLore, setViewLore] = useState(false);
    const [seasons, setSeasons] = useState([]);
    const [personas, setPersonas] = useState([]);
    const [load, setLoad] = useState(false);
    const [status, setStatus] = useState("");

    const [nP, setNP] = useState({ name: '', role: 'Analyst', trauma: 'None', gender: 'Male' });
    const [nS, setNS] = useState({ topic: '', relationship: 'Enemies', host_ids: [], episodes_count: 8, target_runtime: 15 });

    const sync = useCallback(async () => {
        try {
            const resP = await fetch(`${BASE_URL}/persona/list`);
            const resS = await fetch(`${BASE_URL}/season/list`);
            if (resP.ok && resS.ok) {
                setPersonas(await resP.json());
                setSeasons(await resS.json());
            }
        } catch (e) { console.error(e); }
    }, []);

    useEffect(() => { sync(); }, [sync]);

    const runProduction = async (epIdx) => {
        setLoad(true);
        let finalScript = "";
        try {
            for (let i = 1; i <= 6; i++) {
                setStatus(`PRODUCING ACT ${i} / 6...`);
                const response = await fetch(`${BASE_URL}/episode/act_script`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        season_id: activeId,
                        ep_idx: epIdx,
                        act_num: i,
                        previous_script: finalScript.slice(-500)
                    })
                });
                
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || "Server error");
                
                finalScript += `\n\n--- [ACT ${i}] ---\n\n` + data.script;
                // Tiny pause for the UI to breathe
                await new Promise(r => setTimeout(r, 500));
            }

            setStatus("FINALIZING PRODUCTION...");
            await fetch(`${BASE_URL}/episode/save_full`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ season_id: activeId, ep_idx: epIdx, full_script: finalScript })
            });
            await sync();
        } catch (e) {
            window.alert(`PRODUCTION FAILED: ${e.message}`);
        } finally {
            setLoad(false); setStatus("");
        }
    };

    const activeSeason = seasons.find(x => x.id === activeId);

    return (
        <div className="h-screen w-screen font-mono flex bg-[#0a0c0e] text-slate-400 overflow-hidden text-[12px] select-none">
            {load && (
                <div className="fixed inset-0 bg-black/90 z-[300] flex flex-col items-center justify-center backdrop-blur-xl">
                    <Activity className="animate-pulse text-teal-500 mb-6" size={64}/>
                    <div className="text-teal-500 font-black uppercase tracking-[0.4em] text-lg">{status}</div>
                </div>
            )}

            {/* PERSONA DOSSIER */}
            {viewPersona && (
                <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-12 backdrop-blur-3xl" onClick={() => setViewPersona(null)}>
                    <div className="bg-[#0d0f11] w-full max-w-5xl h-[80vh] border border-teal-900/40 rounded-3xl p-10 flex gap-10 overflow-hidden relative shadow-2xl" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setViewPersona(null)} className="absolute top-8 right-8 text-slate-500 hover:text-white"><X size={32}/></button>
                        <div className="w-[300px] shrink-0 space-y-6">
                            <img src={viewPersona?.portrait} className="w-full aspect-square rounded-2xl border-2 border-teal-900/20 bg-black" alt="p" />
                            <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">{viewPersona?.name}</h2>
                            <div className="space-y-4 pt-6 border-t border-slate-800 overflow-y-auto custom-scrollbar pr-3 h-[300px]">
                                <h4 className="text-teal-500 font-black text-[9px] uppercase tracking-widest italic">DNA_Likes</h4>
                                <div className="flex flex-wrap gap-1">
                                    {(viewPersona?.archive?.likes || []).map((l, i) => <span key={i} className="px-2 py-1 bg-teal-500/5 border border-teal-500/10 text-teal-400 text-[8px] rounded uppercase">{l}</span>)}
                                </div>
                                <h4 className="text-red-500 font-black text-[9px] uppercase tracking-widest italic">Aversions</h4>
                                <div className="flex flex-wrap gap-1">
                                    {(viewPersona?.archive?.dislikes || []).map((d, i) => <span key={i} className="px-2 py-1 bg-red-500/5 border border-red-500/10 text-red-400 text-[8px] rounded uppercase">{d}</span>)}
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-8 select-text custom-scrollbar pr-6">
                            <div className="bg-black/40 p-8 rounded-2xl border border-slate-800">
                                <h4 className="text-teal-500 font-black mb-4 uppercase italic">Behavioral_Bio</h4>
                                <p className="text-slate-300 text-sm leading-relaxed uppercase">{viewPersona?.archive?.bio}</p>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-teal-500 font-black uppercase italic">Life_Anecdotes</h4>
                                {(viewPersona?.archive?.anecdotes || []).map((a, i) => <p key={i} className="p-5 bg-white/5 rounded-xl text-[11px] italic uppercase border border-white/5">"{a}"</p>)}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* SIDEBAR */}
            <aside className="w-[260px] border-r border-slate-800 bg-black/60 p-8 flex flex-col gap-6 shrink-0 shadow-2xl">
                <div className="flex items-center gap-3 text-teal-500 font-black uppercase tracking-widest border-b border-teal-900/30 pb-4 italic"><Cpu size={18}/> Apex_v172</div>
                <button onClick={sync} className="w-full p-4 border border-teal-900/30 text-teal-500 text-[10px] font-black uppercase hover:bg-teal-500 hover:text-black rounded transition-all italic flex items-center justify-center gap-2"><Wifi size={14}/> Sync Data</button>
            </aside>

            {/* MAIN */}
            <main className="flex-1 flex flex-col p-10 bg-[#0d0f11] relative overflow-hidden">
                <div className="flex gap-4 mb-8 border-b border-slate-800 pb-8 shrink-0 items-center">
                    <button onClick={() => { setActiveId(null); setViewLore(false); setActiveEp(null); }} className={`px-8 py-3 font-black text-[10px] uppercase transition-all rounded-lg ${!activeId ? 'bg-teal-500 text-black shadow-lg shadow-teal-500/20' : 'bg-slate-800'}`}>Library</button>
                    {activeId && (
                        <>
                            <ChevronRight size={18} className="text-slate-700"/>
                            <div className="flex-1 text-teal-500 font-black uppercase italic tracking-widest truncate text-lg">{activeSeason?.title}</div>
                        </>
                    )}
                </div>

                {!activeId ? (
                    <div className="grid grid-cols-2 gap-8 overflow-y-auto pr-4 custom-scrollbar">
                        {seasons.map(s => (
                            <div key={s.id} onClick={() => setActiveId(s.id)} className="bg-[#1c1f23] p-10 border border-slate-800 rounded-[2rem] cursor-pointer hover:border-teal-500 transition-all relative group shadow-2xl">
                                <button onClick={(e) => { e.stopPropagation(); fetch(`${BASE_URL}/delete/season/${s.id}`, {method:'DELETE'}).then(sync); }} className="absolute top-8 right-8 text-red-900 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={24}/></button>
                                <h4 className="text-white font-black uppercase italic text-2xl tracking-tighter">{s.title}</h4>
                                <div className="mt-3 flex items-center gap-3 text-teal-600 font-black uppercase text-[10px] italic"><span>{s.rel}</span><span className="text-slate-800">|</span><span>{s.episodes?.length || 0} Nodes</span></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col h-full gap-8 overflow-hidden">
                        {activeEp !== null ? (
                            <div className="flex-1 bg-black/30 border border-slate-800 rounded-[2.5rem] p-12 flex flex-col gap-8 overflow-hidden relative shadow-inner">
                                <button onClick={() => setActiveEp(null)} className="absolute top-8 right-12 text-slate-500 hover:text-white uppercase text-[10px] font-black italic tracking-[0.2em]">[ Exit ]</button>
                                <div className="space-y-3 border-b border-slate-800 pb-8">
                                    <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter">{activeSeason.episodes[activeEp].title}</h3>
                                    <p className="text-teal-500 uppercase font-black text-[11px] tracking-[0.3em] italic">Atomic Generation Sequence</p>
                                </div>
                                <div className="flex-1 overflow-y-auto custom-scrollbar pr-6">
                                    {activeSeason.episodes[activeEp].full_script ? (
                                        <div className="bg-slate-950/80 p-12 rounded-3xl border border-teal-900/20 text-slate-300 uppercase text-[13px] leading-[2] whitespace-pre-wrap select-text italic shadow-2xl">{activeSeason.episodes[activeEp].full_script}</div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full gap-8">
                                            <FileText size={80} className="text-slate-800" />
                                            <button onClick={() => runProduction(activeEp)} className="px-12 py-5 bg-teal-500 text-black font-black uppercase text-[12px] rounded-2xl shadow-[0_0_30px_rgba(20,184,166,0.3)]">Launch Atomic Producer</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 gap-6 overflow-y-auto pr-4 custom-scrollbar">
                                {activeSeason.episodes.map((e, idx) => (
                                    <div key={idx} onClick={() => setActiveEp(idx)} className="p-8 border border-slate-800 bg-slate-900/30 rounded-[2rem] hover:border-teal-500/50 cursor-pointer transition-all shadow-xl group">
                                        <div className="text-[10px] text-teal-800 font-black uppercase mb-3 tracking-widest italic">ACT_NODE_{idx + 1}</div>
                                        <h5 className="text-white font-black uppercase italic text-lg mb-4 leading-tight">{e.title}</h5>
                                        {e.full_script && <div className="mt-6 pt-4 border-t border-slate-800 text-teal-500 text-[10px] font-black uppercase italic flex items-center gap-2"><Zap size={12}/> Script Finalized</div>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>

            <aside className="w-[380px] bg-black/60 p-10 border-l border-slate-800 overflow-y-auto shrink-0 flex flex-col gap-12 shadow-2xl custom-scrollbar">
                <div className="space-y-6">
                    <h3 className="text-teal-500 text-[11px] font-black uppercase border-b border-teal-900/30 pb-3 tracking-widest italic flex items-center gap-2"><UserPlus size={18}/> Identity Spawn</h3>
                    <input className="w-full bg-slate-900/50 p-5 border border-slate-800 text-white font-bold rounded-2xl outline-none focus:border-teal-500 uppercase text-sm" placeholder="NAME" value={nP.name} onChange={e => setNP({...nP, name: e.target.value})} />
                    <button onClick={async () => { setLoad(true); setStatus("Committing DNA..."); await fetch(`${BASE_URL}/persona/create`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(nP)}); await sync(); setLoad(false); setStatus(""); }} className="w-full py-6 bg-teal-500 text-black font-black uppercase text-[12px] rounded-[1.5rem] shadow-2xl">Commit Subject DNA</button>
                    <div className="flex flex-wrap gap-4 pt-6 border-t border-slate-900">
                        {personas.map(p => <img key={p.id} src={p.portrait} onClick={() => setViewPersona(p)} className="w-16 h-16 rounded-2xl border-2 border-slate-800 hover:border-teal-500 cursor-pointer bg-black" alt="p" />)}
                    </div>
                </div>

                <div className="space-y-6 border-t border-slate-800 pt-10">
                    <h3 className="text-teal-500 text-[11px] font-black uppercase border-b border-teal-900/30 pb-3 tracking-widest italic flex items-center gap-2"><Archive size={18}/> Season Architect</h3>
                    <input className="w-full bg-slate-900/50 p-5 border border-slate-800 text-white font-bold rounded-2xl outline-none focus:border-teal-500 uppercase text-sm" placeholder="TOPIC" value={nS.topic} onChange={e => setNS({...nS, topic: e.target.value})} />
                    <div className="grid grid-cols-2 gap-3 max-h-40 overflow-y-auto p-4 bg-black/20 rounded-2xl border border-slate-800 custom-scrollbar">
                        {personas.map(p => (
                            <button key={p.id} onClick={() => { const ids = nS.host_ids.includes(p.id) ? nS.host_ids.filter(x => x !== p.id) : [...nS.host_ids, p.id]; setNS({...nS, host_ids: ids.slice(0, 2)}); }} className={`p-4 text-[9px] font-black border truncate uppercase rounded-2xl transition-all ${nS.host_ids.includes(p.id) ? 'border-teal-500 text-teal-400 bg-teal-500/10' : 'border-slate-800 text-slate-600'}`}>{p.name}</button>
                        ))}
                    </div>
                    <button onClick={async () => { setLoad(true); setStatus("Mapping Architecture..."); await fetch(`${BASE_URL}/season/reconcile`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(nS)}); await sync(); setLoad(false); setStatus(""); }} disabled={nS.host_ids.length !== 2 || !nS.topic} className="w-full py-6 bg-teal-500 text-black font-black uppercase text-[12px] rounded-[1.5rem] shadow-2xl">Establish Season</button>
                </div>
            </aside>
        </div>
    );
};

export default App;
