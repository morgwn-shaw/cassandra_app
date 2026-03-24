import React, { useState, useEffect } from 'react';
import { Zap, Activity, Trash2, Database, Quote, Brain, Loader2, Fingerprint, ScrollText, ShieldCheck, Dice5, UserPlus, ShieldAlert, PlayCircle, MessageSquare } from 'lucide-react';

const API_BASE = "https://shadow-cassandrafiles.pythonanywhere.com/api/v2";

const App = () => {
    const [activeTab, setActiveTab] = useState('season');
    const [activeItem, setActiveItem] = useState(null);
    const [activeBrief, setActiveBrief] = useState(null);
    const [activeScript, setActiveScript] = useState(null);
    const [seasons, setSeasons] = useState([]);
    const [personas, setPersonas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ stage: 'IDLE', history: [] });

    const [newP, setNewP] = useState({ name: '', role: 'Investigator', trauma: 'Witnessed server bleed-out.', gender: 'Male' });
    const [newS, setNewS] = useState({ topic: '', relationship: 'UST - High Friction', host_ids: [], episodes_count: 10 });

    useEffect(() => {
        refreshData();
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`${API_BASE}/status`);
                const data = await res.json();
                if (data) setStatus(data);
            } catch (e) {}
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const refreshData = async () => {
        try {
            const sRes = await fetch(`${API_BASE}/season/list`);
            const sData = await sRes.json();
            setSeasons(Array.isArray(sData) ? sData : []);
            const pRes = await fetch(`${API_BASE}/persona/list`);
            const pData = await pRes.json();
            setPersonas(Array.isArray(pData) ? pData : []);
        } catch (e) { setSeasons([]); setPersonas([]); }
    };

    const runAction = async (endpoint, body) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}${endpoint}`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body) });
            await refreshData();
        } finally { setLoading(false); }
    };

    const getBrief = async (seasonId, idx) => {
        setLoading(true); setActiveScript(null); setActiveBrief(null);
        try {
            const res = await fetch(`${API_BASE}/showrunner/brief`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ season_id: seasonId, node_index: idx }) });
            const data = await res.json();
            setActiveBrief(data);
        } finally { setLoading(false); }
    };

    const generateScript = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/showrunner/script`, { 
                method: 'POST', 
                headers: {'Content-Type': 'application/json'}, 
                body: JSON.stringify({ season_id: activeItem.id, brief: activeBrief }) 
            });
            const data = await res.json();
            setActiveScript(data.script);
        } finally { setLoading(false); }
    };

    return (
        <div className="h-screen w-screen font-mono flex overflow-hidden bg-[#0d0f11] text-slate-400">
            
            {/* COLUMN 1: TELEMETRY */}
            <aside className="w-[320px] border-r border-slate-800 bg-black/60 p-8 flex flex-col gap-6 shadow-2xl shrink-0">
                <div className="border-b border-slate-900 pb-6">
                    <div className="flex items-center gap-3 text-teal-500 font-black text-sm uppercase tracking-widest"><Zap size={16} /> Telemetry_v39.1</div>
                    <div className="text-[9px] text-teal-900 uppercase font-black italic mt-2">{status.active_engine}</div>
                </div>
                <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar">
                    {(status?.history || []).map((log, i) => {
                        const isError = log.includes("FAIL") || log.includes("ERROR");
                        return (
                            <div key={i} className={`border-l-2 pl-4 py-2 uppercase italic leading-snug ${isError ? 'text-white font-black text-[14px] border-red-500' : 'text-slate-600 text-[10px] border-slate-800'}`}>
                                {log}
                            </div>
                        );
                    })}
                </div>
                <button onClick={() => runAction('/purge', {})} className="p-4 bg-red-950/20 border border-red-900/30 text-red-500 text-[11px] font-black uppercase flex items-center justify-center gap-3 hover:bg-red-600 hover:text-white transition-all shadow-2xl">
                    <ShieldAlert size={16}/> World_Reset
                </button>
            </aside>

            {/* COLUMN 2: WORKSPACE */}
            <main className="flex-1 flex flex-col p-12 overflow-y-auto relative bg-[#121416]">
                {loading && (
                    <div className="absolute inset-0 bg-black/80 z-[100] flex flex-col items-center justify-center backdrop-blur-md">
                        <Loader2 className="w-16 h-16 text-teal-500 animate-spin mb-4" />
                        <p className="text-teal-400 text-xs font-black uppercase tracking-[0.8em] animate-pulse italic">Engaging_Neural_Briefing...</p>
                    </div>
                )}

                <div className="flex gap-4 mb-12 border-b border-slate-800 pb-8">
                    <button onClick={() => {setActiveItem(null); setActiveBrief(null); setActiveScript(null); setActiveTab('season');}} className={`px-12 py-4 text-[11px] font-black transition-all ${activeTab === 'season' && !activeItem ? 'bg-teal-500 text-black shadow-lg shadow-teal-500/20' : 'bg-slate-800'}`}>SEASONS</button>
                    <button onClick={() => {setActiveItem(null); setActiveBrief(null); setActiveScript(null); setActiveTab('persona');}} className={`px-12 py-4 text-[11px] font-black transition-all ${activeTab === 'persona' && !activeItem ? 'bg-teal-500 text-black shadow-lg shadow-teal-500/20' : 'bg-slate-800'}`}>PERSONAS</button>
                </div>

                {!activeItem ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in">
                        {(activeTab === 'season' ? seasons : personas).map((item, i) => (
                            <div key={i} className="bg-[#1c1f23] border border-slate-800 p-8 rounded-xl cursor-pointer hover:border-teal-500/50 transition-all flex gap-8 items-center shadow-xl group" onClick={() => setActiveItem(item)}>
                                <div className="w-20 h-20 rounded bg-slate-900 overflow-hidden border border-slate-800 shrink-0">
                                    {item?.portrait ? <img src={item.portrait} className="w-full h-full object-cover grayscale group-hover:grayscale-0" alt="DNA" /> : <Fingerprint className="m-6 text-slate-700" size={32}/>}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-white font-black uppercase text-lg italic tracking-tighter truncate">{item?.title || item?.name}</h4>
                                    <p className="text-[11px] text-teal-500 uppercase font-black opacity-60 tracking-[0.2em]">{item?.relationship || item?.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="animate-in slide-in-from-bottom-6 space-y-12">
                        <div className="flex justify-between items-end border-b border-slate-800 pb-10">
                            <h2 className="text-7xl font-black text-white uppercase italic tracking-tighter">{activeItem?.title || activeItem?.name}</h2>
                            <button onClick={() => {setActiveItem(null); setActiveBrief(null); setActiveScript(null);}} className="bg-teal-500 text-black px-12 py-4 text-xs font-black shadow-2xl">RETURN</button>
                        </div>

                        {activeTab === 'season' && (
                            <div className="flex flex-col gap-12">
                                <div className="bg-teal-950/10 p-12 border border-teal-900/30 rounded-2xl shadow-2xl">
                                    <h4 className="text-teal-400 text-[11px] font-black uppercase mb-6 flex items-center gap-3 italic tracking-[0.3em]"><ScrollText size={20}/> Geopolitical_Blueprint</h4>
                                    <p className="text-[19px] text-slate-300 font-sans leading-relaxed uppercase selection:bg-teal-500/30">{activeItem?.summary}</p>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                                    <div className="space-y-6">
                                        <h4 className="text-teal-500 text-[11px] font-black uppercase italic border-b border-slate-800 pb-4">Investigative_Nodes</h4>
                                        {(activeItem?.episodes || []).map((ep, idx) => (
                                            <div key={idx} className="p-8 bg-[#1c1f23] border border-slate-800 group hover:border-teal-500 transition-all flex flex-col gap-4 shadow-xl rounded-lg">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[10px] text-teal-500 font-black uppercase tracking-widest">ACT {ep?.act}</span>
                                                    <button onClick={() => getBrief(activeItem.id, idx)} className="px-6 py-2 bg-slate-800 text-teal-500 text-[10px] font-black uppercase border border-slate-700 hover:bg-teal-500 hover:text-black transition-all">Ground_Brief</button>
                                                </div>
                                                <h4 className="text-white font-black text-2xl uppercase italic tracking-tighter">{ep?.title}</h4>
                                                <p className="text-[12px] text-slate-500 uppercase italic leading-snug">{ep?.topic_summary}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="bg-black/40 border border-slate-800 rounded-2xl p-12 h-[850px] overflow-y-auto shadow-2xl relative">
                                        <div className="flex justify-between items-center mb-10 border-b border-slate-900 pb-6">
                                            <h4 className="text-teal-500 text-[12px] font-black uppercase flex items-center gap-4"><ShieldCheck size={24}/> Technical_Brief</h4>
                                            {activeBrief && !activeScript && <button onClick={generateScript} className="bg-teal-500 text-black px-6 py-2 text-[10px] font-black flex items-center gap-2 hover:bg-white transition-all"><PlayCircle size={14}/> Generate_Script</button>}
                                        </div>
                                        {activeScript ? (
                                            <div className="animate-in slide-in-from-bottom-4">
                                                <h4 className="text-teal-400 text-[10px] font-black uppercase mb-6 flex items-center gap-2 italic"><MessageSquare size={14}/> Forensic_Script</h4>
                                                <pre className="text-[14px] text-slate-300 whitespace-pre-wrap font-serif leading-relaxed uppercase selection:bg-teal-500/30">{activeScript}</pre>
                                            </div>
                                        ) : activeBrief && typeof activeBrief === 'object' ? (
                                            Object.entries(activeBrief?.acts || activeBrief || {}).map(([k, v], i) => (
                                                <div key={i} className="mb-12 animate-in slide-in-from-right-4">
                                                    <span className="text-[10px] text-teal-400 font-black uppercase mb-4 block opacity-50 tracking-[0.3em]">{k.replace(/_/g, ' ')}</span>
                                                    <p className="text-[16px] text-slate-400 font-sans leading-relaxed uppercase selection:bg-teal-500/20">"{v}"</p>
                                                </div>
                                            ))
                                        ) : typeof activeBrief === 'string' ? (
                                            <p className="text-slate-400 uppercase italic leading-relaxed">{activeBrief}</p>
                                        ) : <div className="h-full flex items-center justify-center text-slate-800 text-xs font-black uppercase tracking-[0.4em] opacity-30 text-center italic">Initialize_Node_Handshake</div>}
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* PERSONA VIEW REMAINS SAME */}
                    </div>
                )}
            </main>

            {/* COLUMN 3: COMMAND */}
            <aside className="w-[420px] bg-[#0b0c0e] p-12 flex flex-col gap-14 border-l border-slate-800 overflow-y-auto shadow-2xl shrink-0">
                {/* IDENTITY SPAWN & ESTABLISH SEASON MODULES REMAIN SAME AS v38.0 */}
            </aside>
        </div>
    );
};

export default App;
