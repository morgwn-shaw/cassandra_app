import React, { useState, useEffect } from 'react';
import { Zap, Activity, Trash2, Database, Quote, Brain, Loader2, Fingerprint, ScrollText, ShieldCheck, Dice5, UserPlus, PlayCircle, MessageSquareText } from 'lucide-react';

const API_BASE = "https://shadow-cassandrafiles.pythonanywhere.com/api/v2";

const App = () => {
    const [viewMode, setViewMode] = useState('god'); 
    const [activeTab, setActiveTab] = useState('season');
    const [activeItem, setActiveItem] = useState(null);
    const [activeBrief, setActiveBrief] = useState(null);
    const [activeScript, setActiveScript] = useState(null);
    const [loading, setLoading] = useState(false);
    const [briefLoading, setBriefLoading] = useState(false);
    const [status, setStatus] = useState({ stage: 'IDLE', history: [] });

    const [seasons, setSeasons] = useState([]);
    const [personas, setPersonas] = useState([]);
    const [newP, setNewP] = useState({ name: '', role: 'Forensic Investigator', trauma: '', gender: 'Male' });
    const [newS, setNewS] = useState({ topic: '', relationship: 'UST - High Friction', host_ids: [], episodes_count: 10 });

    useEffect(() => {
        refreshData();
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`${API_BASE}/status`);
                setStatus(await res.json());
            } catch (e) {}
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const refreshData = async () => {
        try {
            const sRes = await fetch(`${API_BASE}/season/list`);
            setSeasons(await sRes.json() || []);
            const pRes = await fetch(`${API_BASE}/persona/list`);
            setPersonas(await pRes.json() || []);
        } catch (e) {}
    };

    const runAction = async (endpoint, body) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}${endpoint}`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body) });
            if (!res.ok) throw new Error(await res.text());
            await refreshData();
        } catch (e) { window.alert(`ACTION_FAILED: ${e.message}`); }
        finally { setLoading(false); }
    };

    const getBrief = async (seasonId, idx) => {
        setActiveBrief(null); setActiveScript(null);
        setBriefLoading(true);
        try {
            const res = await fetch(`${API_BASE}/showrunner/brief`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ season_id: seasonId, node_index: idx }) });
            setActiveBrief(await res.json());
        } finally { setBriefLoading(false); }
    };

    const generateScript = async () => {
        setBriefLoading(true);
        try {
            const res = await fetch(`${API_BASE}/showrunner/script`, { 
                method: 'POST', 
                headers: {'Content-Type': 'application/json'}, 
                body: JSON.stringify({ season_id: activeItem.id, brief: activeBrief }) 
            });
            const data = await res.json();
            setActiveScript(data.script);
        } finally { setBriefLoading(false); }
    };

    return (
        <div className="h-screen w-screen font-mono flex overflow-hidden bg-[#0d0f11] text-slate-400">
            {loading && (
                <div className="fixed inset-0 bg-black/95 z-[100] flex flex-col items-center justify-center backdrop-blur-xl">
                    <Loader2 className="w-16 h-16 text-teal-500 animate-spin mb-4" />
                    <p className="text-teal-400 text-xs font-black uppercase tracking-[0.8em] animate-pulse">Establishing_Grounded_Narrative</p>
                </div>
            )}

            {/* PANE 1: TELEMETRY */}
            {viewMode === 'god' && (
                <section className="w-[320px] border-r border-slate-800 bg-black/40 p-6 flex flex-col gap-6 shadow-2xl">
                    <div className="flex items-center gap-2 text-teal-500 font-black text-[10px] uppercase tracking-widest border-b border-slate-900 pb-4"><Zap size={14} /> Telemetry_v33.0</div>
                    <div className="flex-1 overflow-y-auto space-y-2 opacity-30 text-[9px] uppercase italic">
                        {(status.history || []).map((log, i) => <div key={i} className="border-l border-slate-800 pl-3">{log}</div>)}
                    </div>
                </section>
            )}

            {/* PANE 2: WORKSPACE */}
            <section className="flex-1 flex flex-col p-10 overflow-y-auto relative bg-[#121416]">
                <div className="absolute top-10 right-10 flex border border-slate-800 rounded overflow-hidden z-50 shadow-2xl">
                    <button onClick={() => setViewMode('god')} className={`px-4 py-2 text-[9px] font-black ${viewMode === 'god' ? 'bg-teal-500 text-black' : 'bg-slate-900'}`}>GOD</button>
                    <button onClick={() => setViewMode('user')} className={`px-4 py-2 text-[9px] font-black ${viewMode === 'user' ? 'bg-teal-500 text-black' : 'bg-slate-900'}`}>USER</button>
                </div>

                <div className="flex gap-4 mb-10 border-b border-slate-800 pb-6">
                    <button onClick={() => {setActiveItem(null); setActiveBrief(null); setActiveTab('season');}} className={`px-10 py-3 text-[10px] font-black ${activeTab === 'season' && !activeItem ? 'bg-teal-500 text-black shadow-lg' : 'bg-slate-800'}`}>SEASONS</button>
                    <button onClick={() => {setActiveItem(null); setActiveBrief(null); setActiveTab('persona');}} className={`px-10 py-3 text-[10px] font-black ${activeTab === 'persona' && !activeItem ? 'bg-teal-500 text-black shadow-lg' : 'bg-slate-800'}`}>DNA_VAULT</button>
                </div>

                {!activeItem ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in">
                        {(activeTab === 'season' ? seasons : personas).map((item, i) => (
                            <div key={i} className="bg-[#1c1f23] border border-slate-800 p-8 rounded-lg cursor-pointer hover:border-teal-500 transition-all flex gap-6 items-center relative group shadow-2xl" onClick={() => setActiveItem(item)}>
                                {viewMode === 'god' && <button onClick={(e) => {e.stopPropagation(); runAction(`/season/delete/${item.id}`, {})}} className="absolute top-4 right-4 text-red-900 hover:text-red-500 transition-all"><Trash2 size={16}/></button>}
                                {item.portrait ? <img src={item.portrait} className="w-14 h-14 rounded grayscale group-hover:grayscale-0 border border-slate-800 transition-all shadow-xl" alt="P" /> : <div className="w-14 h-14 rounded bg-slate-900 flex items-center justify-center border border-slate-800"><Fingerprint size={28}/></div>}
                                <div>
                                    <h4 className="text-white font-black uppercase text-base italic tracking-tighter">{item.title || item.name}</h4>
                                    <p className="text-[10px] text-teal-500 uppercase font-black opacity-60 tracking-widest">{item.relationship || item.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-10">
                        <div className="flex justify-between items-end border-b border-slate-800 pb-8">
                            <h2 className="text-7xl font-black text-white uppercase italic tracking-tighter">{activeItem.title || activeItem.name}</h2>
                            <button onClick={() => {setActiveItem(null); setActiveBrief(null);}} className="bg-teal-500 text-black px-8 py-3 text-[10px] font-black">CLOSE</button>
                        </div>

                        {activeTab === 'season' && (
                            <div className="flex flex-col gap-10">
                                {/* FULL WIDTH SUMMARY */}
                                <div className="bg-teal-950/10 p-10 border border-teal-900/30 rounded-xl shadow-2xl">
                                    <h4 className="text-teal-400 text-[10px] font-black uppercase mb-6 flex items-center gap-3 italic"><ScrollText size={18}/> Production_Summary</h4>
                                    <p className="text-[16px] text-slate-300 font-sans leading-relaxed uppercase selection:bg-teal-500/30">{activeItem.summary}</p>
                                </div>

                                {/* SPLIT COLUMNS */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
                                    <div className="space-y-4">
                                        <h4 className="text-teal-500 text-[10px] font-black uppercase italic border-b border-slate-800 pb-2">Narrative_Nodes</h4>
                                        {(activeItem.episodes || []).map((ep, idx) => (
                                            <div key={idx} className="p-6 bg-[#1c1f23] border border-slate-800 group hover:border-teal-500 transition-all flex flex-col gap-3 shadow-xl">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[9px] text-teal-500 font-black">ACT {ep.act}</span>
                                                    <button onClick={() => getBrief(activeItem.id, idx)} className="px-6 py-2 bg-slate-800 text-teal-500 text-[9px] font-black uppercase border border-slate-700 hover:bg-teal-500 hover:text-black">Run_Node</button>
                                                </div>
                                                <h4 className="text-white font-black text-xl uppercase italic tracking-tighter">{ep.title}</h4>
                                                <p className="text-[10px] text-slate-500 uppercase leading-tight italic">{ep.topic_summary}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="bg-black/40 border border-slate-800 rounded-xl p-10 h-[800px] overflow-y-auto shadow-2xl relative">
                                        {activeBrief ? (
                                            <div className="animate-in fade-in">
                                                <div className="flex justify-between items-center mb-8 border-b border-slate-900 pb-6">
                                                    <h4 className="text-teal-500 text-[11px] font-black uppercase flex items-center gap-3"><ShieldCheck size={18}/> 6_Act_Brief</h4>
                                                    {!activeScript && <button onClick={generateScript} className="bg-teal-500 text-black px-4 py-2 text-[10px] font-black flex items-center gap-2"><PlayCircle size={14}/> Generate_Script</button>}
                                                </div>
                                                {activeScript ? (
                                                    <div className="bg-black/60 p-8 rounded border border-teal-500/20 animate-in slide-in-from-bottom-4">
                                                        <h4 className="text-teal-400 text-[10px] font-black uppercase mb-6 flex items-center gap-2 italic"><MessageSquareText size={14}/> Forensic_Script</h4>
                                                        <pre className="text-[13px] text-slate-300 whitespace-pre-wrap font-serif leading-loose uppercase selection:bg-teal-500/30">{activeScript}</pre>
                                                    </div>
                                                ) : (
                                                    Object.entries(activeBrief.acts || activeBrief).map(([k, v], i) => (
                                                        <div key={i} className="mb-10">
                                                            <span className="text-[9px] text-teal-400 font-black uppercase mb-3 block tracking-[0.2em]">{k.replace(/_/g, ' ')}</span>
                                                            <p className="text-[14px] text-slate-400 font-sans leading-relaxed uppercase selection:bg-teal-500/20">"{typeof v === 'string' ? v : JSON.stringify(v)}"</p>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        ) : (
                                            <div className="h-full flex items-center justify-center text-slate-800 text-[11px] font-black uppercase tracking-[0.3em] text-center">
                                                {briefLoading ? <Loader2 className="animate-spin text-teal-500" /> : "Select Node to View Production Sequence"}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* PERSONA DETAIL VIEW REMAINS IDENTICAL TO v32.5 */}
                    </div>
                )}
            </section>
        </div>
    );
};

export default App;
