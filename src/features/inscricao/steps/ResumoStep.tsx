"use client";

import { LoaderCircle, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { enviarInscricao } from "@/app/(publico)/[slug]/actions";
import { Alerta } from "@/components/formulario/Alerta";
import { ROTULO_COMIDA } from "@/lib/eventos/schema";
import { formatarData, formatarValor } from "@/lib/datas";
import { useInscricao } from "../estado/InscricaoProvider";
import { limparRascunho } from "../estado/useRascunho";
import { etapaDoErro, mensagemDoErro } from "../modelo/erros";
import { montarPayload } from "../modelo/payload";
import { pessoasDoDraft } from "../modelo/regras";
import { formatarWhatsapp } from "../modelo/schemas";
import { StepShell } from "../ui/StepShell";
import styles from "../ui/formulario.module.css";

export function ResumoStep() {
  const { estado, evento, etapas, irPara, dispatch } = useInscricao();
  const d = estado.draft;
  const router = useRouter();
  const [enviando, iniciar] = useTransition();
  const [erroGeral, setErroGeral] = useState<string>();
  const pessoas = pessoasDoDraft(d, evento);
  const brincadeiraNome = (id: string) => evento.brincadeiras.find((b) => b.id === id)?.nome ?? "Brincadeira";
  const nomeDe = (key: string) => pessoas.find((p) => p.key === key)?.nome ?? "";

  function enviar() {
    setErroGeral(undefined);
    iniciar(async () => {
      const resultado = await enviarInscricao(montarPayload(d, evento));
      if (resultado.ok) {
        limparRascunho(evento.id);
        router.push(`/${evento.slug}/obrigado`);
        return;
      }
      const etapaId = etapaDoErro(resultado.erro, etapas);
      const mensagem = mensagemDoErro(resultado.erro);
      if (etapaId === "resumo") setErroGeral(mensagem);
      else dispatch({ tipo: "ERRO_SERVIDOR", etapaId, mensagem });
      router.refresh();
    });
  }

  return (
    <StepShell titulo="Confira antes de confirmar" descricao="Depois de confirmar, só os organizadores podem alterar." rotuloAvancar={enviando ? "Enviando…" : "Confirmar inscrição"} onAvancar={() => !enviando && enviar()}>
      <ul className={styles.resumoLista}>
        <li className={styles.resumoItem}>
          <div className={styles.resumoLinha}>
            <span className={styles.resumoRotulo}>Você</span>
            <BotaoEditar aoClicar={() => irPara("nome")} />
          </div>
          <strong>{d.principal.nome}</strong>
          <span>
            {d.principal.apelido ? `“${d.principal.apelido}” · ` : ""}
            {formatarData(d.principal.nascimento)} · {d.principal.casado ? "casado(a)" : "solteiro(a)"}
          </span>
        </li>
        {pessoas.filter((p) => p.key !== "principal").map((p) => (
          <li key={p.key} className={styles.resumoItem}>
            <div className={styles.resumoLinha}>
              <span className={styles.resumoRotulo}>{p.vinculo === "conjuge" ? "Cônjuge" : "Filho(a)"}</span>
              <BotaoEditar aoClicar={() => irPara(p.key === "conjuge" ? "conjuge_dados" : `filho_dados:${p.key.split(":")[1]}`)} />
            </div>
            <strong>{p.nome}</strong>
            <span>{p.idade} anos no dia do evento</span>
          </li>
        ))}
        {Object.keys(d.comida).length > 0 && (
          <li className={styles.resumoItem}>
            <span className={styles.resumoRotulo}>Comida e bebida</span>
            {pessoas.filter((p) => d.comida[p.key]).map((p) => (
              <div key={p.key} className={styles.resumoLinha}>
                <span>{p.nome}: {ROTULO_COMIDA[d.comida[p.key]!]}</span>
                <BotaoEditar aoClicar={() => irPara(`comida:${p.key}`)} />
              </div>
            ))}
          </li>
        )}
        <li className={styles.resumoItem}>
          <span className={styles.resumoRotulo}>Brincadeiras</span>
          {d.participacoes.length === 0 && <span>Nenhuma brincadeira escolhida.</span>}
          {d.participacoes.map((p, i) => (
            <div key={i} className={styles.resumoLinha}>
              <span>
                {"casal" in p && `Casal: ${brincadeiraNome(p.brincadeiraId)}`}
                {"pessoa" in p && `${nomeDe(p.pessoa)}: ${brincadeiraNome(p.brincadeiraId)}`}
                {"filho" in p && `${nomeDe(p.filho)} + ${p.parceiro.tipo === "pai_mae" ? nomeDe(p.parceiro.pessoa) : p.parceiro.nome}: ${brincadeiraNome(p.brincadeiraId)}`}
              </span>
              <BotaoEditar aoClicar={() => irPara("casal" in p ? `casal:${p.brincadeiraId}` : "pessoa" in p ? `brincadeira:${p.brincadeiraId}:${p.pessoa}` : `pais_filhos:${p.brincadeiraId}`)} />
            </div>
          ))}
        </li>
        {d.whatsapp && d.participacoes.length > 0 && (
          <li className={styles.resumoItem}>
            <div className={styles.resumoLinha}>
              <span className={styles.resumoRotulo}>WhatsApp</span>
              <BotaoEditar aoClicar={() => irPara("whatsapp")} />
            </div>
            <strong>{formatarWhatsapp(d.whatsapp)}</strong>
          </li>
        )}
        {evento.valor_inscricao > 0 && (
          <li className={styles.resumoItem}>
            <span className={styles.resumoRotulo}>Valor da inscrição</span>
            <strong>{formatarValor(evento.valor_inscricao)} por pessoa (pagamento combinado com os organizadores)</strong>
          </li>
        )}
      </ul>
      {erroGeral && <Alerta tipo="danger">{erroGeral}</Alerta>}
      {enviando && (
        <p className="rc-hint">
          <LoaderCircle className="rc-icon rc-icon--sm" aria-hidden="true" /> Enviando sua inscrição…
        </p>
      )}
    </StepShell>
  );
}

function BotaoEditar({ aoClicar }: { aoClicar: () => void }) {
  return (
    <button type="button" className="rc-btn rc-btn--sm" onClick={aoClicar}>
      <Pencil className="rc-icon rc-icon--sm" aria-hidden="true" /> Editar
    </button>
  );
}
