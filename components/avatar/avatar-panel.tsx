"use client";

import { Bot, Captions, Maximize2, MessageCircle, Mic, MicOff, Phone, PhoneOff, Send, ShieldCheck, UserRound, Volume2, VolumeX } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BrowserAvatarStage } from "./browser-avatar-stage";
import { useAvatarApp } from "./avatar-provider";

const formatTime=(seconds:number)=>`${String(Math.floor(seconds/60)).padStart(2,"0")}:${String(seconds%60).padStart(2,"0")}`;
const RunwayAvatarStage=dynamic(()=>import("./runway-avatar-stage").then((module)=>module.RunwayAvatarStage),{ssr:false,loading:()=> <div className="grid h-full min-h-[330px] place-items-center bg-[#102124] text-xs text-white/55">Loading Runway controls…</div>});

export function AvatarPanel({runwayConfigured,runwayCustomAvatar}:{runwayConfigured:boolean;runwayCustomAvatar:boolean}){
  const app=useAvatarApp();
  const [command,setCommand]=useState("");
  const [showTranscript,setShowTranscript]=useState(true);
  const [runwayMode,setRunwayMode]=useState(false);
  const submit=(event:React.FormEvent)=>{event.preventDefault();if(!command.trim())return;app.executeCommand(command);setCommand("");};
  const toggleAvatarMode=()=>{if(!runwayMode&&app.isActive)app.end();setRunwayMode((value)=>!value);};

  return <aside data-avatar-panel className="flex h-full min-h-[520px] flex-col overflow-hidden rounded-[16px] border border-[var(--line)] bg-[var(--surface-strong)] shadow-[0_10px_28px_rgba(18,35,38,.08)]" aria-label="Nova conversation panel">
    <div className="flex h-[68px] shrink-0 items-center justify-between border-b border-[var(--line)] px-4">
      <div className="flex items-center gap-3"><div className="relative grid size-9 place-items-center rounded-lg bg-[var(--nav)] text-white"><MessageCircle size={15}/><span className={`absolute -right-0.5 -top-0.5 size-2.5 rounded-full border-2 border-[var(--surface-strong)] ${app.isActive||runwayMode?"bg-[var(--signal-bright)]":"bg-[var(--line-strong)]"}`}/></div><div><div className="flex items-center gap-2"><h2 className="font-display text-sm font-semibold">Nova</h2><span className="font-data text-[7px] uppercase tracking-[.12em] text-[var(--muted)]">{runwayMode?"Runway human":"Local interface"}</span></div><p className="mt-0.5 flex items-center gap-1.5 text-[9px] text-[var(--muted)]">{runwayMode?"API-billed mode":app.status}{!runwayMode&&app.isActive?` · ${formatTime(app.elapsed)}`:!runwayMode?" · Available":""}</p></div></div>
      <div className="flex items-center gap-1"><button onClick={toggleAvatarMode} className={`grid size-9 place-items-center rounded-xl transition ${runwayMode?"bg-[var(--signal-soft)] text-[var(--signal)]":"text-[var(--muted)] hover:bg-[var(--canvas)]"}`} aria-label={runwayMode?"Use local Nova avatar":"Try Runway human character"} aria-pressed={runwayMode}>{runwayMode?<Bot size={16}/>:<UserRound size={16}/>}</button>{!runwayMode?<button onClick={()=>setShowTranscript((value)=>!value)} className={`grid size-9 place-items-center rounded-xl transition ${showTranscript?"bg-[var(--signal-soft)] text-[var(--signal)]":"text-[var(--muted)] hover:bg-[var(--canvas)]"}`} aria-label="Toggle transcript" aria-pressed={showTranscript}><Captions size={16}/></button>:null}</div>
    </div>

    <div className="relative min-h-[300px] flex-1 overflow-hidden bg-[#102124]">
      {runwayMode?<RunwayAvatarStage configured={runwayConfigured} customAvatar={runwayCustomAvatar}/>:<><BrowserAvatarStage status={app.status}/>
      <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/10 bg-[#0b181a]/75 px-3 py-1.5 font-data text-[8px] uppercase tracking-[.13em] text-white/65 backdrop-blur"><ShieldCheck size={11} className="text-[#79d5cd]"/>Local animation</div>
      <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full border border-white/10 bg-[#0b181a]/75 px-3 py-1.5 font-data text-[8px] uppercase tracking-[.13em] text-white/65 backdrop-blur"><span className={`status-dot ${app.isActive?"text-[#79d5cd]":"text-white/30"}`}/>Browser-rendered avatar</div>
      <div className="absolute inset-x-0 bottom-0 flex justify-center border-t border-white/10 bg-[#0c191b]/88 px-4 py-4 backdrop-blur-xl">
        {!app.isActive?<Button className="h-11 w-full max-w-[300px] rounded-xl bg-[#dff5f1] text-[#102124] hover:bg-white" onClick={app.start}><Phone size={15}/>Start conversation</Button>:<div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[.06] p-1.5 shadow-xl">
          <ControlButton active={app.micOn} disabled={!app.recognitionAvailable} label={app.microphoneIssue?"Retry microphone":app.micOn?"Stop and transcribe":"Start local recording"} onClick={app.toggleMic}>{app.micOn?<Mic size={15}/>:<MicOff size={15}/>}</ControlButton>
          <ControlButton active={app.voiceOn} label="Toggle Nova voice" onClick={app.toggleVoice}>{app.voiceOn?<Volume2 size={15}/>:<VolumeX size={15}/>}</ControlButton>
          <button onClick={app.end} className="grid size-10 place-items-center rounded-xl bg-[var(--danger)] text-white transition hover:brightness-110" aria-label="End conversation"><PhoneOff size={15}/></button>
          <ControlButton label="Full screen" onClick={()=>document.querySelector('[data-avatar-panel]')?.requestFullscreen()}><Maximize2 size={15}/></ControlButton>
        </div>}
      </div></>}
    </div>

    {!runwayMode&&showTranscript?<div className="shrink-0 border-t border-[var(--line)] bg-[var(--surface-strong)]">
      <div className="scrollbar-thin max-h-48 min-h-24 overflow-y-auto px-4 py-4" aria-live="polite">{app.transcript.length===0?<div className="rounded-xl border border-[var(--line)] bg-[var(--canvas)] px-4 py-4"><p className="text-xs font-semibold">Move through the workspace by voice or text</p><p className="mt-1.5 text-[10px] leading-5 text-[var(--muted)]">Try “Show revenue for 90 days” or “Open urgent tickets”.</p></div>:app.transcript.slice(-4).map((line)=><div key={line.id} className={`mb-3 flex gap-2.5 ${line.speaker==="You"?"flex-row-reverse":""}`}><span className={`grid size-6 shrink-0 place-items-center rounded-lg text-[9px] font-semibold ${line.speaker==="Nova"?"bg-[var(--nav)] text-white":"bg-[var(--signal-soft)] text-[var(--signal)]"}`}>{line.speaker==="Nova"?"N":"Y"}</span><div className={`max-w-[82%] rounded-xl px-3.5 py-2.5 text-[11px] leading-5 ${line.speaker==="Nova"?"rounded-tl-sm bg-[var(--canvas)] text-[var(--muted)]":"rounded-tr-sm bg-[var(--signal-soft)] text-[var(--ink)]"}`}><span className="sr-only">{line.speaker}: </span>{line.text}</div></div>)}</div>
      {app.isActive?<form onSubmit={submit} className="border-t border-[var(--line)] p-3"><div className="flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-1.5 transition focus-within:border-[var(--signal)] focus-within:bg-[var(--surface-strong)]"><label className="sr-only" htmlFor="nova-command">Message Nova</label><input id="nova-command" value={command} onChange={(event)=>setCommand(event.target.value)} placeholder={app.recognitionAvailable?"Ask Nova or use the microphone…":"Type a request…"} className="h-9 min-w-0 flex-1 bg-transparent px-3 text-xs outline-none placeholder:text-[var(--muted)]"/><Button size="icon" type="submit" className="size-9 shrink-0 rounded-lg" aria-label="Send command"><Send size={14}/></Button></div></form>:null}
      {app.isActive&&app.microphoneIssue?<div role="alert" className="flex items-start justify-between gap-3 border-t border-amber-200 bg-amber-50 px-4 py-3 text-[10px] leading-4 text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100"><p>{app.microphoneIssue}</p>{!app.microphoneIssue.includes("Chrome or Edge")?<button type="button" onClick={app.toggleMic} className="shrink-0 font-semibold underline underline-offset-2">Try again</button>:null}</div>:null}
      {app.isActive&&app.microphoneNotice?<div role="status" className="border-t border-teal-200 bg-teal-50 px-4 py-2.5 text-[10px] leading-4 text-teal-950 dark:border-teal-900 dark:bg-teal-950/40 dark:text-teal-100">{app.microphoneNotice}</div>:null}
      {app.isActive&&!app.recognitionAvailable?<p className="border-t border-[var(--line)] px-4 py-2 text-[9px] leading-4 text-[var(--muted)]">Voice recognition is unavailable here; typed requests still work.</p>:null}
    </div>:runwayMode?<div className="shrink-0 border-t border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-[9px] leading-4 text-[var(--muted)]">Runway mode uses a separate real-time character session. Switch back to the robot icon for the free local Qwen assistant.</div>:null}
  </aside>;
}

function ControlButton({active=false,disabled=false,label,onClick,children}:{active?:boolean;disabled?:boolean;label:string;onClick:()=>void;children:React.ReactNode}){
  return <button onClick={onClick} disabled={disabled} className={`grid size-10 place-items-center rounded-xl transition disabled:cursor-not-allowed disabled:opacity-35 ${active?"bg-[#dff5f1] text-[#102124]":"bg-white/[.08] text-white hover:bg-white/[.14]"}`} aria-label={label} aria-pressed={active}>{children}</button>;
}
