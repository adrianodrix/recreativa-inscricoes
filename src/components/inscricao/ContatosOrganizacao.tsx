import { MessageCircle } from "lucide-react";
import type { ContatoEvento } from "@/features/inscricao/modelo/tipos";
import { formatarWhatsapp } from "@/lib/pessoas/whatsapp";
import styles from "./contatos.module.css";

/* Botões de WhatsApp da organização do evento (cadastrados em Contatos, no painel). */
export function ContatosOrganizacao({ contatos }: { contatos: ContatoEvento[] }) {
  if (contatos.length === 0) return null;
  return (
    <ul className={styles.lista}>
      {contatos.map((c) => (
        <li key={c.id}>
          <a href={`https://wa.me/${c.whatsapp}`} target="_blank" rel="noreferrer" className="rc-btn rc-btn--secondary rc-btn--block">
            <MessageCircle className="rc-icon" aria-hidden="true" />
            {c.nome} · <span className={styles.numero}>{formatarWhatsapp(c.whatsapp)}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
