# Recreativa · app de inscrições

Webapp de inscrições da Recreativa, evento anual que reúne famílias, pais, jovens e crianças para brincadeiras e conexão com a Bíblia. Formulário público leve, pergunta por vez, feito para celular; painel dos organizadores com eventos, brincadeiras, inscritos, times e avisos por WhatsApp.

Especificação completa (requisitos e plano técnico): [`docs/plano.md`](docs/plano.md).

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Supabase (Postgres, Auth, Storage, pg_cron) · Evolution API (WhatsApp) · Vercel. Visual pelo kit em `branding/`.

## Rodando localmente

Pré-requisitos: Node 22, pnpm 11, Docker.

```bash
pnpm install
pnpm db:start          # sobe o Supabase local e aplica as migrations
cp .env.example .env.local
```

Preencha `.env.local` com as chaves impressas pelo `pnpm db:start` (`PUBLISHABLE_KEY` e `SECRET_KEY`) e um `CRON_SECRET` qualquer com 16+ caracteres. Depois:

```bash
pnpm dev               # http://localhost:3000
```

Outros comandos: `pnpm test` (Vitest), `pnpm e2e` (Playwright), `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm db:reset` (recria o banco local), `pnpm db:types` (regenera `src/lib/supabase/types.ts`).

E-mails locais (recuperação de senha) ficam no Mailpit: http://127.0.0.1:54324.

## Primeiro acesso ao painel

Não existe cadastro público. O administrador inicial é criado pela migration `0003_usuarios_painel.sql` com senha aleatória. Para entrar:

1. Abra `/painel/login` e clique em **Esqueci minha senha**.
2. Informe o e-mail do administrador inicial (definido na migration).
3. Siga o link do e-mail e escolha a senha.

Novos organizadores são cadastrados em **Usuários** e fazem o mesmo fluxo para definir a senha. Perfis: analítico (só vê), operador (edita e inclui inscritos), administrador (tudo).

## Produção (Supabase + Vercel)

1. **Supabase**: crie o projeto, então `pnpm supabase link --project-ref <ref>` e `pnpm supabase db push` para aplicar as migrations. No painel do Supabase:
   - Authentication → Providers → Email: deixe *Enable sign ups* **desligado** (só login).
   - Authentication → Email Templates → *Reset Password*: use o conteúdo de `supabase/templates/recuperacao.html` (link com `token_hash`).
   - Authentication → URL Configuration: Site URL = URL do app; adicione `https://<app>/painel/auth/confirmar` aos Redirect URLs.
2. **Vercel**: importe o repositório. Variáveis de ambiente conforme `.env.example` (`SUPABASE_SECRET_KEY` e `CRON_SECRET` como secretas). Todo push na `main` publica.
3. **WhatsApp**: uma instância própria da Evolution API v2 conectada ao número do organizador. Preencha `EVOLUTION_API_URL`, `EVOLUTION_API_KEY`, `EVOLUTION_INSTANCE` e ligue `WHATSAPP_ENVIO_ATIVO=true`.
4. **Agendamento** (retentativas e lembrete de 1 hora antes): o `pg_cron` roda a cada minuto e acorda o worker `POST /api/tarefas/outbox` lendo URL e segredo do Vault. No SQL Editor do Supabase:

   ```sql
   select vault.create_secret('https://<app>/api/tarefas/outbox', 'worker_url');
   select vault.create_secret('<mesmo valor de CRON_SECRET>', 'cron_secret');
   ```

   Sem esses segredos o tick não chama nada; o botão **Processar fila** no evento continua funcionando.

### Projeto Supabase pausado

No plano gratuito o projeto pausa após 7 dias sem uso. Antes de abrir as inscrições de uma nova edição, restaure o projeto no painel do Supabase e confira o login.

## Estrutura

```
branding/            kit de marca (tokens, tema escuro, componentes rc-*, logos)
supabase/migrations  esquema, RLS, RPCs (criar_inscricao, montagem de times, fila de WhatsApp)
src/app/(publico)    formulário público /[slug] e /[slug]/obrigado
src/app/(painel)     painel dos organizadores em /painel
src/features/inscricao  modelo do fluxo (etapas derivadas do rascunho), estado, etapas e UI
src/lib              módulos puros e de servidor: pessoas, eventos, brincadeiras, inscritos, times, whatsapp, texto rico
```

## Regras de negócio essenciais

- Cada pessoa é inscrita uma vez por evento (unicidade por nome completo normalizado). Cônjuge e filhos cadastrados por alguém já contam como inscritos.
- Idade calculada na data do evento. Casado só é perguntado a maiores de 18; filhos só a casados.
- Comida e bebida: uma unidade por pessoa acima de 12 anos, com limite por tipo definido no evento.
- Brincadeiras por categoria: crianças (≤ 8), jovens (solteiros de 9 a 30), casais (cônjuge no mesmo fluxo) e pais e filhos (dupla filho + pai, mãe ou responsável jovem). Limites contam pessoas, casais ou duplas.
- WhatsApp só é pedido, e é obrigatório, quando há participação em brincadeira.
- Times fixos por evento, só crianças e jovens, montados com inscrições encerradas: irmãos separados, criança e responsável juntos, contagens e idades equilibradas. Avisos por WhatsApp na confirmação, em alterações e 1 hora antes do evento.
