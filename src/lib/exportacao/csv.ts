/* CSV com BOM UTF-8 e ponto-e-vírgula: o Excel em português abre direto. */
export function gerarCsv(cabecalho: ReadonlyArray<string>, linhas: string[][]): string {
  const escapar = (v: string) => (/[;"\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  const corpo = [cabecalho, ...linhas].map((l) => l.map(escapar).join(";")).join("\r\n");
  return `﻿${corpo}\r\n`;
}
