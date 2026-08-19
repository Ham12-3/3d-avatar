"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Check, Monitor, Moon, ShieldCheck, Sun } from "lucide-react";
import type { UserPreferences } from "@/lib/domain/types";
import { BrowserAvatarStage } from "@/components/avatar/browser-avatar-stage";

type SaveState = "idle" | "saving" | "saved" | "error";

export function SettingsPanel({ initialPreferences }: { initialPreferences: UserPreferences }) {
  const { theme, setTheme } = useTheme();
  const mounted=useSyncExternalStore(()=>()=>{},()=>true,()=>false);
  const [settings,setSettings]=useState(initialPreferences);
  const [saveState,setSaveState]=useState<SaveState>("idle");

  useEffect(()=>{
    if(mounted) setTheme(initialPreferences.theme);
  },[initialPreferences.theme,mounted,setTheme]);

  const persist=async(patch:Partial<UserPreferences>)=>{
    setSaveState("saving");
    try{
      const response=await fetch("/api/preferences",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(patch)});
      if(!response.ok) throw new Error("Save failed");
      setSaveState("saved");
      window.setTimeout(()=>setSaveState("idle"),1800);
    }catch{
      setSaveState("error");
    }
  };

  const update=(key:keyof Pick<UserPreferences,"captionsEnabled"|"microphoneDefault">)=>{
    const next=!settings[key];
    setSettings((value)=>({...value,[key]:next}));
    void persist({[key]:next});
  };
  const changeTheme=(value:UserPreferences["theme"])=>{
    setTheme(value);
    setSettings((current)=>({...current,theme:value}));
    void persist({theme:value});
  };

  const toggles=[
    {key:"captionsEnabled" as const,label:"Live captions",text:"Show the compact transcript below Nova."},
    {key:"microphoneDefault" as const,label:"Microphone by default",text:"Request microphone access when a session starts."},
  ];

  return <div className="mt-6 space-y-6">
    <div aria-live="polite" className="flex h-5 justify-end text-[11px] text-[var(--muted)]">{saveState==="saving"?"Saving…":saveState==="saved"?"Preferences saved":saveState==="error"?<span className="text-[var(--danger)]">Could not save preferences</span>:null}</div>
    <section className="surface" data-avatar-target="appearance-settings"><SettingsHeader index="01" title="Appearance" description="Applied immediately and saved for your account."/><div className="grid gap-3 p-5 sm:grid-cols-3">{([{id:"light",label:"Light",icon:Sun},{id:"dark",label:"Dark",icon:Moon},{id:"system",label:"System",icon:Monitor}] as const).map((item)=><button key={item.id} onClick={()=>changeTheme(item.id)} className={`flex items-center justify-between border p-4 text-left text-sm font-semibold transition ${mounted&&theme===item.id?"border-[var(--signal)] bg-[var(--signal-soft)]":"border-[var(--line)] hover:border-[var(--line-strong)]"}`}><span className="flex items-center gap-3"><item.icon size={16}/>{item.label}</span>{mounted&&theme===item.id&&<Check size={15} className="text-[var(--signal)]"/>}</button>)}</div></section>
    <section className="surface" data-avatar-target="avatar-settings"><SettingsHeader index="02" title="Avatar" description="Nova is rendered in this browser and needs no paid avatar account."/><div className="grid gap-6 p-5 md:grid-cols-[140px_1fr]"><div className="aspect-square min-h-0 overflow-hidden bg-[#172629]"><BrowserAvatarStage status="Offline" compact/></div><div className="self-center"><div className="flex items-center gap-2"><h3 className="text-lg font-semibold">Nova</h3><span className="text-[10px] text-[var(--muted)]">Procedural 3D character</span></div><dl className="mt-4 grid grid-cols-[120px_1fr] gap-y-3 text-xs"><dt className="text-[var(--muted)]">Provider</dt><dd>Browser native</dd><dt className="text-[var(--muted)]">Renderer</dt><dd className="font-data">Three.js / WebGL</dd><dt className="text-[var(--muted)]">Voice</dt><dd>Device speech services</dd><dt className="text-[var(--muted)]">Runtime</dt><dd>No usage fees</dd></dl></div></div></section>
    <section className="surface" data-avatar-target="conversation-settings"><SettingsHeader index="03" title="Conversation" description="Microphone access is optional; typed dashboard requests always remain available."/><div className="divide-y divide-[var(--line)] px-5">{toggles.map((item)=><div key={item.key} className="flex items-center justify-between gap-6 py-4"><div><p className="text-sm font-semibold">{item.label}</p><p className="mt-1 text-xs text-[var(--muted)]">{item.text}</p></div><button role="switch" aria-label={item.label} aria-checked={settings[item.key]} onClick={()=>update(item.key)} className={`relative h-6 w-11 shrink-0 rounded-full transition ${settings[item.key]?"bg-[var(--signal)]":"bg-[var(--line-strong)]"}`}><span className={`absolute top-1 size-4 rounded-full bg-white shadow transition ${settings[item.key]?"left-6":"left-1"}`}/></button></div>)}</div></section>
    <section className="surface" data-avatar-target="privacy-settings"><SettingsHeader index="04" title="Privacy & retention" description="Operational defaults for sensitive conversation data."/><div className="grid gap-4 p-5 sm:grid-cols-2"><div className="border border-[var(--line)] p-4"><ShieldCheck size={18} className="text-[var(--signal)]"/><p className="mt-3 text-sm font-semibold">No avatar upload</p><p className="mt-2 text-xs leading-5 text-[var(--muted)]">Nova’s geometry and animation run locally. This app does not send camera or screen video to an avatar provider.</p></div><div className="border border-[var(--line)] p-4"><p className="eyebrow">Retention window</p><p className="mt-3 font-data text-2xl">30 days</p><p className="mt-2 text-xs leading-5 text-[var(--muted)]">Session metadata and redacted tool activity remain available to workspace administrators.</p></div></div></section>
  </div>;
}

function SettingsHeader({index,title,description}:{index:string;title:string;description:string}){return <header className="flex gap-4 border-b border-[var(--line)] p-5"><span className="font-data text-[10px] text-[var(--signal)]">{index}</span><div><h2 className="text-sm font-semibold">{title}</h2><p className="mt-1 text-xs text-[var(--muted)]">{description}</p></div></header>;}
