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
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "127.0.0.1", port: "54321", pathname: "/storage/v1/object/public/**" },
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
      { protocol: "https", hostname: "i.ytimg.com" },
    ],
  },
};

export default nextConfig;
