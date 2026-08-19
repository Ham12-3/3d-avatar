import { z } from "zod";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { requireIdentity } from "@/lib/auth/session";
import { demoPreferencesCookie, parseDemoPreferences } from "@/lib/data/preferences";
import { databaseEnabled, loadUserPreferences } from "@/lib/data/repository";

const preferencesSchema=z.object({theme:z.enum(["light","dark","system"]).optional(),captionsEnabled:z.boolean().optional(),microphoneDefault:z.boolean().optional(),cameraDefault:z.boolean().optional(),screenSharePrompt:z.boolean().optional()}).refine((value)=>Object.keys(value).length>0,{message:"At least one preference is required"});

export async function GET(){
  try {
    const identity=await requireIdentity();
    const preference=identity.demo?parseDemoPreferences((await cookies()).get(demoPreferencesCookie)?.value):await loadUserPreferences(identity.userId);
    return Response.json({preferences:preference},{headers:{"Cache-Control":"no-store"}});
  } catch {
    return Response.json({error:"Preferences could not be loaded."},{status:401});
  }
}

export async function POST(request:Request){
  try{
    const identity=await requireIdentity();
    const input=preferencesSchema.parse(await request.json());
    if(databaseEnabled()){
      const {prisma}=await import("@/lib/db/prisma");
      await prisma.appUser.upsert({where:{id:identity.userId},update:{displayName:identity.firstName},create:{id:identity.userId,displayName:identity.firstName,role:identity.role}});
      await prisma.userPreference.upsert({where:{userId:identity.userId},update:input,create:{userId:identity.userId,...input}});
    }
    const current=identity.demo?parseDemoPreferences((await cookies()).get(demoPreferencesCookie)?.value):await loadUserPreferences(identity.userId);
    const preferences={...current,...input};
    const response=NextResponse.json({ok:true,preferences,persisted:true});
    if(identity.demo)response.cookies.set(demoPreferencesCookie,JSON.stringify(preferences),{httpOnly:true,sameSite:"lax",secure:new URL(request.url).protocol==="https:",maxAge:31_536_000,path:"/"});
    return response;
  }catch{
    return Response.json({error:"Preferences could not be saved."},{status:400});
  }
}
