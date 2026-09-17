import Image from "next/image";
import styles from "./Logo.module.css";

type Variante = "auto" | "branco" | "roxo" | "laranja";
type Formato = "empilhada" | "horizontal";

/* Proporção altura/largura dos SVGs do kit (172×90 e 324×43). */
const PROPORCAO: Record<Formato, number> = { empilhada: 90 / 172, horizontal: 43 / 324 };

const arquivo = (formato: Formato, cor: Exclude<Variante, "auto">) => `/marca/logo-recreativa-${formato}-${cor}.svg`;

interface Props {
  variante?: Variante;
  formato?: Formato;
  largura?: number;
  prioridade?: boolean;
  className?: string;
}

/* Logo da Recreativa (SVG do kit). Pelas diretrizes do designer: roxo sobre fundo
   claro, laranja sobre roxo ou escuro, branco sobre fotos e fundos coloridos.
   "auto" usa roxo no tema claro e laranja no escuro. */
export function Logo({ variante = "auto", formato = "empilhada", largura = 192, prioridade, className }: Props) {
  const altura = Math.round(largura * PROPORCAO[formato]);
  const imagem = (cor: Exclude<Variante, "auto">, extra?: string) => (
    <Image
      src={arquivo(formato, cor)}
      alt="Recreativa"
      width={largura}
      height={altura}
      preload={prioridade}
      style={{ width: "100%", height: "auto" }}
      className={`${styles.logo} ${extra ?? ""}`}
    />
  );
  const estilo = { display: "block", width: `${largura}px`, maxWidth: "100%" } as const;
  if (variante !== "auto") return <span className={className} style={estilo}>{imagem(variante)}</span>;
  return (
    <span className={className} style={estilo}>
      {imagem("roxo", styles.claro)}
      {imagem("laranja", styles.escuro)}
    </span>
  );
}
