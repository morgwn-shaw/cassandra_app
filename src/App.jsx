import React, { useState, useEffect, useCallback } from 'react';
import { Trash2, UserPlus, Wifi, Cpu, X, Archive, BookOpen, History, ChevronRight, FileText, Activity, Zap, ClipboardCheck } from 'lucide-react';

const BASE_URL = "https://shadow-cassandrafiles.pythonanywhere.com/api/v2";

const App = () => {
    const [activeId, setActiveId] = useState(null); 
    const [viewPersona, setViewPersona] = useState(null); 
    const [activeEp, setActiveEp] = useState(null);
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
                setStatus(`ACT ${i} HANDOVER...`);
                const response = await fetch(`${BASE_URL}/episode/act_script`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ season_id: activeId.toString(), ep_idx: epIdx, act_num: i, previous_script: finalScript })
                });
                const data = await response.json();
                finalScript += `\n\n` + data.script;
                await new Promise(r => setTimeout(r, 800));
            }

            setStatus("SHOWRUNNER ASSESSMENT...");
            const resAss = await fetch(`${BASE_URL}/episode/assess`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ season_id: activeId.toString(), ep_idx: epIdx, full_script: finalScript })
            });
            const assData = await resAss.json();

            const currentSeason = seasons.find(s => s.id === activeId);
            const updatedEpisodes = [...currentSeason.episodes];
            updatedEpisodes[epIdx].full_script = finalScript;
            updatedEpisodes[epIdx].assessment = assData.assessment;

            await fetch(`${BASE_URL}/episode/save_full`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ season_id: activeId.toString(), episodes: updatedEpisodes })
            });
            await sync();
        } catch (e) { window.alert(e.message); }
        finally { setLoad(false); setStatus(""); }
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

            <aside className="w-[260px] border-r border-slate-800 bg-black/60 p-8 flex flex-col gap-6 shrink-0 shadow-2xl">
                <div className="flex items-center gap-3 text-teal-500 font-black uppercase tracking-widest border-b border-teal-900/30 pb-4 italic"><Cpu size={18}/> Apex_v178</div>
                <button onClick={sync} className="w-full p-4 border border-teal-900/30 text-teal-500 text-[10px] font-black uppercase hover:bg-teal-500 hover:text-black rounded transition-all italic flex items-center justify-center gap-2"><Wifi size={14}/> Sync</button>
            </aside>

            <main className="flex-1 flex flex-col p-10 bg-[#0d0f11] relative overflow-hidden">
                {!activeId ? (
                    <div className="grid grid-cols-2 gap-8 overflow-y-auto custom-scrollbar">
                        {seasons.map(s => (
                            <div key={s.id} onClick={() => setActiveId(s.id)} className="bg-[#1c1f23] p-10 border border-slate-800 rounded-[2rem] cursor-pointer hover:border-teal-500 transition-all shadow-2xl">
                                <h4 className="text-white font-black uppercase italic text-2xl">{s.title}</h4>
                                <div className="mt-3 text-teal-600 font-black uppercase text-[10px] italic">{s.rel} | Archetype: {s.archetype}</div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col h-full gap-8 overflow-hidden">
                        {activeEp !== null ? (
                            <div className="flex-1 bg-black/30 border border-slate-800 rounded-[2.5rem] p-12 flex flex-col gap-8 overflow-hidden relative shadow-inner">
                                <button onClick={() => setActiveEp(null)} className="absolute top-8 right-12 text-slate-500 hover:text-white font-black uppercase italic">[ Exit ]</button>
                                <div className="flex-1 overflow-y-auto custom-scrollbar pr-6 space-y-10">
                                    {activeSeason.episodes[activeEp].full_script ? (
                                        <>
                                            <div className="bg-slate-950/80 p-12 rounded-3xl border border-teal-900/20 text-slate-300 uppercase text-[13px] leading-[2] whitespace-pre-wrap select-text italic shadow-2xl">{activeSeason.episodes[activeEp].full_script}</div>
                                            <div className="bg-teal-950/10 p-10 border border-teal-900/30 rounded-3xl">
                                                <h4 className="text-teal-500 font-black uppercase italic flex items-center gap-2 mb-4"><ClipboardCheck size={20}/> Showrunner Assessment</h4>
                                                <p className="text-slate-400 uppercase text-[11px] leading-relaxed select-text">{activeSeason.episodes[activeEp].assessment}</p>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full gap-8">
                                            <FileText size={80} className="text-slate-800" />
                                            <button onClick={() => runProduction(activeEp)} className="px-12 py-5 bg-teal-500 text-black font-black uppercase text-[12px] rounded-2xl shadow-xl">Launch Production</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 gap-6 overflow-y-auto custom-scrollbar">
                                {activeSeason.episodes.map((e, idx) => (
                                    <div key={idx} onClick={() => setActiveEp(idx)} className="p-8 border border-slate-800 bg-slate-900/30 rounded-[2rem] hover:border-teal-500 cursor-pointer transition-all shadow-xl text-center">
                                        <div className="text-[10px] text-teal-800 font-black uppercase mb-3">NODE_{idx + 1}</div>
                                        <h5 className="text-white font-black uppercase italic text-lg mb-4">{e.title}</h5>
                                        {e.full_script && <div className="mt-4 text-teal-500 text-[10px] font-black uppercase italic flex items-center justify-center gap-2"><Zap size={12}/> Script Finalized</div>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>

            <aside className="w-[380px] bg-black/60 p-10 border-l border-slate-800 overflow-y-auto shrink-0 flex flex-col gap-12 shadow-2xl custom-scrollbar">
                {/* IDENTITY SPAWN & SEASON ARCHITECT UI - same as last version */}
            </aside>
        </div>
    );
};
export default App;
