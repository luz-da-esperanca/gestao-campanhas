# Luz da Esperança

Sistema de gestão de campanhas e caravaneiros — mobile-first (PWA no celular, sem app nativo).

Repositório: https://github.com/luz-da-esperanca/gestao-campanhas

## Stack

- Next.js 16 + TypeScript + Tailwind + shadcn/ui
- Supabase (Auth + PostgreSQL)
- Leaflet (mapas) + html5-qrcode (chamada)

## Configuração rápida

1. Copie `.env.example` → `.env.local` e preencha as chaves Supabase
2. Aplique o schema — **fonte de verdade: `supabase/migrations/`**

   ```bash
   supabase link --project-ref SEU-PROJECT-REF
   supabase db push
   ```

   Sem o Supabase CLI, use o plano B: cole `supabase/deploy-producao.sql`
   inteiro no SQL Editor do painel.
3. `npm install` → `npm run db:seed` → `npm run dev`

> ⚠️ **Não use** `supabase/OBSOLETO-setup-completo.sql` nem
> `supabase/OBSOLETO-rls.sql`. Eles cobrem só as duas primeiras migrations e
> produzem um banco incompleto, que a aplicação não consegue usar.
> Veja [Schema do banco e o papel do Prisma](#schema-do-banco-e-o-papel-do-prisma).

## Schema do banco e o papel do Prisma

**A fonte de verdade do schema é `supabase/migrations/`.** É o que está aplicado
no banco e o que `supabase db push` aplica em um banco novo.

O Prisma continua no projeto, mas **não descreve o banco real**. O
`prisma/schema.prisma` é um esqueleto antigo: traz modelos de "fase futura" que
nunca foram criados e não tem várias das tabelas, colunas e políticas que
existem hoje.

### Por que ele ainda está aqui

| Uso | Onde |
|-----|------|
| `prisma generate` | roda dentro do `npm run build`, antes do `next build` |
| client gerado | `prisma/seed.ts`, que cria o admin inicial |

Nenhum arquivo de `src/` importa `src/lib/prisma.ts`. Em runtime a aplicação
conversa com o banco apenas por `supabase-js`.

### ⛔ Não use estes comandos

| Comando | Por quê |
|---------|---------|
| `npm run db:migrate` | aplica o `schema.prisma` desatualizado |
| `npm run db:push` | idem, e ainda alinha o banco ao que falta no schema |

Os dois produzem um **banco incompleto**, que a aplicação não consegue usar.
Continuam no `package.json` por herança. Para aplicar schema, o caminho é
`supabase db push`.

### Se um dia alguém quiser sincronizar o `schema.prisma`

Não está feito, e não é necessário para o sistema rodar. O caminho seria:

1. Apontar `DATABASE_URL` para um banco **já migrado** pelo Supabase
2. `npx prisma db pull` — reescreve o `schema.prisma` a partir do banco real
3. Conferir o diff: os modelos de "fase futura" somem, as tabelas que faltavam
   aparecem, e os tipos passam a refletir o `timestamptz`
4. `npx prisma generate` e rodar o seed, para ver se ainda compila
5. Seguir **sem** `db:migrate` e `db:push` — o Prisma continuaria lendo o
   schema, nunca sendo dono dele

O ganho seria tipagem correta no seed. O custo é manter dois lugares descrevendo
o mesmo banco, com o risco de divergirem outra vez.

## Rotas principais

| Rota | Quem |
|------|------|
| `/campanhas` | Público — ver campanhas e rotas (sem login) |
| `/participar` | Solicitar ser caravaneiro (sem senha) |
| `/login` | Admin e caravaneiros |
| `/admin` | Administradores |
| `/admin/campanhas` | CRUD campanhas, rotas, participantes |
| `/admin/campanhas/[id]/chamada` | **Chamada** (QR + lista, mobile) |
| `/admin/solicitacoes` | Aprovar candidatos a caravaneiro |
| `/app` | Caravaneiro — início, QR, campanhas |
| `/app/campanhas` | Campanhas convocadas + status de presença |
| `/consulta/[publicId]` | Consulta pública do QR |

## Funcionalidades

- **Campanhas:** planejada → ativa → encerrada
- **Rotas:** mapa no admin, visualização pública, export Google Maps
- **Participantes:** convocar caravaneiros por campanha
- **Chamada (presença):** escanear QR ou marcar na lista (campanha ativa)
- **Arrecadações:** após encerrar campanha
- **Solicitações:** formulário público → admin aprova e cria login

## Netlify

Variáveis: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_APP_URL`

`DATABASE_URL` **não** é usada em produção — só o seed e os scripts locais
precisam dela.

A chamada por QR lê a câmera do celular, o que exige **HTTPS**. O domínio do
Netlify já serve por HTTPS; em rede local, `http://` não funciona.

Seed do admin roda no PC (`npm run db:seed`), não no Netlify.

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Desenvolvimento |
| `npm run build` | Build produção |
| `npm run db:seed` | Cria admin inicial |
| `npm run check:env` | Valida `.env.local` |
| `npm run db:deploy-sql` | Regera `supabase/deploy-producao.sql` a partir das migrations |
| `npm run db:deploy-sql -- --check` | Só confere: sai com código 1 se o SQL estiver fora de sincronia com `supabase/migrations/` |

Sobre `db:migrate` e `db:push`, veja
[Schema do banco e o papel do Prisma](#schema-do-banco-e-o-papel-do-prisma).
