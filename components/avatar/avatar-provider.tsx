"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { interpretBrowserCommand, type NovaBrowserAction } from "@/lib/avatar/browser-agent";
import type { TicketFilters } from "@/lib/data/tickets";

export type AvatarStatus="Offline"|"Listening"|"Thinking"|"Speaking"|"Disconnected"|"Error";
type TranscriptLine={id:string;speaker:"You"|"Nova";text:string};

type WhisperWorkerMessage=
  |{type:"status";status:"loading"|"ready"|"transcribing"}
  |{type:"result";text:string}
  |{type:"error";message:string};

function localVoiceInputAvailable(){
  return typeof window!=="undefined"&&window.isSecureContext&&Boolean(navigator.mediaDevices?.getUserMedia)&&typeof MediaRecorder!=="undefined"&&typeof Worker!=="undefined";
}
const subscribeToBrowser=()=>()=>{};

type AvatarContextValue={
  status:AvatarStatus;
  isActive:boolean;
  elapsed:number;
  micOn:boolean;
  microphoneIssue:string|null;
  microphoneNotice:string|null;
  voiceOn:boolean;
  recognitionAvailable:boolean;
  transcript:TranscriptLine[];
  ticketFilters:TicketFilters;
  revenuePeriod:7|30|90;
  start:()=>void;
  end:()=>void;
  toggleMic:()=>void;
  toggleVoice:()=>void;
  setTicketFilters:(filters:TicketFilters)=>void;
  setRevenuePeriod:(period:7|30|90)=>void;
  executeCommand:(command:string)=>void;
};

const AvatarContext=createContext<AvatarContextValue|null>(null);

export function AvatarAppProvider({children}:{children:React.ReactNode}){
  const router=useRouter();
  const {setTheme}=useTheme();
  const [status,setStatus]=useState<AvatarStatus>("Offline");
  const [isActive,setActive]=useState(false);
  const [elapsed,setElapsed]=useState(0);
  const [micOn,setMicOn]=useState(false);
  const [microphoneIssue,setMicrophoneIssue]=useState<string|null>(null);
  const [microphoneNotice,setMicrophoneNotice]=useState<string|null>(null);
  const [voiceOn,setVoiceOn]=useState(true);
  const [ticketFilters,setTicketFilters]=useState<TicketFilters>({status:"ALL",priority:"ALL",team:"ALL"});
  const [revenuePeriod,setRevenuePeriod]=useState<7|30|90>(30);
  const [transcript,setTranscript]=useState<TranscriptLine[]>([]);
  const recognitionAvailable=useSyncExternalStore(subscribeToBrowser,localVoiceInputAvailable,()=>false);
  const recorderRef=useRef<MediaRecorder|null>(null);
  const microphoneStreamRef=useRef<MediaStream|null>(null);
  const whisperWorkerRef=useRef<Worker|null>(null);
  const commandAbortRef=useRef<AbortController|null>(null);
  const executeRef=useRef<(command:string)=>void>(()=>{});
  const timers=useRef(new Set<number>());
  const activeRef=useRef(false);
  const micRef=useRef(false);
  const voiceRef=useRef(true);
  const speakingRef=useRef(false);
  const micRequestRef=useRef(false);

  useEffect(()=>{activeRef.current=isActive;},[isActive]);
  useEffect(()=>{micRef.current=micOn;},[micOn]);
  useEffect(()=>{voiceRef.current=voiceOn;},[voiceOn]);
  useEffect(()=>{if(!isActive)return;const timer=window.setInterval(()=>setElapsed((value)=>value+1),1000);return()=>window.clearInterval(timer);},[isActive]);

  const schedule=useCallback((callback:()=>void,delay:number)=>{
    const timer=window.setTimeout(()=>{timers.current.delete(timer);callback();},delay);
    timers.current.add(timer);return timer;
  },[]);

  const reportMicrophoneIssue=useCallback((message:string)=>{
    micRef.current=false;setMicOn(false);setMicrophoneNotice(null);setMicrophoneIssue(message);setStatus("Error");
    setTranscript((lines)=>lines.at(-1)?.text===message?lines:[...lines,{id:crypto.randomUUID(),speaker:"Nova",text:message}]);
  },[]);

  const getWhisperWorker=useCallback(()=>{
    if(whisperWorkerRef.current)return whisperWorkerRef.current;
    const worker=new Worker(new URL("./whisper.worker.ts",import.meta.url),{type:"module"});
    worker.onmessage=(event:MessageEvent<WhisperWorkerMessage>)=>{
      const message=event.data;
      if(message.type==="status"){
        if(message.status==="loading")setMicrophoneNotice("Downloading the local speech model for first use…");
        else if(message.status==="ready")setMicrophoneNotice("Local speech model ready.");
        else setMicrophoneNotice("Transcribing your recording locally…");
        return;
      }
      if(message.type==="error"){
        reportMicrophoneIssue(message.message);return;
      }
      setMicrophoneNotice(null);
      if(!activeRef.current)return;
      const command=message.text.replace(/\[(?:BLANK_AUDIO|MUSIC|SILENCE)\]/gi,"").trim();
      if(command)executeRef.current(command);
      else reportMicrophoneIssue("I could not hear any speech in that recording. Move closer to the microphone and try again.");
    };
    worker.onerror=()=>reportMicrophoneIssue("The local speech model could not start. Refresh the page and try the microphone again.");
    whisperWorkerRef.current=worker;
    return worker;
  },[reportMicrophoneIssue]);

  const transcribeRecording=useCallback(async(blob:Blob)=>{
    if(!activeRef.current)return;
    setStatus("Thinking");setMicrophoneNotice("Preparing your recording for local transcription…");
    try{
      const audio=await decodeAudioTo16KhzMono(blob);
      if(!activeRef.current)return;
      const worker=getWhisperWorker();
      worker.postMessage({type:"transcribe",audio},[audio.buffer]);
    }catch{
      reportMicrophoneIssue("The recording could not be processed. Please try speaking again or continue by typing.");
    }
  },[getWhisperWorker,reportMicrophoneIssue]);

  const speak=useCallback((text:string)=>{
    if(!voiceRef.current||!("speechSynthesis" in window)){
      setStatus("Listening");return;
    }
    speakingRef.current=true;
    const utterance=new SpeechSynthesisUtterance(text);utterance.lang="en-GB";utterance.rate=.96;utterance.pitch=.92;
    const voices=window.speechSynthesis.getVoices();utterance.voice=voices.find((voice)=>voice.lang.toLowerCase().startsWith("en-gb"))??voices.find((voice)=>voice.lang.toLowerCase().startsWith("en"))??null;
    const finish=()=>{speakingRef.current=false;if(activeRef.current)setStatus("Listening");};
    utterance.onstart=()=>setStatus("Speaking");utterance.onend=finish;utterance.onerror=finish;
    window.speechSynthesis.cancel();window.speechSynthesis.speak(utterance);
  },[]);

  const performAction=useCallback((action:NovaBrowserAction)=>{
    if(action.type==="theme"){
      setTheme(action.value);void fetch("/api/preferences",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({theme:action.value})});return;
    }
    if(action.type==="tickets"){
      const filters:TicketFilters={status:action.open?"OPEN":"ALL",priority:action.urgent?"URGENT":"ALL",team:"ALL"};setTicketFilters(filters);
      router.push(action.urgent?"/dashboard/tickets?status=OPEN&priority=URGENT":"/dashboard/tickets");return;
    }
    if(action.type==="revenue"){
      setRevenuePeriod(action.period);router.push(`/dashboard/revenue?period=${action.period}`);schedule(()=>focusTarget("revenue-chart"),700);return;
    }
    if(action.type==="knowledge"){router.push("/dashboard/knowledge");return;}
    if(action.type==="navigate")router.push(action.destination==="dashboard"?"/dashboard":`/dashboard/${action.destination}`);
  },[router,schedule,setTheme]);

  const executeCommand=useCallback((raw:string)=>{
    if(!raw.trim()||!activeRef.current)return;
    const command=raw.trim();const fallback=interpretBrowserCommand(command);
    setTranscript((lines)=>[...lines,{id:crypto.randomUUID(),speaker:"You",text:command}]);setStatus("Thinking");performAction(fallback.action);
    commandAbortRef.current?.abort();
    const controller=new AbortController();commandAbortRef.current=controller;
    void (async()=>{
      let answer=fallback.answer;
      try{
        const history=transcript.slice(-4).map((line)=>({role:line.speaker==="You"?"user":"assistant",content:line.text}));
        const context={path:`${window.location.pathname}${window.location.search}`,revenuePeriod:String(revenuePeriod),ticketFilters};
        const response=await fetch("/api/avatar/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:command,history,context}),signal:controller.signal});
        const payload=(await response.json()) as {answer?:unknown};
        if(!response.ok)throw new Error("Local model request failed.");
        if(typeof payload.answer==="string"&&payload.answer.trim())answer=payload.answer.trim();
      }catch{
        if(controller.signal.aborted)return;
        answer=`${fallback.answer} The local AI response was unavailable, so this is the built-in fallback.`;
      }finally{
        if(commandAbortRef.current===controller)commandAbortRef.current=null;
      }
      if(controller.signal.aborted||!activeRef.current)return;
      setTranscript((lines)=>[...lines,{id:crypto.randomUUID(),speaker:"Nova",text:answer}]);speak(answer);
    })();
  },[performAction,revenuePeriod,speak,ticketFilters,transcript]);
  useEffect(()=>{executeRef.current=executeCommand;},[executeCommand]);

  const start=useCallback(()=>{
    activeRef.current=true;setActive(true);setElapsed(0);setTranscript([]);
    getWhisperWorker().postMessage({type:"prepare"});
    const greeting="Hi Alex, I’m Nova. What would you like to look at?";
    setTranscript([{id:crypto.randomUUID(),speaker:"Nova",text:greeting}]);speak(greeting);
  },[getWhisperWorker,speak]);

  const end=useCallback(()=>{
    activeRef.current=false;micRef.current=false;speakingRef.current=false;setActive(false);setMicOn(false);setMicrophoneNotice(null);recorderRef.current?.stop();microphoneStreamRef.current?.getTracks().forEach((track)=>track.stop());microphoneStreamRef.current=null;commandAbortRef.current?.abort();commandAbortRef.current=null;window.speechSynthesis?.cancel();
    timers.current.forEach((timer)=>window.clearTimeout(timer));timers.current.clear();setStatus("Disconnected");schedule(()=>setStatus("Offline"),700);
  },[schedule]);

  const requestMicrophoneAccess=useCallback(async():Promise<MediaStream|null>=>{
    if(!window.isSecureContext||!navigator.mediaDevices?.getUserMedia){
      reportMicrophoneIssue("This browser cannot record microphone audio here. Open the app through localhost in a current browser, or continue by typing.");return null;
    }
    try{
      const stream=await navigator.mediaDevices.getUserMedia({audio:true});
      setMicrophoneIssue(null);return stream;
    }catch(error){
      const name=error instanceof DOMException?error.name:"UnknownError";
      if(name==="NotAllowedError"||name==="SecurityError")reportMicrophoneIssue("Microphone permission is blocked. In the browser’s site controls, set Microphone to Allow, then click Try again.");
      else if(name==="NotFoundError"||name==="DevicesNotFoundError")reportMicrophoneIssue("No microphone was found. Connect or enable a microphone, then click Try again.");
      else reportMicrophoneIssue("The microphone could not start. Close other apps using it, check site permissions, then click Try again.");
      return null;
    }
  },[reportMicrophoneIssue]);

  const toggleMic=useCallback(()=>{
    if(micRef.current){
      micRef.current=false;setMicOn(false);setStatus("Thinking");setMicrophoneNotice("Finishing your recording…");
      const recorder=recorderRef.current;
      if(recorder?.state==="recording")recorder.stop();
      return;
    }
    if(!localVoiceInputAvailable()){
      reportMicrophoneIssue("Local voice input is not available in this browser. Open the app through localhost in a current Chrome or Edge browser, or continue by typing.");return;
    }
    if(micRequestRef.current)return;
    micRequestRef.current=true;
    void (async()=>{
      try{
        const stream=await requestMicrophoneAccess();
        if(!stream||!activeRef.current){stream?.getTracks().forEach((track)=>track.stop());return;}
        const chunks:Blob[]=[];
        const recorder=new MediaRecorder(stream);
        microphoneStreamRef.current=stream;recorderRef.current=recorder;
        recorder.ondataavailable=(event)=>{if(event.data.size>0)chunks.push(event.data);};
        recorder.onerror=()=>reportMicrophoneIssue("The microphone stopped unexpectedly. Please try again.");
        recorder.onstop=()=>{
          stream.getTracks().forEach((track)=>track.stop());
          if(microphoneStreamRef.current===stream)microphoneStreamRef.current=null;
          if(recorderRef.current===recorder)recorderRef.current=null;
          const blob=new Blob(chunks,{type:recorder.mimeType||"audio/webm"});
          if(blob.size>0)void transcribeRecording(blob);
          else if(activeRef.current)reportMicrophoneIssue("No microphone audio was recorded. Please try again.");
        };
        recorder.start(250);micRef.current=true;setMicOn(true);setMicrophoneIssue(null);setMicrophoneNotice("Recording locally — click the microphone again when you finish speaking.");setStatus("Listening");
      }finally{micRequestRef.current=false;}
    })();
  },[reportMicrophoneIssue,requestMicrophoneAccess,transcribeRecording]);

  const toggleVoice=useCallback(()=>{
    setVoiceOn((enabled)=>{const next=!enabled;voiceRef.current=next;if(!next){window.speechSynthesis?.cancel();speakingRef.current=false;if(activeRef.current)setStatus("Listening");}return next;});
  },[]);

  useEffect(()=>()=>{if(recorderRef.current?.state==="recording")recorderRef.current.stop();microphoneStreamRef.current?.getTracks().forEach((track)=>track.stop());whisperWorkerRef.current?.terminate();commandAbortRef.current?.abort();if(typeof window!=="undefined")window.speechSynthesis?.cancel();timers.current.forEach((timer)=>window.clearTimeout(timer));timers.current.clear();},[]);

  const value=useMemo(()=>({status,isActive,elapsed,micOn,microphoneIssue,microphoneNotice,voiceOn,recognitionAvailable,transcript,ticketFilters,revenuePeriod,start,end,toggleMic,toggleVoice,setTicketFilters,setRevenuePeriod,executeCommand}),[status,isActive,elapsed,micOn,microphoneIssue,microphoneNotice,voiceOn,recognitionAvailable,transcript,ticketFilters,revenuePeriod,start,end,toggleMic,toggleVoice,executeCommand]);
  return <AvatarContext.Provider value={value}>{children}</AvatarContext.Provider>;
}

function focusTarget(target:string){
  const element=document.querySelector(`[data-avatar-target="${CSS.escape(target)}"]`);if(!element)return;
  element.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"center"});element.classList.add("avatar-target-highlight");window.setTimeout(()=>element.classList.remove("avatar-target-highlight"),2200);
}

export function useAvatarApp(){const value=useContext(AvatarContext);if(!value)throw new Error("useAvatarApp must be used inside AvatarAppProvider");return value;}

async function decodeAudioTo16KhzMono(blob:Blob){
  const context=new AudioContext();
  try{
    const decoded=await context.decodeAudioData(await blob.arrayBuffer());
    const frameCount=Math.max(1,Math.ceil(decoded.duration*16000));
    const offline=new OfflineAudioContext(1,frameCount,16000);
    const source=offline.createBufferSource();source.buffer=decoded;source.connect(offline.destination);source.start();
    const rendered=await offline.startRendering();
    return rendered.getChannelData(0).slice();
  }finally{await context.close();}
}
