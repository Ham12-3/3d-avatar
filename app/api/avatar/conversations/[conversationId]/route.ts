import { requireIdentity } from "@/lib/auth/session";
import { demoSessionDetails } from "@/lib/data/demo";
import { databaseEnabled } from "@/lib/data/repository";
import type { SessionDetail, SessionTranscriptEntry } from "@/lib/domain/types";

function normalizeTranscript(value:unknown):SessionTranscriptEntry[]{
  if(!Array.isArray(value))return [];
  return value.flatMap((entry)=>{
    if(!entry||typeof entry!=="object")return [];
    const item=entry as Record<string,unknown>;
    return [{role:item.role==="user"?"user" as const:"assistant" as const,content:typeof item.content==="string"?item.content:null,timestamp:typeof item.timestamp==="string"?item.timestamp:null}];
  });
}

export async function GET(_request:Request,{params}:{params:Promise<{conversationId:string}>}){
  let identity;
  try{identity=await requireIdentity();}catch{return Response.json({error:"Sign in is required."},{status:401});}
  const {conversationId}=await params;

  if(databaseEnabled()){
    const {prisma}=await import("@/lib/db/prisma");
    const record=await prisma.avatarSession.findFirst({where:{userId:identity.userId,OR:[{id:conversationId},{providerConversationId:conversationId}]},include:{toolExecutions:{orderBy:{createdAt:"asc"}}}});
    if(record){
      const detail:SessionDetail={id:record.providerConversationId??record.id,status:record.status,transcript:normalizeTranscript(record.transcript),tools:record.toolExecutions.map((tool)=>({name:tool.toolName,status:tool.status,timestamp:tool.createdAt.toISOString(),durationMs:tool.durationMs})),recordingUrl:null,source:"local"};
      return Response.json(detail,{headers:{"Cache-Control":"no-store"}});
    }
  }

  const demo=demoSessionDetails[conversationId];
  if(identity.demo&&demo)return Response.json(demo,{headers:{"Cache-Control":"no-store"}});
  return Response.json({error:"Conversation unavailable."},{status:404});
}
