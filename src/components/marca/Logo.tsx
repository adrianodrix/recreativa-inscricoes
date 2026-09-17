import Image from "next/image";
import styles from "./Logo.module.css";

type Variante = "auto" | "branco" | "roxo" | "laranja";

const ARQUIVO: Record<Exclude<Variante, "auto">, string> = {
  branco: "/marca/logo-recreativa-branco.svg",
  roxo: "/marca/logo-recreativa-roxo.svg",
  laranja: "/marca/logo-recreativa.svg",
};

interface Props {
  variante?: Variante;
  largura?: number;
  prioridade?: boolean;
  className?: string;
}

/* Logo da Recreativa (SVG do kit). "auto" usa roxo no claro e branco no escuro. */
export function Logo({ variante = "auto", largura = 192, prioridade, className }: Props) {
  const altura = Math.round(largura * 0.594);
  const imagem = (arquivo: string, extra?: string) => (
    <Image
      src={arquivo}
      alt="Recreativa"
      width={largura}
      height={altura}
      priority={prioridade}
      style={{ width: "100%", height: "auto" }}
      className={`${styles.logo} ${extra ?? ""}`}
    />
  );
  if (variante !== "auto") return <span className={className}>{imagem(ARQUIVO[variante])}</span>;
  return (
    <span className={className}>
      {imagem(ARQUIVO.roxo, styles.claro)}
      {imagem(ARQUIVO.branco, styles.escuro)}
    </span>
  );
}
