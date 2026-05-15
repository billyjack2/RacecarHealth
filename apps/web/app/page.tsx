import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-12">
      <h1 className="text-3xl font-semibold tracking-tight">
        RaceCarHealth
      </h1>
      <p className="text-zinc-600 dark:text-zinc-400 max-w-md text-center">
        Telemetry health checks for race-car CSV logs.
      </p>
      <div className="flex gap-3">
        <Link
          href="/sign-in"
          className="rounded-full border border-black/10 px-5 py-2 text-sm dark:border-white/20"
        >
          Sign in
        </Link>
        <Link
          href="/sign-up"
          className="rounded-full bg-foreground px-5 py-2 text-sm text-background"
        >
          Sign up
        </Link>
      </div>
    </main>
  );
}
