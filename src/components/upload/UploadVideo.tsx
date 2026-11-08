"use client";

import { Clapperboard, Trash2 } from "lucide-react";
import { useId } from "react";
import { megas, validarVideo, VIDEO_TAMANHO_MAXIMO } from "@/lib/storage/arquivos";
import { enviarArquivo } from "@/lib/storage/enviar";
import { BUCKET_VIDEOS, urlVideo } from "@/lib/storage/url";
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
 * Vídeo curto enviado direto ao Storage, sem conversão (o navegador não comprime
 * vídeo): confere tipo e tamanho antes, mostra o progresso e guarda o caminho
 * num campo oculto. O vídeo trocado é apagado do Storage ao salvar.
 */
export function UploadVideo({ name, rotulo, prefixo, valorInicial, ajuda }: Props) {
  const id = useId();
  const { path, setPath, enviando, progresso, erro, setErro, enviar } = useEnvio(valorInicial);
  const url = urlVideo(path);

  function escolher(arquivo: File) {
    const v = validarVideo(arquivo);
    if (!v.ok) return setErro(v.erro);
    void enviar(async (aoProgredir) => {
      const caminho = `${prefixo}/${crypto.randomUUID()}.${v.extensao}`;
      await enviarArquivo({ bucket: BUCKET_VIDEOS, caminho, arquivo, tipo: arquivo.type, aoProgredir });
      return caminho;
    }, "Não foi possível enviar o vídeo.");
  }

  const porcento = Math.round((progresso ?? 0) * 100);

  return (
    <div className="rc-field">
      <span className="rc-label">
        {rotulo} <span className="rc-label__optional">(opcional)</span>
      </span>
      <input type="hidden" name={name} value={path} />
      {url && !enviando && <video src={url} controls preload="metadata" playsInline className={styles.previa} />}
      {enviando && (
        <div className={styles.progresso}>
          <progress max={100} value={porcento} aria-label="Enviando o vídeo" />
          <span aria-live="polite">Enviando… {porcento}%. Não feche esta página.</span>
        </div>
      )}
      <div className={styles.botoes}>
        <label className="rc-btn rc-btn--secondary" htmlFor={id} aria-disabled={enviando || undefined}>
          <Clapperboard className="rc-icon" aria-hidden="true" />
          {url ? "Trocar vídeo" : "Enviar vídeo"}
        </label>
        <input
          id={id}
          type="file"
          accept="video/mp4,video/quicktime,video/webm"
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
      <p className="rc-hint">{ajuda ?? `MP4, MOV ou WebM, até ${megas(VIDEO_TAMANHO_MAXIMO)}.`}</p>
    </div>
  );
}
