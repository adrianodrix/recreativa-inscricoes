import type { MetadataRoute } from "next";
import { urlAbsoluta } from "@/lib/seo/metadados";

/* Público aberto aos buscadores; painel, API e confirmação, não. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/painel", "/api", "/*/obrigado"] }],
    sitemap: urlAbsoluta("/sitemap.xml"),
  };
}
