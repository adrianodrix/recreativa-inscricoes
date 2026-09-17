"use client";

import { useEffect } from "react";

/*
 * Reforço do script inline do layout raiz: quando o documento é remontado pelo
 * cliente sem rodar scripts (ex.: tela de erro), reaplica o tema salvo ou o do sistema.
 */
export function Tema() {
  useEffect(() => {
    const raiz = document.documentElement;
    if (raiz.dataset.theme) return;
    try {
      raiz.dataset.theme = localStorage.getItem("theme") || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    } catch {
      raiz.dataset.theme = "light";
    }
  }, []);
  return null;
}
