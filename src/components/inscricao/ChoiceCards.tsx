export interface Opcao<V extends string> {
  valor: V;
  rotulo: string;
  descricao?: string;
  desabilitada?: boolean;
}

interface Props<V extends string> {
  nome: string;
  opcoes: ReadonlyArray<Opcao<V>>;
  valor?: V;
  aoEscolher: (valor: V) => void;
}

/* Opções em cartão (rc-choice--card), uma por linha, com animação escalonada. */
export function ChoiceCards<V extends string>({ nome, opcoes, valor, aoEscolher }: Props<V>) {
  return (
    <div role="radiogroup" style={{ display: "grid", gap: "var(--spacing-3)" }}>
      {opcoes.map((opcao, i) => (
        <label key={opcao.valor} className="rc-choice rc-choice--card campo-anima" style={{ "--i": i } as React.CSSProperties}>
          <input
            type="radio"
            name={nome}
            value={opcao.valor}
            checked={valor === opcao.valor}
            disabled={opcao.desabilitada}
            onChange={() => aoEscolher(opcao.valor)}
          />
          <span>
            {opcao.rotulo}
            {opcao.descricao && <span className="rc-choice__hint">{opcao.descricao}</span>}
          </span>
        </label>
      ))}
    </div>
  );
}
