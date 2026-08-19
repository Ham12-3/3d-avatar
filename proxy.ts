import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = (pathname: string) => pathname === "/dashboard" || pathname.startsWith("/dashboard/") || pathname.startsWith("/api/avatar") || pathname.startsWith("/api/knowledge");

const configured = Boolean(process.env.CLERK_SECRET_KEY && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export default configured
  ? clerkMiddleware(async (auth, request) => { if (isProtectedRoute(request.nextUrl.pathname)) await auth.protect(); })
  : function demoProxy() { return NextResponse.next(); };

export const config = { matcher: ["/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico)).*)", "/(api|trpc)(.*)"] };
