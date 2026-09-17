/* Cor e ícone padrão de um time sem imagem (T16), escolhidos pela ordem. */
export const PALETA_TIMES: ReadonlyArray<{ cor: string; icone: string; nome: string }> = [
  { cor: "#ff8a4a", icone: "sun", nome: "Laranja" },
  { cor: "#6d5ba2", icone: "moon", nome: "Roxo" },
  { cor: "#137738", icone: "leaf", nome: "Verde" },
  { cor: "#2266a4", icone: "waves", nome: "Azul" },
  { cor: "#b02b27", icone: "flame", nome: "Vermelho" },
  { cor: "#915b00", icone: "mountain", nome: "Âmbar" },
  { cor: "#3e2076", icone: "star", nome: "Índigo" },
  { cor: "#e6793c", icone: "zap", nome: "Coral" },
];

export function paletaPorOrdem(ordem: number) {
  return PALETA_TIMES[((ordem % PALETA_TIMES.length) + PALETA_TIMES.length) % PALETA_TIMES.length];
}
