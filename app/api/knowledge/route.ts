import { z } from "zod";
import { requireIdentity } from "@/lib/auth/session";
import { databaseEnabled, loadKnowledgeDocuments } from "@/lib/data/repository";
import { logEvent } from "@/lib/observability/logger";

const documentSchema=z.object({id:z.string().min(2).max(100),name:z.string().trim().min(2).max(120),type:z.string().trim().min(2).max(60),content:z.string().trim().min(10).max(150_000),status:z.enum(["READY","PROCESSING","FAILED"]).optional(),words:z.number().int().nonnegative().optional(),updatedAt:z.string().optional()});

export async function GET(){try{await requireIdentity();return Response.json({documents:await loadKnowledgeDocuments()},{headers:{"Cache-Control":"private, max-age=30"}});}catch{return Response.json({error:"Unauthorised"},{status:401});}}

export async function POST(request:Request){
  try{
    const identity=await requireIdentity();if(identity.role!=="ADMIN")return Response.json({error:"Admin permission required"},{status:403});
    const input=documentSchema.parse(await request.json());
    if(databaseEnabled()){
      const {prisma}=await import("@/lib/db/prisma");
      const tokenCount=Math.ceil((input.words??input.content.split(/\s+/).length)*1.35);
      await prisma.knowledgeDocument.upsert({where:{id:input.id},update:{name:input.name,type:input.type,content:input.content,status:"READY",tokenCount},create:{id:input.id,name:input.name,type:input.type,content:input.content,status:"READY",tokenCount}});
    }
    logEvent("info","knowledge.document.saved",{userId:identity.userId,documentId:input.id,source:"local"});
    return Response.json({ok:true,id:input.id,status:"READY",source:"local"},{status:201});
  }catch(error){logEvent("error","knowledge.document.failed",{message:error instanceof Error?error.message:"Unknown"});return Response.json({error:"The document could not be saved."},{status:400});}
}

export async function DELETE(request:Request){
  try{
    const identity=await requireIdentity();if(identity.role!=="ADMIN")return Response.json({error:"Admin permission required"},{status:403});
    const id=z.string().min(2).max(100).parse(new URL(request.url).searchParams.get("id"));
    if(databaseEnabled()){const {prisma}=await import("@/lib/db/prisma");await prisma.knowledgeDocument.delete({where:{id}});}
    logEvent("info","knowledge.document.removed",{userId:identity.userId,documentId:id});return Response.json({ok:true});
  }catch{return Response.json({error:"The document could not be removed."},{status:400});}
}
