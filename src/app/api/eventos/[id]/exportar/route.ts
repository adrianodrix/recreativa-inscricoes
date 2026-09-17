import { NextResponse, type NextRequest } from "next/server";
import writeXlsxFile from "write-excel-file/node";
import { exigirLogin } from "@/lib/auth/perfil";
import { gerarCsv } from "@/lib/exportacao/csv";
import { COLUNAS, linhasExportacao } from "@/lib/exportacao/inscritos";
import { obterEvento } from "@/lib/eventos/consultas";
import { listarInscritos } from "@/lib/inscritos/consultas";

/* Exportação da lista de inscritos (qualquer perfil ativo; RLS filtra o resto). */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await exigirLogin();
  const { id } = await params;
  const evento = await obterEvento(id);
  if (!evento) return NextResponse.json({ erro: "Evento não encontrado" }, { status: 404 });

  const formato = request.nextUrl.searchParams.get("formato") === "xlsx" ? "xlsx" : "csv";
  const linhas = linhasExportacao(await listarInscritos(id));
  const nomeArquivo = `inscritos-${evento.slug}.${formato}`;

  if (formato === "csv") {
    return new NextResponse(gerarCsv(COLUNAS, linhas), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${nomeArquivo}"`,
      },
    });
  }

  const dados = [
    COLUNAS.map((c) => ({ value: c, fontWeight: "bold" as const })),
    ...linhas.map((l) => l.map((v) => ({ value: v }))),
  ];
  const buffer = await writeXlsxFile(dados, { sheet: "Inscritos" }).toBuffer();
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${nomeArquivo}"`,
    },
  });
}
