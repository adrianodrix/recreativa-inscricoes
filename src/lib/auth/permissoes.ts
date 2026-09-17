/* Matriz de permissões do painel. Pura: usada na UI (esconder botões) e nas Server Actions. */
export type Perfil = "analitico" | "operador" | "administrador";

export type Acao =
  | "ver"
  | "editar_evento"
  | "editar_brincadeira"
  | "editar_pagina_inicial"
  | "mudar_status"
  | "editar_inscrito"
  | "reenviar_whatsapp"
  | "gerir_times"
  | "gerir_usuarios";

const PERMISSOES: Record<Perfil, ReadonlySet<Acao>> = {
  analitico: new Set<Acao>(["ver"]),
  operador: new Set<Acao>(["ver", "editar_inscrito", "reenviar_whatsapp"]),
  administrador: new Set<Acao>([
    "ver",
    "editar_evento",
    "editar_brincadeira",
    "editar_pagina_inicial",
    "mudar_status",
    "editar_inscrito",
    "reenviar_whatsapp",
    "gerir_times",
    "gerir_usuarios",
  ]),
};

export function pode(perfil: Perfil | null | undefined, acao: Acao): boolean {
  if (!perfil) return false;
  return PERMISSOES[perfil].has(acao);
}

export const ROTULO_PERFIL: Record<Perfil, string> = {
  analitico: "Analítico",
  operador: "Operador",
  administrador: "Administrador",
};
