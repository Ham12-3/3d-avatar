"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, CheckCircle2, CircleDot, CircleX, Clock, Wrench, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { SessionDetail as SessionDetailData, SessionRecord } from "@/lib/domain/types";

export function SessionHistory({sessions}:{sessions:SessionRecord[]}){
  const [selected,setSelected]=useState<SessionRecord|null>(null);
  const [detail,setDetail]=useState<SessionDetailData|null>(null);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState<string|null>(null);

  useEffect(()=>{
    if(!selected)return;
    const controller=new AbortController();
    void fetch(`/api/avatar/conversations/${encodeURIComponent(selected.id)}`,{signal:controller.signal})
      .then(async(response)=>{const payload=await response.json() as SessionDetailData&{error?:string};if(!response.ok)throw new Error(payload.error??"Session details are unavailable.");return payload;})
      .then(setDetail)
      .catch((reason)=>{if(!controller.signal.aborted)setError(reason instanceof Error?reason.message:"Session details are unavailable.");})
      .finally(()=>{if(!controller.signal.aborted)setLoading(false);});
    const onKeyDown=(event:KeyboardEvent)=>{if(event.key==="Escape")setSelected(null);};
    window.addEventListener("keydown",onKeyDown);
    return()=>{controller.abort();window.removeEventListener("keydown",onKeyDown);};
  },[selected]);

  const openSession=(session:SessionRecord)=>{setLoading(true);setDetail(null);setError(null);setSelected(session);};
  return <>
    <section data-avatar-target="session-history" className="surface mt-6 overflow-hidden">
      <div className="grid grid-cols-3 divide-x divide-[var(--line)] border-b border-[var(--line)]"><Summary label="Completed" value={sessions.filter((session)=>session.status==="Completed").length}/><Summary label="Recorded sessions" value={sessions.length}/><Summary label="Tools invoked" value={sessions.reduce((sum,session)=>sum+session.tools,0)}/></div>
      <div className="divide-y divide-[var(--line)]">{sessions.map((session)=><button key={session.id} onClick={()=>openSession(session)} className="grid w-full gap-4 p-5 text-left hover:bg-[var(--canvas)] focus-visible:outline-2 focus-visible:outline-[var(--signal)] md:grid-cols-[minmax(0,1fr)_110px_100px_100px_24px] md:items-center"><div className="flex min-w-0 items-start gap-3"><SessionStatusIcon status={session.status}/><div><h2 className="truncate text-sm font-semibold">{session.topic}</h2><p className="mt-1 font-data text-[10px] text-[var(--muted)]">{session.id}</p></div></div><p className="flex items-center gap-1.5 text-xs text-[var(--muted)]"><Clock size={13}/>{session.startedAt}</p><p className="font-data text-xs">{session.duration}</p><p className="flex items-center gap-1.5 text-xs"><Wrench size={13}/>{session.tools} tools</p><ArrowUpRight size={15} className="text-[var(--muted)]"/></button>)}{sessions.length===0&&<p className="p-8 text-center text-sm text-[var(--muted)]">No avatar sessions have been recorded yet.</p>}</div>
    </section>
    {selected&&<SessionDrawer session={selected} detail={detail} loading={loading} error={error} onClose={()=>setSelected(null)}/>}
  </>;
}

function Summary({label,value}:{label:string;value:number}){return <div className="p-5"><p className="eyebrow">{label}</p><p className="mt-2 font-data text-2xl">{value}</p></div>;}

function SessionStatusIcon({status}:{status:SessionRecord["status"]}){return status==="Completed"?<CheckCircle2 size={17} className="mt-0.5 shrink-0 text-[var(--signal)]"/>:status==="Active"?<CircleDot size={17} className="mt-0.5 shrink-0 text-[var(--signal)]"/>:<CircleX size={17} className="mt-0.5 shrink-0 text-[var(--danger)]"/>;}

function SessionDrawer({session,detail,loading,error,onClose}:{session:SessionRecord;detail:SessionDetailData|null;loading:boolean;error:string|null;onClose:()=>void}){
  return <div className="fixed inset-0 z-40 flex justify-end bg-black/25" onMouseDown={(event)=>{if(event.currentTarget===event.target)onClose();}}><article role="dialog" aria-modal="true" aria-labelledby="session-title" className="h-full w-full max-w-2xl overflow-y-auto bg-[var(--surface-strong)] shadow-2xl">
    <header className="sticky top-0 z-10 flex items-start justify-between border-b border-[var(--line)] bg-[var(--surface-strong)] p-6"><div><p className="eyebrow">Conversation record</p><h2 id="session-title" className="mt-2 text-xl font-semibold tracking-[-.03em]">{session.topic}</h2><p className="mt-2 font-data text-[10px] text-[var(--muted)]">{session.id}</p></div><button onClick={onClose} className="rounded p-2 text-[var(--muted)] hover:bg-[var(--canvas)]" aria-label="Close session details"><X size={18}/></button></header>
    <div className="p-6"><div className="grid grid-cols-3 border border-[var(--line)]"><div className="p-4"><p className="eyebrow">Status</p><p className="mt-2 text-xs font-semibold">{session.status}</p></div><div className="border-x border-[var(--line)] p-4"><p className="eyebrow">Duration</p><p className="mt-2 font-data text-xs">{session.duration}</p></div><div className="p-4"><p className="eyebrow">Tool calls</p><p className="mt-2 font-data text-xs">{detail?.tools.length??session.tools}</p></div></div>
      {loading&&<div className="mt-8 space-y-3" aria-live="polite"><p className="text-xs text-[var(--muted)]">Loading protected transcript…</p>{[1,2,3].map((item)=><div key={item} className="h-16 animate-pulse bg-[var(--canvas)]"/>)}</div>}
      {error&&<div className="mt-8 border border-[var(--line)] bg-[var(--canvas)] p-5"><p className="text-sm font-semibold">Transcript unavailable</p><p className="mt-2 text-xs leading-5 text-[var(--muted)]">{error}</p></div>}
      {detail&&<><section className="mt-8"><div className="flex items-center justify-between"><div><p className="eyebrow">Transcript</p><h3 className="mt-2 text-sm font-semibold">Conversation</h3></div><Badge>{detail.source==="demo"?"Demo record":"Local record"}</Badge></div><div className="mt-4 space-y-3">{detail.transcript.map((entry,index)=><div key={`${entry.timestamp??"entry"}-${index}`} className={`max-w-[88%] border p-4 ${entry.role==="assistant"?"border-[var(--line)] bg-[var(--canvas)]":"ml-auto border-[var(--signal)] bg-[var(--signal-soft)]"}`}><div className="flex items-center justify-between gap-4"><p className="eyebrow">{entry.role==="assistant"?"Nova":"You"}</p>{entry.timestamp&&<time className="font-data text-[9px] text-[var(--muted)]">{new Intl.DateTimeFormat("en-GB",{hour:"2-digit",minute:"2-digit"}).format(new Date(entry.timestamp))}</time>}</div><p className="mt-2 text-xs leading-6">{entry.content??"Tool interaction"}</p></div>)}{detail.transcript.length===0&&<p className="border border-[var(--line)] p-5 text-xs text-[var(--muted)]">No transcript was retained for this session.</p>}</div></section>
        <section className="mt-8 border-t border-[var(--line)] pt-6"><p className="eyebrow">Tool activity</p><div className="mt-3 divide-y divide-[var(--line)] border-y border-[var(--line)]">{detail.tools.map((tool,index)=><div key={`${tool.name}-${index}`} className="grid grid-cols-[1fr_auto] items-center gap-4 py-3"><div className="flex items-center gap-3"><Wrench size={13} className="text-[var(--muted)]"/><div><p className="font-data text-[11px]">{tool.name}</p><p className="mt-1 text-[10px] text-[var(--muted)]">{tool.timestamp?new Intl.DateTimeFormat("en-GB",{dateStyle:"medium",timeStyle:"short"}).format(new Date(tool.timestamp)):"Timestamp unavailable"}</p></div></div><div className="text-right"><Badge tone={tool.status==="FAILED"?"danger":"success"}>{tool.status}</Badge>{tool.durationMs!==null&&<p className="mt-1 font-data text-[9px] text-[var(--muted)]">{tool.durationMs} ms</p>}</div></div>)}{detail.tools.length===0&&<p className="py-4 text-xs text-[var(--muted)]">No tools were invoked.</p>}</div></section></>}
    </div>
  </article></div>;
}
