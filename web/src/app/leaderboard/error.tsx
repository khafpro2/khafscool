"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function LeaderboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[leaderboard/error]", error);
  }, [error]);

  return (
    <section style={{ padding: "3rem 0", minHeight: "50vh", display: "flex", alignItems: "center" }}>
      <div style={{
        padding: "1.75rem", borderRadius: 16,
        background: "var(--surface)", border: "1px solid var(--border)",
        maxWidth: 480, width: "100%",
      }}>
        <p style={{ fontWeight: 800, fontSize: "1.1rem" }}>Classement indisponible</p>
        <p className="muted" style={{ marginTop: "0.5rem", fontSize: "0.93rem", lineHeight: 1.6 }}>
          Un problème est survenu. Réessaie ou reviens à la page principale.
        </p>
        {error.digest && (
          <p className="muted" style={{ marginTop: "0.5rem", fontSize: "0.78rem", fontFamily: "monospace" }}>
            Ref: {error.digest}
          </p>
        )}
        <div style={{ display: "flex", gap: "0.65rem", marginTop: "1.25rem", flexWrap: "wrap" }}>
          <Button onClick={reset} size="sm">Réessayer</Button>
          <Button href="/courses" variant="secondary" size="sm">Parcours</Button>
        </div>
      </div>
    </section>
  );
}
