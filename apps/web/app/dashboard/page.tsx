import Link from "next/link";
import { getTeamId, TenancyError } from "@/lib/team";
import { queries } from "@/lib/db";

export default async function AppHome() {
  let teamId: string;
  try {
    teamId = await getTeamId();
  } catch (err) {
    // Layout already renders the org switcher prompt for `no_org_selected`,
    // but the page is rendered as a sibling — without this guard the throw
    // bubbles to an unformatted 500.
    if (err instanceof TenancyError && err.code === "no_org_selected") {
      return null;
    }
    throw err;
  }

  const [cars, recentFiles] = await Promise.all([
    queries.listCars(teamId),
    queries.listFiles(teamId),
  ]);

  return (
    <main className="flex flex-1 flex-col gap-8 p-8">
      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Cars</h2>
          <span className="text-sm text-zinc-500">{cars.length}</span>
        </div>
        {cars.length === 0 ? (
          <p className="text-sm text-zinc-500">
            No cars yet. (Car management UI lands in a later pass.)
          </p>
        ) : (
          <ul className="mt-2 space-y-1 text-sm">
            {cars.map((c) => (
              <li key={c.id}>{c.name}</li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent files</h2>
          <Link
            href="/dashboard/upload"
            className="rounded-full bg-foreground px-4 py-1.5 text-xs text-background"
          >
            Upload CSV
          </Link>
        </div>
        {recentFiles.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500">
            No files uploaded yet.
          </p>
        ) : (
          <ul className="mt-2 space-y-1 text-sm">
            {recentFiles.map((f) => (
              <li key={f.id}>
                {f.originalFilename}{" "}
                <span className="text-zinc-500">
                  · {new Date(f.uploadedAt).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
