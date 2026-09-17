"use client";

import { LoaderCircle, Search } from "lucide-react";
import { useEffect, useId, useState } from "react";

export interface PessoaEncontrada {
  id: string;
  nome_completo: string;
  apelido: string | null;
}

interface Props {
  buscar: (termo: string) => Promise<PessoaEncontrada[]>;
  bloqueados: string[];
  aoEscolher: (pessoa: PessoaEncontrada) => void;
}

/* Busca de responsável por nome (mínimo 3 letras), sem listar todos os jovens. */
export function PersonSearch({ buscar, bloqueados, aoEscolher }: Props) {
  const id = useId();
  const [termo, setTermo] = useState("");
  const [resultados, setResultados] = useState<PessoaEncontrada[]>([]);
  const [buscando, setBuscando] = useState(false);
  const termoValido = termo.trim().length >= 3;

  useEffect(() => {
    if (!termoValido) return;
    let ativo = true;
    const t = window.setTimeout(async () => {
      setBuscando(true);
      try {
        const lista = await buscar(termo.trim());
        if (ativo) setResultados(lista);
      } finally {
        if (ativo) setBuscando(false);
      }
    }, 300);
    return () => {
      ativo = false;
      window.clearTimeout(t);
    };
  }, [termo, termoValido, buscar]);
  const visiveis = termoValido ? resultados.filter((p) => !bloqueados.includes(p.id)) : [];

  return (
    <div className="rc-field">
      <label className="rc-label" htmlFor={id}>
        Nome do responsável (jovem já inscrito)
      </label>
      <input
        id={id}
        className="rc-input"
        role="combobox"
        aria-expanded={visiveis.length > 0}
        aria-controls={`${id}-lista`}
        aria-autocomplete="list"
        autoComplete="off"
        placeholder="Digite pelo menos 3 letras"
        value={termo}
        onChange={(e) => setTermo(e.target.value)}
      />
      {buscando && (
        <p className="rc-hint">
          <LoaderCircle className="rc-icon rc-icon--sm" aria-hidden="true" /> Buscando…
        </p>
      )}
      {termoValido && !buscando && visiveis.length === 0 && <p className="rc-hint">Ninguém encontrado com esse nome.</p>}
      {visiveis.length > 0 && (
        <ul id={`${id}-lista`} role="listbox" style={{ display: "grid", gap: "var(--spacing-2)", margin: 0, padding: 0, listStyle: "none" }}>
          {visiveis.map((p) => (
            <li key={p.id} role="option" aria-selected={false}>
              <button type="button" className="rc-btn rc-btn--block rc-btn--secondary" onClick={() => aoEscolher(p)}>
                <Search className="rc-icon" aria-hidden="true" />
                {p.nome_completo}
                {p.apelido ? ` (${p.apelido})` : ""}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
