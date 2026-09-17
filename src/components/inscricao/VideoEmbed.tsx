"use client";

import { ExternalLink, Play } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

function idYoutube(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") return u.pathname.slice(1) || null;
    if (u.hostname.endsWith("youtube.com")) {
      if (u.pathname === "/watch") return u.searchParams.get("v");
      const m = /^\/(shorts|embed|live)\/([^/]+)/.exec(u.pathname);
      if (m) return m[2];
    }
  } catch {
    return null;
  }
  return null;
}

/* YouTube: fachada leve (thumbnail) que só carrega o iframe ao tocar. Outros: link externo. */
export function VideoEmbed({ url, titulo }: { url: string; titulo: string }) {
  const [tocado, setTocado] = useState(false);
  const id = idYoutube(url);

  if (!id) {
    return (
      <a href={url} target="_blank" rel="noreferrer" className="rc-btn rc-btn--secondary">
        <ExternalLink className="rc-icon" aria-hidden="true" /> Assistir ao vídeo
      </a>
    );
  }
  if (tocado) {
    return (
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1`}
        title={`Vídeo: ${titulo}`}
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{ width: "100%", aspectRatio: "16 / 9", border: 0, borderRadius: "var(--radius-md)" }}
      />
    );
  }
  return (
    <button
      type="button"
      onClick={() => setTocado(true)}
      aria-label={`Reproduzir vídeo: ${titulo}`}
      style={{ position: "relative", display: "block", width: "100%", padding: 0, border: 0, borderRadius: "var(--radius-md)", overflow: "hidden", cursor: "pointer", background: "var(--color-surface)" }}
    >
      <Image src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" width={480} height={360} sizes="(max-width: 40rem) 100vw, 40rem" style={{ width: "100%", height: "auto", aspectRatio: "16 / 9", objectFit: "cover" }} />
      <span className="rc-btn rc-btn--primary" style={{ position: "absolute", inset: "50% auto auto 50%", transform: "translate(-50%, -50%)" }}>
        <Play className="rc-icon" aria-hidden="true" /> Assistir
      </span>
    </button>
  );
}
