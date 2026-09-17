"use client";

import { useActionState } from "react";
import { Alerta } from "@/components/formulario/Alerta";
import { BotaoEnviar } from "@/components/formulario/BotaoEnviar";
import { CampoTexto } from "@/components/formulario/CampoTexto";
import type { ContatoLinha } from "@/lib/pagina-inicial/consultas";
import { formatarWhatsapp } from "@/lib/pessoas/whatsapp";
import { salvarContato, type EstadoFormContato } from "./actions";
import styles from "../../../painel.module.css";

interface Props {
  eventoId: string;
  contato: ContatoLinha | null;
}

/* Quem as famílias procuram no rodapé da página inicial. */
export function FormularioContato({ eventoId, contato }: Props) {
  const acao = salvarContato.bind(null, eventoId, contato?.id ?? null);
  const [estado, enviar] = useActionState<EstadoFormContato, FormData>(acao, {});
  const e = estado.erros ?? {};

  return (
    <form action={enviar} className={styles.formulario} noValidate>
      <section className={styles.secao}>
        <CampoTexto id="nome" name="nome" rotulo="Nome" ajuda="Como aparece na página. Ex.: Moisés." defaultValue={contato?.nome} erro={e.nome} required />
        <CampoTexto
          id="whatsapp"
          name="whatsapp"
          type="tel"
          inputMode="tel"
          rotulo="WhatsApp"
          ajuda="Com DDD. O número fica visível na página e abre a conversa."
          defaultValue={contato ? formatarWhatsapp(contato.whatsapp) : undefined}
          erro={e.whatsapp}
          required
        />
      </section>

      {estado.erro && <Alerta tipo="danger">{estado.erro}</Alerta>}
      <div className={styles.acoes}>
        <BotaoEnviar>{contato ? "Salvar alterações" : "Adicionar contato"}</BotaoEnviar>
      </div>
    </form>
  );
}
