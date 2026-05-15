import { auth } from "@clerk/nextjs/server";
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, orgId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-black/10 px-6 py-3 dark:border-white/10">
        <Link href="/dashboard" className="text-sm font-semibold">
          RaceCarHealth
        </Link>
        <div className="flex items-center gap-4">
          <OrganizationSwitcher
            hidePersonal
            afterCreateOrganizationUrl="/dashboard"
            afterSelectOrganizationUrl="/dashboard"
          />
          <UserButton />
        </div>
      </header>
      {orgId ? (
        children
      ) : (
        // Render-only state — we don't redirect because the user needs the
        // OrganizationSwitcher above to actually pick / create a team.
        <main className="flex flex-1 flex-col items-center justify-center gap-3 p-12 text-center">
          <h2 className="text-xl font-semibold">Pick or create a team</h2>
          <p className="max-w-md text-zinc-600 dark:text-zinc-400">
            RaceCarHealth scopes every car, session, and file to a team.
            Use the switcher above to pick one or create your first team.
          </p>
        </main>
      )}
    </div>
  );
}
