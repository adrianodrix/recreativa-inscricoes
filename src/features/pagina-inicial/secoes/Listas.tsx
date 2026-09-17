import { Camera, Users } from "lucide-react";
import Image from "next/image";
import { IconeTime } from "@/components/times/IconeTime";
import { ROTULO_CATEGORIA } from "@/lib/brincadeiras/schema";
import { urlImagem } from "@/lib/storage/url";
import { RichText } from "@/lib/texto-rico/RichText";
import type { TextoRico } from "@/lib/texto-rico/schema";
import type { BrincadeiraPublica, PerguntaPublica, TimePublico } from "../tipos";
import { Secao } from "./Secao";
import styles from "../pagina-inicial.module.css";

/* Texto do evento (recomendações e regras gerais), já validado no cadastro. */
export function Texto({ id, titulo, doc }: { id: string; titulo: string; doc: TextoRico | null }) {
  if (!doc) return null;
  return (
    <Secao id={id} titulo={titulo}>
      <div className={styles.cartaoTexto}>
        <RichText doc={doc} />
      </div>
    </Secao>
  );
}

export function Brincadeiras({ itens }: { itens: BrincadeiraPublica[] }) {
  if (itens.length === 0) return null;
  return (
    <Secao id="brincadeiras" titulo="As brincadeiras do dia">
      <ul className={styles.grade}>
        {itens.map((b) => {
          const foto = urlImagem(b.foto_path);
          return (
            <li key={b.id} className={styles.cartaoBrincadeira}>
              {foto ? (
                <Image src={foto} alt="" width={320} height={180} className={styles.fotoBrincadeira} />
              ) : (
                <span className={styles.fotoVazia} aria-hidden="true" />
              )}
              <div>
                <strong>{b.nome}</strong>
                <span className="rc-badge rc-badge--roxo">{ROTULO_CATEGORIA[b.categoria]}</span>
                {b.lotada && <span className="rc-badge rc-badge--warning">Vagas esgotadas</span>}
              </div>
            </li>
          );
        })}
      </ul>
    </Secao>
  );
}

export function Times({ itens }: { itens: TimePublico[] }) {
  if (itens.length < 2) return null;
  return (
    <Secao id="times" titulo="As equipes">
      <p className={styles.apoio}>
        <Users className="rc-icon" aria-hidden="true" /> Crianças e jovens são sorteados entre as equipes; os organizadores avisam pelo WhatsApp.
      </p>
      <ul className={styles.grade}>
        {itens.map((t) => (
          <li key={t.id} className={styles.cartaoTime}>
            <IconeTime imagemPath={t.imagem_path} cor={t.cor_padrao} icone={t.icone_padrao} tamanho={56} />
            <strong>{t.nome}</strong>
          </li>
        ))}
      </ul>
    </Secao>
  );
}

export function Duvidas({ itens }: { itens: PerguntaPublica[] }) {
  if (itens.length === 0) return null;
  return (
    <Secao id="duvidas" titulo="Dúvidas">
      <ul className={styles.listaDuvidas}>
        {itens.map((q) => (
          <li key={q.id}>
            <details className={styles.detalhe}>
              <summary>{q.pergunta}</summary>
              <RichText doc={q.resposta} />
            </details>
          </li>
        ))}
      </ul>
    </Secao>
  );
}

export function Fotos({ link }: { link: string | null }) {
  if (!link) return null;
  return (
    <Secao id="fotos" titulo="Fotos">
      <a href={link} target="_blank" rel="noreferrer" className={styles.cartaoFotos}>
        <Camera className="rc-icon rc-icon--lg" aria-hidden="true" />
        <span>
          <strong>Álbum das edições</strong>
          <span className={styles.apoio}>Os melhores momentos, reunidos em um álbum só.</span>
        </span>
      </a>
    </Secao>
  );
}
