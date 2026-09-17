import { MessageCircle } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/marca/Logo";
import { formatarDataExtenso } from "@/lib/datas";
import { formatarWhatsapp } from "@/lib/pessoas/whatsapp";
import type { ContatoPublico, EventoDestaque } from "../tipos";
import type { Ancora } from "./Topo";
import styles from "../pagina-inicial.module.css";

interface Props {
  evento: EventoDestaque;
  contatos: ContatoPublico[];
  ancoras: Ancora[];
}

export function Rodape({ evento, contatos, ancoras }: Props) {
  return (
    <footer className={`rc-surface-brand ${styles.rodape}`}>
      <div className={styles.rodapeGrade}>
        <div>
          <Logo variante="laranja" formato="horizontal" largura={150} />
          <p className={styles.rodapeTexto}>
            {evento.subtitulo ?? evento.nome}
            <br />
            {formatarDataExtenso(evento.data_evento)}
            <br />
            {evento.endereco}
          </p>
          <span className={styles.assinatura}>feito com carinho pela comunidade</span>
        </div>

        {ancoras.length > 0 && (
          <nav aria-label="Seções da página">
            <h2 className={styles.rodapeTitulo}>Navegação</h2>
            <ul className={styles.rodapeLinks}>
              {ancoras.map((a) => (
                <li key={a.id}>
                  <a href={`#${a.id}`}>{a.rotulo}</a>
                </li>
              ))}
              <li>
                <Link href={`/${evento.slug}`}>Inscrição</Link>
              </li>
            </ul>
          </nav>
        )}

        {contatos.length > 0 && (
          <div>
            <h2 className={styles.rodapeTitulo}>Fale com a gente</h2>
            <ul className={styles.rodapeLinks}>
              {contatos.map((c) => (
                <li key={c.id}>
                  <a href={`https://wa.me/${c.whatsapp}`} target="_blank" rel="noreferrer" className={styles.contato}>
                    <MessageCircle className="rc-icon" aria-hidden="true" />
                    <span>
                      <strong>{c.nome}</strong>
                      <small>{formatarWhatsapp(c.whatsapp)}</small>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </footer>
  );
}
