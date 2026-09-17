import { Flame, Leaf, Moon, Mountain, Star, Sun, Waves, Zap } from "lucide-react";
import Image from "next/image";
import { urlImagem } from "@/lib/storage/url";

const ICONES = { sun: Sun, moon: Moon, leaf: Leaf, waves: Waves, flame: Flame, mountain: Mountain, star: Star, zap: Zap } as const;

interface Props {
  imagemPath: string | null;
  cor: string;
  icone: string;
  tamanho?: number;
}

/* Imagem do time ou, sem upload, o ícone colorido padrão (T16). */
export function IconeTime({ imagemPath, cor, icone, tamanho = 40 }: Props) {
  const url = urlImagem(imagemPath);
  if (url) {
    return <Image src={url} alt="" width={tamanho} height={tamanho} style={{ width: tamanho, height: tamanho, borderRadius: "var(--radius-full)", objectFit: "cover" }} />;
  }
  const Icone = ICONES[icone as keyof typeof ICONES] ?? Star;
  return (
    <span aria-hidden="true" style={{ display: "inline-grid", placeItems: "center", width: tamanho, height: tamanho, borderRadius: "var(--radius-full)", background: cor, color: "#fff" }}>
      <Icone className="rc-icon" />
    </span>
  );
}
