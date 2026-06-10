"use client";
import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function SoutenirAnnuleError({
  error, reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <section style={{ padding: "3rem 0", minHeight: "40vh", display: "flex", alignItems: "center" }}>
      <div style={{ padding: "1.5rem", borderRadius: 14, background: "var(--surface)", border: "1px solid var(--border)", maxWidth: 420, width: "100%" }}>
        <p style={{ fontWeight: 700 }}>Un problème est survenu</p>
        {error.digest && <p className="muted" style={{ marginTop: "0.4rem", fontSize: "0.78rem", fontFamily: "monospace" }}>{error.digest}</p>}
        <div style={{ display: "flex", gap: "0.6rem", marginTop: "1rem" }}>
          <Button onClick={reset} size="sm">Réessayer</Button>
          <Button href="/soutenir" variant="secondary" size="sm">Soutenir</Button>
        </div>
      </div>
    </section>
  );
}
