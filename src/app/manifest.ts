import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Recreativa · Inscrições",
    short_name: "Recreativa",
    lang: "pt-BR",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f1f5",
    theme_color: "#37157b",
    icons: [
      { src: "/marca/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/marca/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
