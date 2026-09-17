import type { Metadata, Viewport } from "next";
import { Baloo_2, Caveat, Inter } from "next/font/google";
import "./globals.css";
import { Tema } from "@/components/marca/Tema";
import { urlDoSite } from "@/lib/seo/metadados";

const baloo = Baloo_2({
  subsets: ["latin"],
  variable: "--font-baloo",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

/* Manuscrita de detalhe, usada com moderação: sem preload, só baixa quando aparece. */
const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: urlDoSite(),
  title: {
    default: "Recreativa · Inscrições",
    template: "%s · Recreativa",
  },
  description: "Inscrições para a Recreativa: um dia de brincadeiras e conexão para famílias, jovens e crianças.",
  applicationName: "Recreativa",
  openGraph: { siteName: "Recreativa", locale: "pt_BR", type: "website" },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#37157b",
};

/* Aplica o tema antes da primeira pintura, como recomenda branding/theme-dark.css. */
const scriptTema = `try{var t=localStorage.getItem("theme")||(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${baloo.variable} ${inter.variable} ${caveat.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: scriptTema }} />
      </head>
      <body>
        <Tema />
        {children}
      </body>
    </html>
  );
}
