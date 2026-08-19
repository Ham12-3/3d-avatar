import { z } from "zod";
import { requireIdentity } from "@/lib/auth/session";
import { serverToolHandlers } from "@/lib/avatar/server-tools";
import { rateLimit } from "@/lib/security/rate-limit";

const schema=z.object({tool:z.enum(Object.keys(serverToolHandlers) as [keyof typeof serverToolHandlers,...Array<keyof typeof serverToolHandlers>]),arguments:z.record(z.string(),z.unknown()).default({})});
export async function POST(request:Request){try{const identity=await requireIdentity();const limit=rateLimit(`tool:${identity.userId}`,60,60_000);if(!limit.allowed)return Response.json({error:"Rate limit exceeded"},{status:429});const input=schema.parse(await request.json());const result=await serverToolHandlers[input.tool](input.arguments);return Response.json({ok:true,result});}catch(error){if(error instanceof Error&&error.message==="UNAUTHENTICATED")return Response.json({error:"Unauthorised"},{status:401});return Response.json({error:"The requested tool could not complete."},{status:400});}}
