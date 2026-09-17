import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { destinoSeguro } from "@/lib/auth/destino";
import { criarClienteServidor } from "@/lib/supabase/server";

/*
 * Destino dos links de e-mail (recuperação de senha). Aceita o fluxo com
 * token_hash (template próprio) e o fluxo PKCE com code (template padrão).
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const tipo = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const next = destinoSeguro(searchParams.get("next"), "/painel/redefinir-senha");

  const supabase = await criarClienteServidor();
  let falhou = true;
  if (tokenHash && tipo) {
    const { error } = await supabase.auth.verifyOtp({ type: tipo, token_hash: tokenHash });
    falhou = Boolean(error);
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    falhou = Boolean(error);
  }

  if (falhou) return NextResponse.redirect(new URL("/painel/login?erro=link", request.url));
  return NextResponse.redirect(new URL(next, request.url));
}
