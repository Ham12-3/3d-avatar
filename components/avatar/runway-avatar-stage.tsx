"use client";

import { AvatarCall, AvatarVideo, ControlBar } from "@runwayml/avatars-react";
import "@runwayml/avatars-react/styles.css";
import { Briefcase, Cat, ChefHat, CircleDollarSign, Gamepad2, Music2, Palette, Sparkles, Trophy, UserRound, type LucideIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { runwayPresets, type RunwayPresetId } from "@/lib/avatar/runway-presets";

const presetIcons:Record<RunwayPresetId,LucideIcon>={
  "game-character":Gamepad2,
  "music-superstar":Music2,
  "game-character-man":Sparkles,
  "cat-character":Cat,
  influencer:UserRound,
  "tennis-coach":Trophy,
  "human-resource":Briefcase,
  "fashion-designer":Palette,
  "cooking-teacher":ChefHat,
};

export function RunwayAvatarStage({configured,customAvatar}:{configured:boolean;customAvatar:boolean}){
  const [active,setActive]=useState(false);
  const [error,setError]=useState<string|null>(null);
  const [presetId,setPresetId]=useState<RunwayPresetId>("human-resource");

  if(active){
    return <div className="h-full min-h-[330px] bg-[#102124]">
      <AvatarCall
        avatarId={customAvatar?"nova-custom":presetId}
        connectUrl="/api/avatar/runway/session"
        audio
        video={false}
        onEnd={()=>setActive(false)}
        onError={()=>{setError("The Runway call could not start. Check the API key and developer credits, then try again.");setActive(false);}}
        style={{height:"100%",width:"100%",aspectRatio:"auto",borderRadius:0}}
      >
        <AvatarVideo/>
        <ControlBar showCamera={false} showScreenShare={false}/>
      </AvatarCall>
    </div>;
  }

  return <div className="h-full min-h-[330px] overflow-y-auto bg-[#102124] px-4 py-4 text-center text-white">
    <div className="mx-auto max-w-[360px]">
      <div className="flex items-center justify-between text-left"><div><p className="font-data text-[7px] uppercase tracking-[.18em] text-[#79d5cd]">Character casting</p><h3 className="mt-1 font-display text-base font-semibold">{customAvatar?"Your Runway character":"Choose Nova’s appearance"}</h3></div><span className="grid size-9 place-items-center rounded-full border border-white/10 bg-white/[.07] text-[#79d5cd]"><UserRound size={17}/></span></div>
      {customAvatar?<p className="mt-4 rounded-xl border border-white/10 bg-white/[.05] px-4 py-4 text-left text-[10px] leading-5 text-white/55">The custom character saved in your server configuration will join this call.</p>:<div role="radiogroup" aria-label="Runway preset character" className="mt-3 grid grid-cols-3 gap-1.5">
        {runwayPresets.map((preset)=>{const Icon=presetIcons[preset.id];const selected=preset.id===presetId;return <label key={preset.id} className={`group relative min-h-[66px] cursor-pointer rounded-xl border px-2 py-2 text-left transition focus-within:outline-none focus-within:ring-2 focus-within:ring-[#79d5cd] ${selected?"border-[#79d5cd]/60 bg-[#79d5cd]/12 text-white":"border-white/8 bg-white/[.035] text-white/45 hover:border-white/20 hover:bg-white/[.07] hover:text-white/75"}`}><input type="radio" name="runway-preset" value={preset.id} checked={selected} onChange={()=>setPresetId(preset.id)} className="sr-only"/><Icon size={14} className={selected?"text-[#79d5cd]":"text-white/35"}/><span className="mt-2 block text-[9px] font-medium leading-3">{preset.name}</span>{selected?<span className="absolute right-2 top-2 size-1.5 rounded-full bg-[#79d5cd] shadow-[0_0_8px_#79d5cd]"/>:null}</label>;})}
      </div>}
      {error?<p role="alert" className="mt-3 rounded-lg border border-red-300/20 bg-red-400/10 px-3 py-2 text-[10px] leading-4 text-red-100">{error}</p>:null}
      {!configured?<p className="mt-3 rounded-lg border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-[10px] leading-4 text-amber-100">Add the Runway developer API key to enable this trial.</p>:null}
      <Button disabled={!configured} onClick={()=>{setError(null);setActive(true);}} className="mt-3 w-full bg-[#dff5f1] text-[#102124] hover:bg-white"><CircleDollarSign size={14}/>Start with {customAvatar?"your character":runwayPresets.find(({id})=>id===presetId)?.name}</Button>
      <p className="mt-2 text-[8px] leading-4 text-white/35">Approx. $0.02 to start, then $0.02 per 6 seconds.</p>
    </div>
  </div>;
}
