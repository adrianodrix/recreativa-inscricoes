import type { MetadataRoute } from "next";
import { urlAbsoluta } from "@/lib/seo/metadados";
import { criarClienteServidor } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/* Página inicial e a inscrição de cada evento publicado. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await criarClienteServidor();
  const { data } = await supabase.rpc("listar_eventos_publicados");

  return [
    { url: urlAbsoluta("/"), changeFrequency: "daily", priority: 1 },
    ...(data ?? []).map((e) => ({
      url: urlAbsoluta(`/${e.slug}`),
      lastModified: new Date(e.atualizado_em),
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
  ];
}
