import { Users } from "lucide-react";
import Image from "next/image";
import type { BrincadeiraPublica } from "@/features/inscricao/modelo/tipos";
import { urlImagem } from "@/lib/storage/url";
import { RichText } from "@/lib/texto-rico/RichText";
import { VideoEmbed } from "./VideoEmbed";

export const ROTULO_CATEGORIA = {
  casais: "Casais",
  jovens: "Jovens",
  criancas: "Crianças",
  pais_e_filhos: "Pais e filhos",
} as const;

const UNIDADE = { casais: "casais", jovens: "vagas", criancas: "vagas", pais_e_filhos: "duplas" } as const;

/* Cartão de uma brincadeira: foto, categoria, vagas, regras e vídeo. */
export function GameCard({ brincadeira }: { brincadeira: BrincadeiraPublica }) {
  const foto = urlImagem(brincadeira.foto_path);
  return (
    <article className="rc-card campo-anima">
      {foto && (
        <div className="rc-card__media">
          <Image src={foto} alt="" width={640} height={360} sizes="(max-width: 40rem) 100vw, 40rem" />
        </div>
      )}
      <header className="rc-card__header">
        <h2 className="rc-card__title">{brincadeira.nome}</h2>
        <span className="rc-badge rc-badge--roxo">{ROTULO_CATEGORIA[brincadeira.categoria]}</span>
      </header>
      <ul className="rc-card__meta">
        <li>
          <Users className="rc-icon" aria-hidden="true" />
          {brincadeira.vagas_restantes} {UNIDADE[brincadeira.categoria]} restantes
          {brincadeira.formato === "em_grupo" ? " · em times" : brincadeira.formato === "individual" ? " · um contra o outro" : ""}
        </li>
      </ul>
      <RichText doc={brincadeira.regras} />
      {brincadeira.video_url && <VideoEmbed url={brincadeira.video_url} titulo={brincadeira.nome} />}
    </article>
  );
}
