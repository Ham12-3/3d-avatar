import Link from "next/link";
import { SignUp } from "@clerk/nextjs";
import { Mark } from "@/components/brand/mark";

export default function SignUpPage() {
  const configured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  return <main className="grid min-h-screen bg-[var(--surface)] lg:grid-cols-2"><section className="hidden bg-[#172629] p-12 text-white lg:flex lg:flex-col lg:justify-between"><Mark inverse/><div><p className="font-data text-[10px] uppercase tracking-[.16em] text-[#79d5cd]">Your operating layer</p><h1 className="mt-6 max-w-xl text-6xl font-medium leading-[.95] tracking-[-.055em]">Ask. Investigate. Act.</h1></div><p className="text-sm text-white/50">Camera and screen sharing always require your permission.</p></section><section className="grid place-items-center p-6"><div className="w-full max-w-md">{configured ? <SignUp /> : <div className="border border-[var(--line)] bg-[var(--surface-strong)] p-8"><p className="eyebrow">Development access</p><h1 className="mt-4 text-3xl font-semibold tracking-[-.04em]">Create an account with Clerk.</h1><p className="mt-4 leading-7 text-[var(--muted)]">Authentication UI activates when Clerk keys are configured. The local demo remains available for product evaluation.</p><Link href="/dashboard" className="mt-8 inline-flex h-11 items-center rounded-md bg-[var(--ink)] px-5 text-sm font-semibold text-[var(--surface)]">Enter demo workspace</Link></div>}</div></section></main>;
}
