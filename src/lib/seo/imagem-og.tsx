import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

/*
 * Imagem de prévia do link (WhatsApp, Facebook, X), montada por evento:
 * degradê da marca, logo e os dados do dia. As fontes vêm do kit em arquivo,
 * porque o next/og desenha a imagem no servidor, sem navegador.
 */

export const TAMANHO_OG = { width: 1200, height: 630 };
export const TIPO_OG = "image/png";

const doKit = (arquivo: string) => readFile(join(process.cwd(), "branding", "assets", arquivo));

const [baloo, inter, logo] = await Promise.all([
  doKit("fontes/Baloo2-ExtraBold.ttf"),
  doKit("fontes/Inter-Medium.ttf"),
  doKit("logo-recreativa-horizontal-laranja.png"),
]);

const FUNDO =
  "radial-gradient(120% 90% at 15% 0%, #7a4fd1 0%, transparent 55%), linear-gradient(155deg, #200d49 0%, #37157b 42%, #a2447a 72%, #ff9560 100%)";

interface Entrada {
  titulo: string;
  /* Linha de cima, curta: subtítulo do evento. */
  chamada?: string | null;
  /* Linha de baixo: data, horário e local. */
  rodape?: string | null;
}

export function imagemOg({ titulo, chamada, rodape }: Entrada): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: FUNDO,
          fontFamily: "Inter",
          color: "#f3ecfa",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`data:image/png;base64,${logo.toString("base64")}`} width={360} alt="" />

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {chamada && <span style={{ fontSize: 34, color: "#ffc49c" }}>{chamada}</span>}
          <span style={{ fontFamily: "Baloo", fontSize: 92, lineHeight: 1.05, color: "#fff7f0" }}>{titulo}</span>
        </div>

        {rodape && <span style={{ fontSize: 34 }}>{rodape}</span>}
      </div>
    ),
    {
      ...TAMANHO_OG,
      fonts: [
        { name: "Baloo", data: baloo, weight: 800, style: "normal" },
        { name: "Inter", data: inter, weight: 500, style: "normal" },
      ],
    },
  );
}
