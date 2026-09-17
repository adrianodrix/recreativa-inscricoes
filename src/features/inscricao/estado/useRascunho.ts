"use client";

import { useEffect, useRef, useSyncExternalStore, type Dispatch } from "react";
import { montarEtapas } from "../modelo/etapas";
import type { AcaoFormulario, EstadoFormulario } from "../modelo/reducer";
import type { EventoPublico } from "../modelo/tipos";

const VERSAO = 1;
const VALIDADE_MS = 24 * 60 * 60 * 1000;

interface Salvo {
  versao: number;
  salvoEm: number;
  estado: EstadoFormulario;
}

function chave(eventoId: string): string {
  return `recreativa:inscricao:${eventoId}`;
}

function lerSalvo(eventoId: string): Salvo | null {
  try {
    const bruto = localStorage.getItem(chave(eventoId));
    if (!bruto) return null;
    const salvo = JSON.parse(bruto) as Salvo;
    if (salvo.versao !== VERSAO || Date.now() - salvo.salvoEm >= VALIDADE_MS) return null;
    return salvo;
  } catch {
    return null;
  }
}

/* "pronto" vira true só no cliente, depois da hidratação (evita mismatch de SSR). */
const assinarNada = () => () => {};

/* Guarda o rascunho no aparelho (alternar para o WhatsApp descarta a aba no celular). */
export function useRascunho(evento: EventoPublico, estado: EstadoFormulario, dispatch: Dispatch<AcaoFormulario>) {
  const pronto = useSyncExternalStore(assinarNada, () => true, () => false);
  const hidratou = useRef(false);
  const temporizador = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (hidratou.current) return;
    hidratou.current = true;
    const salvo = lerSalvo(evento.id);
    if (!salvo) return;
    const etapas = montarEtapas(salvo.estado.draft, evento);
    const existe = etapas.some((e) => e.id === salvo.estado.etapaAtualId);
    dispatch({
      tipo: "HIDRATAR",
      estado: { ...salvo.estado, etapaAtualId: existe ? salvo.estado.etapaAtualId : etapas[0].id, errosServidor: {} },
    });
  }, [evento, dispatch]);

  useEffect(() => {
    if (!pronto || !hidratou.current) return;
    window.clearTimeout(temporizador.current);
    temporizador.current = window.setTimeout(() => {
      try {
        const salvo: Salvo = { versao: VERSAO, salvoEm: Date.now(), estado };
        localStorage.setItem(chave(evento.id), JSON.stringify(salvo));
      } catch {
        // sem armazenamento: segue sem rascunho
      }
    }, 300);
    return () => window.clearTimeout(temporizador.current);
  }, [estado, evento.id, pronto]);

  return { pronto };
}

export function limparRascunho(eventoId: string) {
  try {
    localStorage.removeItem(chave(eventoId));
  } catch {
    // ignora
  }
}
