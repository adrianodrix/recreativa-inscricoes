import { networkInterfaces } from "node:os";
import type { NextConfig } from "next";

/*
 * Em desenvolvimento o Next bloqueia /_next/* quando a página é aberta por outro
 * host (ex.: o celular na mesma Wi-Fi via http://192.168.x.x:3000). Libera os IPs
 * desta máquina, então testar no aparelho funciona sem configurar nada.
 */
const ipsLocais: string[] = [];
for (const interfaces of Object.values(networkInterfaces())) {
  for (const i of interfaces ?? []) if (i.family === "IPv4" && !i.internal) ipsLocais.push(i.address);
}

const nextConfig: NextConfig = {
  allowedDevOrigins: ipsLocais,
  /*
   * As imagens de prévia leem fontes e logo do kit em tempo de execução. Como o
   * caminho é montado em variável, o rastreio automático não os enxerga: aqui
   * garantimos que vão junto no deploy.
   */
  outputFileTracingIncludes: {
    "/opengraph-image": ["./branding/assets/fontes/**", "./branding/assets/logo-recreativa-horizontal-laranja.png"],
    "/twitter-image": ["./branding/assets/fontes/**", "./branding/assets/logo-recreativa-horizontal-laranja.png"],
    "/[slug]/opengraph-image": ["./branding/assets/fontes/**", "./branding/assets/logo-recreativa-horizontal-laranja.png"],
    "/[slug]/twitter-image": ["./branding/assets/fontes/**", "./branding/assets/logo-recreativa-horizontal-laranja.png"],
  },
  images: {
    /*
     * Em desenvolvimento o Supabase serve as imagens em 127.0.0.1 e o Next 16
     * bloqueia otimizar IP local (responde 400). Em produção o host é
     * *.supabase.co, então a liberação vale só aqui.
     */
    dangerouslyAllowLocalIP: process.env.NODE_ENV === "development",
    remotePatterns: [
      { protocol: "http", hostname: "127.0.0.1", port: "54321", pathname: "/storage/v1/object/public/**" },
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
      { protocol: "https", hostname: "i.ytimg.com" },
    ],
  },
};

export default nextConfig;
