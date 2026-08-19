import Link from "next/link";
import { SignIn } from "@clerk/nextjs";
import { Mark } from "@/components/brand/mark";

export default function SignInPage() {
  const configured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  return <main className="grid min-h-screen bg-[var(--surface)] lg:grid-cols-2"><section className="hidden bg-[#172629] p-12 text-white lg:flex lg:flex-col lg:justify-between"><Mark inverse/><blockquote className="max-w-lg text-4xl font-medium leading-tight tracking-[-.04em]">“Nova turned our weekly review from forty minutes of hunting into one useful conversation.”</blockquote><p className="font-data text-[10px] uppercase tracking-[.15em] text-white/45">Northstar Operations · Internal preview</p></section><section className="grid place-items-center p-6"><div className="w-full max-w-md">{configured ? <SignIn /> : <div className="border border-[var(--line)] bg-[var(--surface-strong)] p-8"><p className="eyebrow">Development access</p><h1 className="mt-4 text-3xl font-semibold tracking-[-.04em]">Clerk is ready to connect.</h1><p className="mt-4 leading-7 text-[var(--muted)]">Add the Clerk keys from <code className="font-data text-xs">.env.example</code> to enable production sign-in. You can enter the local demo now.</p><Link href="/dashboard" className="mt-8 inline-flex h-11 items-center rounded-md bg-[var(--ink)] px-5 text-sm font-semibold text-[var(--surface)]">Enter demo workspace</Link></div>}</div></section></main>;
}
