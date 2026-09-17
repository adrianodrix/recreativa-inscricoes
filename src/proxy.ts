import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { servicoIndisponivel } from "@/lib/auth/indisponivel";
import { envPublico } from "@/lib/env-publico";

/* Rotas do painel acessíveis sem sessão. Não existe cadastro público. */
const ROTAS_ABERTAS = ["/painel/login", "/painel/esqueci-senha", "/painel/redefinir-senha", "/painel/auth"];

/*
 * Renova a sessão do Supabase a cada requisição do painel e redireciona
 * quem não está logado para o login (e quem está, para fora do login).
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(envPublico.supabaseUrl, envPublico.supabasePublishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // getClaims valida o token localmente; nunca usar getSession() aqui.
  // Falha de infraestrutura não é ausência de sessão: deixa passar e a página mostra o aviso.
  let logado = false;
  try {
    const { data, error } = await supabase.auth.getClaims();
    if (error && servicoIndisponivel(error)) return response;
    logado = Boolean(data?.claims);
  } catch {
    return response;
  }
  const { pathname } = request.nextUrl;
  const rotaAberta = ROTAS_ABERTAS.some((rota) => pathname.startsWith(rota));

  if (!logado && !rotaAberta) {
    const url = request.nextUrl.clone();
    url.pathname = "/painel/login";
    url.search = "";
    if (pathname !== "/painel") url.searchParams.set("voltar", pathname);
    return NextResponse.redirect(url);
  }

  if (logado && pathname === "/painel/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/painel/eventos";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/painel/:path*"],
};
