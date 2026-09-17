@AGENTS.md

# Recreativa · app de inscrições

Webapp de inscrições da Recreativa (evento anual de famílias, jovens e crianças). Textos, comentários e identificadores de domínio em pt-BR.

## Convenções
- Next.js 16 (App Router, `src/`), React 19.3, TypeScript strict, pnpm. Sem Tailwind.
- Visual vem do kit em `branding/` (tokens, tema escuro, classes `rc-*`). Não alterar o kit; complementar com CSS Modules.
- Backend: Supabase (Postgres, Auth, Storage). Migrations em `supabase/migrations`, versionadas. Tipos gerados com `pnpm db:types`.
- Arquivos com no máximo ~250 linhas; funções curtas. Módulos puros (sem React/banco) em `src/lib`.
- Nunca dados fictícios em dev/prod; fixtures só em testes.
- Nunca sobrescrever `.env*` sem confirmar.

## Comandos
- `pnpm dev` · `pnpm build` · `pnpm lint` · `pnpm typecheck` · `pnpm test` · `pnpm e2e`
- `pnpm db:start` · `pnpm db:reset` · `pnpm db:types`

## Git
- Um só branch: `main`. Commit e push ao concluir cada etapa. Repositório público: nada sensível no git.
- Sem pull request: o fluxo é push direto na `main`, então o `/ship` não se aplica aqui.
- Commits em pt-BR, no imperativo, terminando com `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.

## Especificação
- Requisitos e plano técnico completos: `docs/plano.md`.
