"use client";

import { ImagePlus, LoaderCircle, Trash2 } from "lucide-react";
import Image from "next/image";
import { useId } from "react";
import { redimensionarImagem } from "@/lib/imagens/redimensionar";
import { enviarArquivo } from "@/lib/storage/enviar";
import { BUCKET_IMAGENS, urlImagem } from "@/lib/storage/url";
import styles from "./upload.module.css";
import { useEnvio } from "./useEnvio";

interface Props {
  name: string;
  rotulo: string;
  prefixo: string; // ex.: brincadeiras/<evento_id>
  valorInicial?: string | null;
  ajuda?: string;
}

/*
 * Reduz no navegador (máx. 1600 px, WebP), envia direto ao Storage (RLS: só
 * administrador) e guarda o caminho num campo oculto do formulário. Sem imagem,
 * o campo fica vazio. A imagem trocada é apagada do Storage ao salvar.
 */
export function UploadImagem({ name, rotulo, prefixo, valorInicial, ajuda }: Props) {
  const id = useId();
  const { path, setPath, enviando, erro, enviar } = useEnvio(valorInicial);
  const url = urlImagem(path);

  function escolher(arquivo: File) {
    void enviar(async () => {
      const blob = await redimensionarImagem(arquivo);
      const caminho = `${prefixo}/${crypto.randomUUID()}.webp`;
      await enviarArquivo({ bucket: BUCKET_IMAGENS, caminho, arquivo: blob, tipo: "image/webp" });
      return caminho;
    }, "Não foi possível enviar a imagem.");
  }

  return (
    <div className="rc-field">
      <span className="rc-label">{rotulo}</span>
      <input type="hidden" name={name} value={path} />
      {url && <Image src={url} alt="" width={640} height={360} className={styles.previa} />}
      <div className={styles.botoes}>
        <label className="rc-btn rc-btn--secondary" htmlFor={id} aria-busy={enviando || undefined}>
          {enviando ? <LoaderCircle className="rc-icon" aria-hidden="true" /> : <ImagePlus className="rc-icon" aria-hidden="true" />}
          {url ? "Trocar imagem" : "Enviar imagem"}
        </label>
        <input
          id={id}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          hidden
          disabled={enviando}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) escolher(f);
            e.target.value = "";
          }}
        />
        {url && !enviando && (
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
