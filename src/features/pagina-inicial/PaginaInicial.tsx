import { faseDaPagina } from "@/lib/pagina-inicial/fase";
import { Destaque } from "./secoes/Destaque";
import { Brincadeiras, Duvidas, Fotos, Texto, Times } from "./secoes/Listas";
import { Numeros } from "./secoes/Numeros";
import { Programacao } from "./secoes/Programacao";
import { Rodape } from "./secoes/Rodape";
import { Topo, type Ancora } from "./secoes/Topo";
import type { DadosPaginaInicial } from "./tipos";
import styles from "./pagina-inicial.module.css";

/*
 * Página do evento em destaque (P1–P12). Só Server Components: o menu do
 * celular e as dúvidas abrem com <details>, sem JavaScript no cliente.
 * A mesma composição serve à "/" e à prévia do painel.
 */
export function PaginaInicial({ dados }: { dados: DadosPaginaInicial }) {
  const { evento, programacao, perguntas, contatos, times, brincadeiras } = dados;
  const fase = faseDaPagina(evento);

  const ancoras: Ancora[] = [
    programacao.length > 0 && { id: "programacao", rotulo: "Programação" },
    evento.recomendacoes && { id: "antes-de-vir", rotulo: "Antes de vir" },
    evento.regras_gerais && { id: "regras", rotulo: "Regras" },
    brincadeiras.length > 0 && { id: "brincadeiras", rotulo: "Brincadeiras" },
    times.length > 1 && { id: "times", rotulo: "Equipes" },
    perguntas.length > 0 && { id: "duvidas", rotulo: "Dúvidas" },
    evento.link_fotos && { id: "fotos", rotulo: "Fotos" },
  ].filter((a): a is Ancora => Boolean(a));

  const inscricao =
    fase.fase === "abertas" ? { href: `/${evento.slug}`, rotulo: "Me inscrever" } : null;

  return (
    <>
      <Topo ancoras={ancoras} inscricao={inscricao} />
      <main className={styles.pagina}>
        <Destaque evento={evento} times={times} fase={fase} />
        <Numeros evento={evento} times={times.length} />
        <Programacao itens={programacao} />
        <Texto id="antes-de-vir" titulo="Antes de vir, já separa" doc={evento.recomendacoes} />
        <Texto id="regras" titulo="Regras e orientações" doc={evento.regras_gerais} />
        <Brincadeiras itens={brincadeiras} />
        <Times itens={times} />
        <Duvidas itens={perguntas} />
        <Fotos link={evento.link_fotos} />
      </main>
      <Rodape evento={evento} contatos={contatos} ancoras={ancoras} />
    </>
  );
}
