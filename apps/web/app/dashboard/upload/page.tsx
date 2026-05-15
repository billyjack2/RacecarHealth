"use client";

import { upload } from "@vercel/blob/client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const router = useRouter();
  const [status, setStatus] = useState<
    "idle" | "uploading" | "done" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(form: FormData) {
    const file = form.get("file");
    if (!(file instanceof File)) {
      setError("Pick a file first.");
      setStatus("error");
      return;
    }
    setStatus("uploading");
    setError(null);
    try {
      await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/blob/upload-url",
        // Threaded to onBeforeGenerateToken on the server. Vercel signs
        // it into the upload token so it can't be tampered with after.
        clientPayload: JSON.stringify({ size: file.size }),
      });
      setStatus("done");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setStatus("error");
    }
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-12">
      <h1 className="text-2xl font-semibold">Upload CSV</h1>
      <form action={onSubmit} className="flex flex-col items-center gap-3">
        <input
          name="file"
          type="file"
          accept=".csv,text/csv"
          required
          className="text-sm"
        />
        <button
          type="submit"
          disabled={status === "uploading"}
          className="rounded-full bg-foreground px-5 py-2 text-sm text-background disabled:opacity-50"
        >
          {status === "uploading" ? "Uploading…" : "Upload"}
        </button>
      </form>
      {status === "done" && (
        <p className="text-sm text-green-600">Uploaded.</p>
      )}
      {status === "error" && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </main>
  );
}
