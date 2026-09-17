import type { PessoaTime, Unidade, VinculoResponsavel } from "./tipos";

/* Union-find: criança + responsáveis vinculados, transitivamente, viram uma unidade inseparável. */
export function montarUnidades(pessoas: PessoaTime[], vinculos: VinculoResponsavel[]): Unidade[] {
  const pai = new Map<string, string>();
  const achar = (x: string): string => {
    const p = pai.get(x) ?? x;
    if (p === x) return x;
    const raiz = achar(p);
    pai.set(x, raiz);
    return raiz;
  };
  const unir = (a: string, b: string) => pai.set(achar(a), achar(b));

  const ids = new Set(pessoas.map((p) => p.id));
  for (const v of vinculos) {
    if (ids.has(v.criancaId) && ids.has(v.responsavelId)) unir(v.criancaId, v.responsavelId);
  }

  const grupos = new Map<string, PessoaTime[]>();
  for (const p of pessoas) {
    const raiz = achar(p.id);
    grupos.set(raiz, [...(grupos.get(raiz) ?? []), p]);
  }
  return [...grupos.values()].map((membros) => ({
    membros,
    familias: new Set(membros.flatMap((m) => (m.familiaId ? [m.familiaId] : []))),
  }));
}

/* Irmãos na mesma unidade não podem ser separados: conflito a resolver pelo administrador. */
export function conflitosDeIrmaos(unidades: Unidade[]): PessoaTime[][] {
  const conflitos: PessoaTime[][] = [];
  for (const u of unidades) {
    const porFamilia = new Map<string, PessoaTime[]>();
    for (const m of u.membros) {
      if (!m.familiaId) continue;
      porFamilia.set(m.familiaId, [...(porFamilia.get(m.familiaId) ?? []), m]);
    }
    for (const irmaos of porFamilia.values()) if (irmaos.length > 1) conflitos.push(irmaos);
  }
  return conflitos;
}

export function saoIrmaos(a: PessoaTime, b: PessoaTime): boolean {
  return Boolean(a.familiaId) && a.familiaId === b.familiaId && a.id !== b.id;
}
