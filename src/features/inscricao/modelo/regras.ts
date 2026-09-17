import { calcularIdade, dataIsoValida } from "@/lib/pessoas/idade";
import type {
  BrincadeiraPublica,
  Categoria,
  EventoPublico,
  InscricaoDraft,
  Parceiro,
  Participacao,
  PessoaKey,
  PessoaResolvida,
} from "./tipos";

export function idadeNoEvento(nascimento: string, evento: EventoPublico): number | null {
  if (!dataIsoValida(nascimento)) return null;
  return calcularIdade(nascimento, evento.data_evento);
}

export function conjugeCadastrado(d: InscricaoDraft): boolean {
  return Boolean(d.principal.casado && d.conjugeOpcao === "sim" && d.conjuge?.nome && d.conjuge.nascimento);
}

export function filhosCadastrados(d: InscricaoDraft): boolean {
  return Boolean(d.principal.casado && d.temFilhosMenores && d.filhosOpcao === "sim" && d.filhos.length > 0);
}

/* Pessoas que vão virar inscritos, com idade na data do evento. */
export function pessoasDoDraft(d: InscricaoDraft, evento: EventoPublico): PessoaResolvida[] {
  const lista: PessoaResolvida[] = [];
  const idadePrincipal = idadeNoEvento(d.principal.nascimento, evento);
  if (idadePrincipal === null) return lista;
  const casado = Boolean(d.principal.casado);
  lista.push({ key: "principal", nome: d.principal.nome, idade: idadePrincipal, casado, vinculo: "principal" });

  if (conjugeCadastrado(d) && d.conjuge) {
    const idade = idadeNoEvento(d.conjuge.nascimento, evento);
    if (idade !== null) lista.push({ key: "conjuge", nome: d.conjuge.nome, idade, casado: true, vinculo: "conjuge" });
  }
  if (filhosCadastrados(d)) {
    d.filhos.forEach((f, i) => {
      const idade = idadeNoEvento(f.nascimento, evento);
      if (idade !== null) lista.push({ key: `filho:${i}`, nome: f.nome, idade, casado: false, vinculo: "filho" });
    });
  }
  return lista;
}

export function pessoaPorKey(d: InscricaoDraft, evento: EventoPublico, key: PessoaKey): PessoaResolvida | undefined {
  return pessoasDoDraft(d, evento).find((p) => p.key === key);
}

/* Espelho de public.categoria_elegivel (B5). */
export function categoriaElegivel(idade: number, casado: boolean, categoria: Categoria): boolean {
  switch (categoria) {
    case "criancas":
      return idade <= 8;
    case "jovens":
      return !casado && idade >= 9 && idade <= 30;
    case "casais":
      return casado;
    case "pais_e_filhos":
      return true;
  }
}

export function brincadeirasIndividuais(pessoa: PessoaResolvida, evento: EventoPublico): BrincadeiraPublica[] {
  return evento.brincadeiras.filter(
    (b) => (b.categoria === "criancas" || b.categoria === "jovens") && categoriaElegivel(pessoa.idade, pessoa.casado, b.categoria),
  );
}

/* Casais só quando o cônjuge foi cadastrado no mesmo fluxo. */
export function brincadeirasCasal(d: InscricaoDraft, evento: EventoPublico): BrincadeiraPublica[] {
  if (!conjugeCadastrado(d)) return [];
  return evento.brincadeiras.filter((b) => b.categoria === "casais");
}

export function brincadeirasPaisFilhos(d: InscricaoDraft, evento: EventoPublico): BrincadeiraPublica[] {
  if (!filhosCadastrados(d)) return [];
  return evento.brincadeiras.filter((b) => b.categoria === "pais_e_filhos");
}

export function pessoasComComida(d: InscricaoDraft, evento: EventoPublico): PessoaResolvida[] {
  const haComida = Object.values(evento.comida_disponivel).some((n) => n > 0);
  if (!haComida) return [];
  return pessoasDoDraft(d, evento).filter((p) => p.idade > 12);
}

export function temParticipacao(d: InscricaoDraft): boolean {
  return d.participacoes.length > 0;
}

export function duplaDoFilho(d: InscricaoDraft, brincadeiraId: string, filho: PessoaKey): Parceiro | undefined {
  const p = d.participacoes.find((x) => "filho" in x && x.brincadeiraId === brincadeiraId && x.filho === filho);
  return p && "filho" in p ? p.parceiro : undefined;
}

/* Quem já é parceiro de outro filho nesta brincadeira (um parceiro por dupla, B6/T14). */
function parceirosOcupados(d: InscricaoDraft, brincadeiraId: string, exceto: PessoaKey): Parceiro[] {
  return d.participacoes
    .filter((p): p is Extract<Participacao, { filho: PessoaKey }> => "filho" in p && p.brincadeiraId === brincadeiraId && p.filho !== exceto)
    .map((p) => p.parceiro);
}

export function paiMaeDisponivel(d: InscricaoDraft, brincadeiraId: string, filho: PessoaKey, pessoa: "principal" | "conjuge"): boolean {
  if (pessoa === "conjuge" && !conjugeCadastrado(d)) return false;
  return !parceirosOcupados(d, brincadeiraId, filho).some((p) => p.tipo === "pai_mae" && p.pessoa === pessoa);
}

/*
 * T14: um responsável fica no time da criança; irmãos ficam em times diferentes.
 * Logo o mesmo jovem não pode ser responsável de dois irmãos, em nenhuma brincadeira.
 */
export function responsavelBloqueado(d: InscricaoDraft, inscritoId: string, filho: PessoaKey): boolean {
  return d.participacoes.some(
    (p) => "filho" in p && p.filho !== filho && p.parceiro.tipo === "responsavel" && p.parceiro.inscritoId === inscritoId,
  );
}

export function papelDe(d: InscricaoDraft, pessoa: "principal" | "conjuge"): "pai" | "mae" {
  const principal = d.papelPrincipal ?? "pai";
  if (pessoa === "principal") return principal;
  return principal === "pai" ? "mae" : "pai";
}
