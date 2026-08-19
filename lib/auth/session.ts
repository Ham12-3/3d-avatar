export type AppIdentity = { userId: string; firstName: string; role: "ADMIN" | "MEMBER"; demo: boolean };

export async function requireIdentity(): Promise<AppIdentity> {
  if (!process.env.CLERK_SECRET_KEY || !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) return { userId: "demo-user", firstName: "Alex", role: "ADMIN", demo: true };
  const { auth, currentUser } = await import("@clerk/nextjs/server");
  const session = await auth();
  if (!session.userId) throw new Error("UNAUTHENTICATED");
  const user = await currentUser();
  const role = user?.publicMetadata.role === "ADMIN" ? "ADMIN" : "MEMBER";
  return { userId: session.userId, firstName: user?.firstName ?? "there", role, demo: false };
}
