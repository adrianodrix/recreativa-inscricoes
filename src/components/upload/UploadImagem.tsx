"use client";

import { ImagePlus, LoaderCircle, Trash2 } from "lucide-react";
import Image from "next/image";
import { useId, useState } from "react";
import { redimensionarImagem } from "@/lib/imagens/redimensionar";
import { BUCKET_IMAGENS, urlImagem } from "@/lib/storage/url";
import { criarClienteNavegador } from "@/lib/supabase/client";

interface Props {
  name: string;
  rotulo: string;
  prefixo: string; // ex.: brincadeiras/<evento_id>
  valorInicial?: string | null;
  ajuda?: string;
}

/*
 * Envia direto do navegador ao Storage (RLS: só administrador) e guarda o
 * caminho num campo oculto do formulário. Sem imagem, o campo fica vazio.
 */
export function UploadImagem({ name, rotulo, prefixo, valorInicial, ajuda }: Props) {
  const id = useId();
  const [path, setPath] = useState(valorInicial ?? "");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string>();
  const url = urlImagem(path);

  async function enviar(arquivo: File) {
    setErro(undefined);
    setEnviando(true);
    try {
      const blob = await redimensionarImagem(arquivo);
      const destino = `${prefixo}/${crypto.randomUUID()}.webp`;
      const supabase = criarClienteNavegador();
      const { error } = await supabase.storage.from(BUCKET_IMAGENS).upload(destino, blob, { contentType: "image/webp", upsert: false });
      if (error) throw error;
      setPath(destino);
    } catch (e) {
      setErro(e instanceof Error ? `Não foi possível enviar: ${e.message}` : "Não foi possível enviar a imagem.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="rc-field">
      <span className="rc-label">{rotulo}</span>
      <input type="hidden" name={name} value={path} />
      {url && (
        <Image src={url} alt="" width={640} height={360} style={{ width: "100%", maxWidth: "24rem", height: "auto", borderRadius: "var(--radius-md)" }} />
      )}
      <div style={{ display: "flex", gap: "var(--spacing-3)", flexWrap: "wrap" }}>
        <label className="rc-btn rc-btn--secondary" htmlFor={id} aria-busy={enviando || undefined}>
          {enviando ? <LoaderCircle className="rc-icon" aria-hidden="true" /> : <ImagePlus className="rc-icon" aria-hidden="true" />}
          {url ? "Trocar imagem" : "Enviar imagem"}
        </label>
        <input
          id={id}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          style={{ display: "none" }}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void enviar(f);
            e.target.value = "";
          }}
        />
        {url && (
          <button type="button" className="rc-btn" onClick={() => setPath("")}>
            <Trash2 className="rc-icon" aria-hidden="true" /> Remover
          </button>
        )}
      </div>
      {erro && <p className="rc-error">{erro}</p>}
      {ajuda && <p className="rc-hint">{ajuda}</p>}
    </div>
  );
}
