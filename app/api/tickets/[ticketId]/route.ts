import { z } from "zod";
import { requireIdentity } from "@/lib/auth/session";
import { supportTickets } from "@/lib/data/demo";
import { databaseEnabled } from "@/lib/data/repository";
import type { SupportTicket } from "@/lib/domain/types";
import { logEvent } from "@/lib/observability/logger";
import { rateLimit } from "@/lib/security/rate-limit";

const paramsSchema=z.object({ticketId:z.coerce.number().int().positive()});
const actionSchema=z.discriminatedUnion("action",[
  z.object({action:z.literal("assign_to_me")}).strict(),
  z.object({action:z.literal("set_status"),status:z.enum(["OPEN","IN_PROGRESS","WAITING","RESOLVED","CLOSED"])}).strict(),
]);

export async function PATCH(request:Request,{params}:{params:Promise<{ticketId:string}>}){
  let identity;
  try{identity=await requireIdentity();}catch{return Response.json({error:"Sign in is required."},{status:401});}
  const limit=rateLimit(`ticket-update:${identity.userId}`,30,60_000);
  if(!limit.allowed)return Response.json({error:"Too many ticket changes. Try again shortly."},{status:429});
  try{
    const {ticketId}=paramsSchema.parse(await params);
    const input=actionSchema.parse(await request.json());
    const owner=identity.firstName==="there"?"Current user":identity.firstName;
    let ticket:SupportTicket;
    if(databaseEnabled()){
      const {prisma}=await import("@/lib/db/prisma");
      const existing=await prisma.supportTicket.findUnique({where:{ticketNumber:ticketId}});
      if(!existing)return Response.json({error:"Ticket not found."},{status:404});
      const updated=await prisma.supportTicket.update({where:{ticketNumber:ticketId},data:input.action==="assign_to_me"?{assignedUser:owner}:{status:input.status}});
      ticket={id:updated.ticketNumber,title:updated.title,description:updated.description,status:updated.status,priority:updated.priority,category:updated.category,assignedTeam:updated.assignedTeam,assignedUser:updated.assignedUser??"Unassigned",customer:updated.customer,createdAt:updated.createdAt.toISOString(),updatedAt:updated.updatedAt.toISOString()};
    }else{
      const existing=supportTickets.find((item)=>item.id===ticketId);
      if(!existing)return Response.json({error:"Ticket not found."},{status:404});
      ticket={...existing,...(input.action==="assign_to_me"?{assignedUser:owner}:{status:input.status}),updatedAt:new Date().toISOString()};
    }
    logEvent("info","support.ticket_updated",{ticketId,userId:identity.userId,action:input.action});
    return Response.json({ticket,persisted:databaseEnabled()},{headers:{"Cache-Control":"no-store"}});
  }catch(error){
    logEvent("warn","support.ticket_update_rejected",{userId:identity.userId,message:error instanceof Error?error.message:"Invalid request"});
    return Response.json({error:"The ticket could not be updated."},{status:400});
  }
}
