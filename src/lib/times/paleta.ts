/* Cor e ícone padrão de um time sem imagem (T16), escolhidos pela ordem.
   Os 4 primeiros seguem as equipes das artes (laranja, roxo, azul, verde);
   todas em tons dos tokens com ícone branco legível (≥ 3:1). */
export const PALETA_TIMES: ReadonlyArray<{ cor: string; icone: string; nome: string }> = [
  { cor: "#c5652d", icone: "sun", nome: "Laranja" },
  { cor: "#7a4fd1", icone: "moon", nome: "Roxo" },
  { cor: "#2266a4", icone: "waves", nome: "Azul" },
  { cor: "#2e8f3a", icone: "leaf", nome: "Verde" },
  { cor: "#b02b27", icone: "flame", nome: "Vermelho" },
  { cor: "#915b00", icone: "mountain", nome: "Âmbar" },
  { cor: "#37157b", icone: "star", nome: "Índigo" },
  { cor: "#a2447a", icone: "zap", nome: "Rosa" },
];

export function paletaPorOrdem(ordem: number) {
  return PALETA_TIMES[((ordem % PALETA_TIMES.length) + PALETA_TIMES.length) % PALETA_TIMES.length];
}
