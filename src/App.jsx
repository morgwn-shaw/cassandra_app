import React, { useState, useEffect } from 'react';
import { Zap, Activity, Trash2, Database, Quote, Brain, Loader2, Fingerprint, ScrollText, ShieldCheck, Dice5, UserPlus, ShieldAlert } from 'lucide-react';

const API_BASE = "https://shadow-cassandrafiles.pythonanywhere.com/api/v2";

const App = () => {
    const [activeTab, setActiveTab] = useState('season');
    const [activeItem, setActiveItem] = useState(null);
    const [activeBrief, setActiveBrief] = useState(null);
    const [seasons, setSeasons] = useState([]);
    const [personas, setPersonas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ stage: 'IDLE', history: [] });

    const [newP, setNewP] = useState({ name: '', role: 'Investigator', trauma: '', gender: 'Male' });
    const [newS, setNewS] = useState({ topic: '', relationship: 'Strategic Tension', host_ids: [], episodes_count: 10 });

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
        } catch (e) { console.error("Database connection failed"); }
    };

    const runAction = async (endpoint, body) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}${endpoint}`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body) });
            if (!res.ok) throw new Error(await res.text());
            await refreshData();
        } catch (e) { window.alert(`Handshake Failure: ${e.message}`); }
        finally { setLoading(false); }
    };

    const getBrief = async (seasonId, idx) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/showrunner/brief`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ season_id: seasonId, node_index: idx }) });
            const data = await res.json();
            setActiveBrief(data);
        } finally { setLoading(false); }
    };

    const nuclearPurge = async () => {
        if (!window.confirm("FATAL: Wipe DNA Vault?")) return;
        await runAction('/purge', {});
        setActiveItem(null);
    };

    const currentList = activeTab === 'season' ? (seasons || []) : (personas || []);

    return (
        <div className="h-screen w-screen font-mono flex overflow-hidden bg-[#0a0c0e] text-slate-400">
            
            {/* PANE 1: TELEMETRY */}
            <aside className="w-[280px] border-r border-slate-800 bg-black/60 p-6 flex flex-col gap-6 shadow-2xl shrink-0">
                <div className="flex items-center gap-2 text-teal-500 font-black text-[10px] uppercase tracking-widest border-b border-slate-900 pb-4"><Zap size={14} /> Telemetry_v33.3</div>
                <div className="flex-1 overflow-y-auto space-y-2 opacity-30 text-[9px] uppercase italic">
                    {(status?.history || []).map((log, i) => <div key={i} className="border-l border-slate-800 pl-3">{log}</div>)}
                </div>
                <button onClick={nuclearPurge} className="p-3 bg-red-950/20 border border-red-900/30 text-red-500 text-[9px] font-black uppercase flex items-center justify-center gap-2 hover:bg-red-600 hover:text-white transition-all">
                    <ShieldAlert size={14}/> Nuclear_Purge
                </button>
            </aside>

            {/* PANE 2: WORKSPACE */}
            <main className="flex-1 flex flex-col p-10 overflow-y-auto relative bg-[#0d0f11] min-w-[600px]">
                {loading && (
                    <div className="absolute inset-0 bg-black/80 z-[100] flex flex-col items-center justify-center backdrop-blur-md">
                        <Loader2 className="w-12 h-12 text-teal-500 animate-spin mb-4" />
                        <p className="text-teal-400 text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">Syncing_Synapses...</p>
                    </div>
                )}

                <div className="flex gap-4 mb-10 border-b border-slate-800 pb-6">
                    <button onClick={() => {setActiveItem(null); setActiveTab('season');}} className={`px-10 py-3 text-[10px] font-black transition-all ${activeTab === 'season' && !activeItem ? 'bg-teal-500 text-black' : 'bg-slate-800 text-slate-500'}`}>SEASONS</button>
                    <button onClick={() => {setActiveItem(null); setActiveTab('persona');}} className={`px-10 py-3 text-[10px] font-black transition-all ${activeTab === 'persona' && !activeItem ? 'bg-teal-500 text-black' : 'bg-slate-800 text-slate-500'}`}>DNA_VAULT</button>
                </div>

                {!activeItem ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in">
                        {currentList.map((item, i) => (
                            <div key={i} className="bg-[#16191c] border border-slate-800 p-8 rounded cursor-pointer hover:border-teal-500 transition-all flex gap-6 items-center shadow-xl group" onClick={() => setActiveItem(item)}>
                                <div className="w-16 h-16 rounded bg-slate-900 overflow-hidden border border-slate-800 shrink-0">
                                    {item?.portrait ? <img src={item.portrait} className="w-full h-full object-cover grayscale group-hover:grayscale-0" alt="P" onError={(e) => e.target.style.display='none'}/> : <Fingerprint className="m-4 text-slate-700" size={32}/>}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-white font-black uppercase text-base italic tracking-tighter truncate">{item?.title || item?.name || "Unidentified_Signal"}</h4>
                                    <p className="text-[10px] text-teal-500 uppercase font-black opacity-60 truncate">{item?.relationship || item?.role || "Pending_DNA"}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="animate-in slide-in-from-bottom-4 space-y-10">
                        <div className="flex justify-between items-end border-b border-slate-800 pb-8">
                            <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter">{activeItem?.title || activeItem?.name}</h2>
                            <button onClick={() => {setActiveItem(null); setActiveBrief(null);}} className="bg-slate-800 text-white px-8 py-3 text-[10px] font-black hover:bg-teal-500 transition-all uppercase">Return_to_List</button>
                        </div>

                        {activeTab === 'season' && (
                            <div className="flex flex-col gap-10">
                                <div className="bg-teal-950/10 p-10 border border-teal-900/30 rounded shadow-2xl">
                                    <h4 className="text-teal-400 text-[10px] font-black uppercase mb-4 flex items-center gap-2 italic font-serif tracking-[0.2em]"><ScrollText size={18}/> Season_Summary</h4>
                                    <p className="text-[16px] text-slate-300 font-sans leading-relaxed uppercase selection:bg-teal-500/30">{activeItem?.summary}</p>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
                                    <div className="space-y-4">
                                        <h4 className="text-teal-500 text-[10px] font-black uppercase italic border-b border-slate-800 pb-2">Narrative_Nodes</h4>
                                        {(activeItem?.episodes || []).map((ep, idx) => (
                                            <div key={idx} className="p-6 bg-[#16191c] border border-slate-800 group hover:border-teal-500 transition-all flex flex-col gap-3 shadow-xl">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[9px] text-teal-500 font-black">ACT {ep?.act}</span>
                                                    <button onClick={() => getBrief(activeItem.id, idx)} className="px-4 py-1.5 bg-slate-800 text-teal-500 text-[9px] font-black uppercase border border-slate-700
