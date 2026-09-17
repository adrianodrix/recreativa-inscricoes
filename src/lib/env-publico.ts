/*
 * Variáveis públicas (prefixo NEXT_PUBLIC_), inlined no bundle do cliente.
 * Precisam ser lidas com o nome literal para o Next substituir em build.
 */
function exigir(nome: string, valor: string | undefined): string {
  if (!valor) throw new Error(`Variável de ambiente ausente: ${nome}`);
  return valor;
}

export const envPublico = {
  supabaseUrl: exigir("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL),
  supabasePublishableKey: exigir(
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  ),
};
