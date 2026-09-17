/* Tipos de comida/bebida (E7). Sem dependências: usado no formulário público. */
export const TIPOS_COMIDA = ["salgado", "doce", "refrigerante", "suco"] as const;
export type TipoComida = (typeof TIPOS_COMIDA)[number];
export const ROTULO_COMIDA: Record<TipoComida, string> = {
  salgado: "Salgado",
  doce: "Doce",
  refrigerante: "Refrigerante",
  suco: "Suco",
};
