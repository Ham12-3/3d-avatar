import RunwayML from "@runwayml/sdk";

import { requireIdentity } from "@/lib/auth/session";
import { isRunwayPresetId } from "@/lib/avatar/runway-presets";
import { logEvent } from "@/lib/observability/logger";
import { rateLimit } from "@/lib/security/rate-limit";

export const runtime="nodejs";

const personality=`You are Nova, a concise and friendly operations assistant. Speak naturally in British English. Keep most answers to one or two short sentences. You can answer general questions, but never invent company figures, tickets, policies, or live data you have not been given.`;
const startScript="Hi Alex, I’m Nova. What would you like to look at?";

export async function POST(request:Request){
  try{
    const identity=await requireIdentity();
    const limit=rateLimit(`runway-avatar:${identity.userId}`,3,10*60_000);
    if(!limit.allowed)return Response.json({error:"Please wait before starting another Runway call."},{status:429});

    const apiKey=process.env.RUNWAYML_API_SECRET?.trim();
    if(!apiKey)return Response.json({error:"Runway is not configured on this server."},{status:503});

    const avatarType=process.env.RUNWAY_AVATAR_TYPE==="custom"?"custom":"preset";
    const body=await request.json().catch(()=>({})) as {avatarId?:unknown};
    const requestedAvatarId=typeof body.avatarId==="string"?body.avatarId.trim():"";
    if(avatarType==="preset"&&requestedAvatarId&&!isRunwayPresetId(requestedAvatarId)){
      return Response.json({error:"Select one of the supported Runway preset characters."},{status:400});
    }
    const avatarId=avatarType==="custom"
      ?process.env.RUNWAY_AVATAR_ID?.trim()||""
      :requestedAvatarId||process.env.RUNWAY_AVATAR_ID?.trim()||"human-resource";
    if(!avatarId)return Response.json({error:"RUNWAY_AVATAR_ID is required for a custom character."},{status:503});
    const client=new RunwayML({apiKey});
    let avatar;
    if(avatarType==="custom")avatar={type:"custom" as const,avatarId};
    else{
      if(!isRunwayPresetId(avatarId))return Response.json({error:"RUNWAY_AVATAR_ID is not a supported Runway preset."},{status:503});
      avatar={type:"runway-preset" as const,presetId:avatarId};
    }
    const {id:sessionId}=await client.realtimeSessions.create(avatarType==="custom"
      ?{model:"gwm1_avatars",avatar,personality,startScript}
      :{model:"gwm1_avatars",avatar});

    let sessionKey:string|undefined;
    for(let attempt=0;attempt<60;attempt+=1){
      if(request.signal.aborted)throw new Error("Runway session request was cancelled.");
      const session=await client.realtimeSessions.retrieve(sessionId);
      if(session.status==="READY"){sessionKey=session.sessionKey;break;}
      if(session.status==="FAILED")throw new Error("Runway could not prepare the character session.");
      await new Promise((resolve)=>setTimeout(resolve,1000));
    }
    if(!sessionKey)return Response.json({error:"Runway took too long to prepare the character."},{status:504});

    const consumeResponse=await fetch(`${client.baseURL}/v1/realtime_sessions/${sessionId}/consume`,{
      method:"POST",
      headers:{Authorization:`Bearer ${sessionKey}`,"Content-Type":"application/json","X-Runway-Version":"2024-11-06"},
      body:"{}",
      signal:request.signal,
    });
    if(!consumeResponse.ok)throw new Error(`Runway credential exchange failed with ${consumeResponse.status}.`);
    const credentials=await consumeResponse.json() as {url:string;token:string;roomName:string};
    logEvent("info","avatar.runway.session_created",{userId:identity.userId,sessionId,avatarType,avatarId});
    return Response.json({sessionId,serverUrl:credentials.url,token:credentials.token,roomName:credentials.roomName});
  }catch(error){
    logEvent("warn","avatar.runway.session_failed",{error:error instanceof Error?error.message:"Unknown Runway error"});
    return Response.json({error:"The Runway character could not start. Check the API key and developer credit balance."},{status:503});
  }
}
