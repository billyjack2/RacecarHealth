import {
  handleUpload,
  type HandleUploadBody,
} from "@vercel/blob/client";
import { NextRequest, NextResponse } from "next/server";
import { getTeamId, TenancyError } from "@/lib/team";
import { queries } from "@/lib/db";

// Hard ceiling per upload. 100 MB is generous for a single GEMS CSV;
// real sessions are typically 5–40 MB. Vercel enforces this server-side
// when generating the signed upload token — clients cannot bypass it.
const MAX_UPLOAD_BYTES = 100 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        // Auth check — throws TenancyError if not signed in or no Org.
        // The throw becomes a 4xx for the client; the upload never starts.
        const teamId = await getTeamId();

        // clientPayload comes from the browser BEFORE the token is signed.
        // Vercel signs it into the token so it can't be modified after,
        // but the browser can lie about size to begin with. The actual
        // transferred bytes are still hard-capped by maximumSizeInBytes
        // below — a forged small size cannot enable a large upload. The
        // only consequence of a lying client is a wrong sizeBytes in the
        // DB, which is cosmetic until storage billing lands on it.
        let clientSize: number | null = null;
        if (clientPayload) {
          try {
            const parsed = JSON.parse(clientPayload) as { size?: number };
            if (typeof parsed.size === "number" && parsed.size > 0) {
              clientSize = parsed.size;
            }
          } catch {
            // Ignore malformed clientPayload; we'll fall back below.
          }
        }

        return {
          // Browsers often mislabel CSVs as text/plain — that's accepted.
          // octet-stream was removed because it accepts literally anything.
          allowedContentTypes: [
            "text/csv",
            "text/plain",
            "application/vnd.ms-excel",
          ],
          maximumSizeInBytes: MAX_UPLOAD_BYTES,
          tokenPayload: JSON.stringify({
            teamId,
            originalFilename: pathname,
            size: clientSize,
          }),
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        if (!tokenPayload) return;
        const { teamId, originalFilename, size } = JSON.parse(
          tokenPayload,
        ) as {
          teamId: string;
          originalFilename: string;
          size: number | null;
        };
        // Strip query string from blob URL so the unique index matches
        // exactly across retries.
        const canonicalUrl = blob.url.split("?")[0] ?? blob.url;
        // size is the browser-reported file size, signed into the token
        // by Vercel — trustworthy. If the client didn't supply it (older
        // upload paths), fall back to 0; reconciliation can backfill.
        await queries.insertFile({
          teamId,
          blobUrl: canonicalUrl,
          originalFilename,
          sizeBytes: size ?? 0,
        });
      },
    });
    return NextResponse.json(json);
  } catch (err) {
    if (err instanceof TenancyError) {
      return NextResponse.json(
        { error: err.code },
        { status: err.code === "not_signed_in" ? 401 : 403 },
      );
    }
    const message = err instanceof Error ? err.message : "upload_failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
