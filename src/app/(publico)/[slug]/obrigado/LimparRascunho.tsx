"use client";

import { useEffect } from "react";
import { limparRascunho } from "@/features/inscricao/estado/useRascunho";

export function LimparRascunho({ eventoId }: { eventoId: string }) {
  useEffect(() => limparRascunho(eventoId), [eventoId]);
  return null;
}
