# Luz da Esperança

Sistema de gestão de campanhas e caravaneiros — mobile-first (PWA no celular, sem app nativo).

Repositório: https://github.com/CarlosDVSS/Luz-Esperan-a

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

## Vercel

Variáveis: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_APP_URL`

Seed do admin roda no PC (`npm run db:seed`), não na Vercel.

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Desenvolvimento |
| `npm run build` | Build produção |
| `npm run db:seed` | Cria admin inicial |
| `npm run check:env` | Valida `.env.local` |
