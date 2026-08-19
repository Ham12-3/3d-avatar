"use client";

import { useEffect, useRef } from "react";
import type { Mesh } from "three";
import type { AvatarStatus } from "./avatar-provider";

export function BrowserAvatarStage({status,compact=false}:{status:AvatarStatus;compact?:boolean}){
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const statusRef=useRef(status);
  useEffect(()=>{statusRef.current=status;},[status]);

  useEffect(()=>{
    const canvas=canvasRef.current;
    if(!canvas)return;
    let stopped=false;
    let frame=0;
    let cleanup=()=>{};
    void import("three").then((THREE)=>{
      if(stopped)return;
      const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:"high-performance"});
      renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.5));
      renderer.outputColorSpace=THREE.SRGBColorSpace;
      renderer.toneMapping=THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure=1.15;
      const scene=new THREE.Scene();
      const camera=new THREE.PerspectiveCamera(31,1,.1,100);
      camera.position.set(0,.08,7.1);

      scene.add(new THREE.HemisphereLight(0xdaf7f1,0x102326,2.7));
      const key=new THREE.DirectionalLight(0xffffff,4.2);key.position.set(-3,4,5);scene.add(key);
      const edge=new THREE.PointLight(0x35d0c5,13,8);edge.position.set(2,-1,2);scene.add(edge);

      const avatar=new THREE.Group();avatar.position.y=-.1;scene.add(avatar);
      const skin=new THREE.MeshPhysicalMaterial({color:0xbfd8d4,roughness:.54,metalness:.08,clearcoat:.25,clearcoatRoughness:.55});
      const dark=new THREE.MeshStandardMaterial({color:0x10282b,roughness:.38,metalness:.22});
      const signal=new THREE.MeshStandardMaterial({color:0x70e1d6,emissive:0x087f79,emissiveIntensity:1.4,roughness:.28,metalness:.35});
      const soft=new THREE.MeshPhysicalMaterial({color:0xe9f6f2,roughness:.65,transparent:true,opacity:.9});

      const shoulders=new THREE.Mesh(new THREE.CapsuleGeometry(.92,.92,8,24),dark);shoulders.rotation.z=Math.PI/2;shoulders.scale.set(1.45,.62,.58);shoulders.position.y=-1.75;avatar.add(shoulders);
      const neck=new THREE.Mesh(new THREE.CylinderGeometry(.37,.48,.68,32),skin);neck.position.y=-1.12;avatar.add(neck);
      const head=new THREE.Mesh(new THREE.SphereGeometry(1.18,64,48),skin);head.scale.set(.82,1.08,.82);head.position.y=.12;avatar.add(head);
      const temple=new THREE.Mesh(new THREE.TorusGeometry(.91,.035,12,80),signal);temple.scale.y=1.14;temple.position.set(0,.16,.2);avatar.add(temple);

      const eyes:Mesh[]=[];
      const pupils:Mesh[]=[];
      for(const x of [-.39,.39]){
        const eye=new THREE.Mesh(new THREE.SphereGeometry(.17,28,18),soft);eye.scale.set(1.15,.75,.36);eye.position.set(x,.34,.91);avatar.add(eye);eyes.push(eye);
        const pupil=new THREE.Mesh(new THREE.SphereGeometry(.075,20,14),signal);pupil.scale.z=.38;pupil.position.set(x,.34,1.045);avatar.add(pupil);pupils.push(pupil);
        const brow=new THREE.Mesh(new THREE.CapsuleGeometry(.025,.28,4,10),dark);brow.rotation.z=Math.PI/2+(x<0?-.09:.09);brow.position.set(x,.67,.89);avatar.add(brow);
      }
      const mouth=new THREE.Mesh(new THREE.CapsuleGeometry(.1,.33,8,20),dark);mouth.rotation.z=Math.PI/2;mouth.scale.set(.55,1,.34);mouth.position.set(0,-.39,.93);avatar.add(mouth);
      const mouthSignal=new THREE.Mesh(new THREE.CapsuleGeometry(.055,.2,8,16),signal);mouthSignal.rotation.z=Math.PI/2;mouthSignal.scale.set(.4,1,.25);mouthSignal.position.set(0,-.39,1.02);avatar.add(mouthSignal);

      const orbit=new THREE.Mesh(new THREE.TorusGeometry(1.72,.018,8,120),signal);orbit.rotation.set(Math.PI/2.7,.25,.12);scene.add(orbit);
      const orbitTwo=new THREE.Mesh(new THREE.TorusGeometry(1.48,.012,8,100),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.2}));orbitTwo.rotation.set(Math.PI/2.2,-.28,-.18);scene.add(orbitTwo);
      const marker=new THREE.Mesh(new THREE.OctahedronGeometry(.075,0),signal);marker.position.set(1.7,0,0);orbit.add(marker);

      const resize=()=>{const width=Math.max(1,canvas.clientWidth);const height=Math.max(1,canvas.clientHeight);renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();};
      const observer=new ResizeObserver(resize);observer.observe(canvas);resize();
      let stageVisible=true;
      const visibilityObserver=new IntersectionObserver(([entry])=>{stageVisible=entry?.isIntersecting??true;});
      visibilityObserver.observe(canvas);
      const startedAt=performance.now();
      let lastRenderedAt=0;
      const render=(now:number)=>{
        if(stopped)return;
        frame=window.requestAnimationFrame(render);
        if(document.hidden||!stageVisible)return;
        const active=statusRef.current!=="Offline"&&statusRef.current!=="Disconnected";
        const minimumFrameTime=active?1000/30:1000/15;
        if(now-lastRenderedAt<minimumFrameTime)return;
        lastRenderedAt=now;
        const time=(performance.now()-startedAt)/1000;
        const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const speaking=statusRef.current==="Speaking";
        const thinking=statusRef.current==="Thinking";
        const blinkPhase=time%4.3;const blink=blinkPhase>4.12?Math.sin(((blinkPhase-4.12)/.18)*Math.PI):0;
        const mouthOpen=speaking ? 0.3+Math.abs(Math.sin(time*15))*0.95 : 0.24;
        mouth.scale.y=mouthOpen;mouthSignal.scale.y=mouthOpen*.8;
        eyes.forEach((eye)=>{eye.scale.y=Math.max(.06,.75*(1-blink));});
        pupils.forEach((pupil,index)=>{pupil.position.x=(index? .39:-.39)+Math.sin(time*.55)*.018;pupil.position.y=.34+Math.cos(time*.4)*.012;});
        avatar.rotation.y=reduced?0:Math.sin(time*.42)*.11;
        avatar.rotation.x=reduced?0:Math.cos(time*.34)*.025;
        avatar.position.y=-.1+(reduced?0:Math.sin(time*.8)*.025);
        orbit.rotation.z+=reduced?0:thinking?.013:active?.003:.001;
        orbitTwo.rotation.z-=reduced?0:active?.002:.0005;
        signal.emissiveIntensity=thinking?2.8:speaking?2.2:active?1.5:.65;
        renderer.render(scene,camera);
      };
      frame=window.requestAnimationFrame(render);
      cleanup=()=>{observer.disconnect();visibilityObserver.disconnect();window.cancelAnimationFrame(frame);scene.traverse((object)=>{if(object instanceof THREE.Mesh){object.geometry.dispose();const materials=Array.isArray(object.material)?object.material:[object.material];materials.forEach((material)=>material.dispose());}});renderer.dispose();};
    }).catch(()=>{});
    return ()=>{stopped=true;cleanup();};
  },[]);

  return <div className={`relative h-full overflow-hidden bg-[#102124] nova-grid ${compact?"min-h-0":"min-h-[330px]"}`}>
    <div aria-hidden="true" className="absolute inset-0 grid place-items-center"><div className="size-48 rounded-full border border-white/[.07] bg-[#1b3437] shadow-[0_0_80px_rgba(56,216,201,.08)]"/></div>
    <canvas ref={canvasRef} className="relative h-full w-full" aria-hidden="true"/>
    <span className="sr-only">Nova browser-rendered 3D avatar. Current state: {status}.</span>
  </div>;
}
