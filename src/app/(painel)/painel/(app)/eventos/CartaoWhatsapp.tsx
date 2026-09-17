import { MessageCircle, Play } from "lucide-react";
import { env } from "@/lib/env";
import { pode, type Perfil } from "@/lib/auth/permissoes";
import { resumoFila } from "@/lib/whatsapp/consultas";
import { estadoConexao, whatsappConfigurado } from "@/lib/whatsapp/evolution";
import { processarFilaAction } from "./[id]/whatsapp-actions";
import styles from "../painel.module.css";
import { TituloCartao } from "@/components/painel/TituloCartao";

const ROTULO_ESTADO = { open: "conectado", close: "desconectado", connecting: "conectando", desconhecido: "sem resposta" } as const;

/* Situação da Evolution API e da fila de avisos do evento. */
export async function CartaoWhatsapp({ eventoId, perfil }: { eventoId: string; perfil: Perfil }) {
  const configurado = whatsappConfigurado();
  const [fila, estado] = await Promise.all([resumoFila(eventoId), configurado ? estadoConexao() : Promise.resolve(null)]);
  const ativo = env().WHATSAPP_ENVIO_ATIVO;
  const processar = processarFilaAction.bind(null, eventoId);
  return (
    <article className={`rc-card ${styles.status} ${styles.largura}`}>
      <header className="rc-card__header">
        <TituloCartao icone={MessageCircle}>WhatsApp</TituloCartao>
        {!configurado ? (
          <span className="rc-badge rc-badge--warning">Evolution API não configurada</span>
        ) : !ativo ? (
          <span className="rc-badge rc-badge--info">Envio simulado (WHATSAPP_ENVIO_ATIVO=false)</span>
        ) : (
          <span className={`rc-badge ${estado === "open" ? "rc-badge--success" : "rc-badge--danger"}`}>Instância {ROTULO_ESTADO[estado ?? "desconhecido"]}</span>
        )}
      </header>
      <ul className="rc-card__meta">
        <li>
          <MessageCircle className="rc-icon" aria-hidden="true" />
          {fila.enviado} enviadas · {fila.pendente + fila.enviando} na fila · {fila.falhou} com falha
        </li>
      </ul>
      {pode(perfil, "reenviar_whatsapp") && (
        <footer className="rc-card__footer">
          <span className={styles.statusLinha}>O pg_cron acorda o worker a cada minuto; use o botão para processar agora.</span>
          <form action={processar}>
            <button type="submit" className="rc-btn rc-btn--sm rc-btn--secondary" disabled={fila.pendente + fila.enviando === 0}>
              <Play className="rc-icon" aria-hidden="true" /> Processar fila
            </button>
          </form>
        </footer>
      )}
    </article>
  );
}
