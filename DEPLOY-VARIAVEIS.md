# Variáveis de ambiente

Levantado lendo quem realmente lê cada variável no código, não a documentação
antiga. Confira com `npm run check:env`.

> **Regra de leitura:** `NEXT_PUBLIC_` é **público**. O Next.js substitui essas
> variáveis no código que vai para o navegador — qualquer visitante consegue
> lê-las abrindo o DevTools. Não é um vazamento, é o desenho. O que nunca pode
> levar o prefixo é uma chave secreta.

---

## 1. Obrigatórias no Netlify (produção)

`Site configuration → Environment variables`

| Variável | Público? | Onde é lida | O que quebra sem ela |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | 🌐 público | `src/lib/supabase/{env,server,client,admin}.ts` | nada funciona: sem URL não há banco nem login |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | 🌐 público | `src/lib/supabase/env.ts:22` | idem — é a chave que o navegador usa |
| `SUPABASE_SERVICE_ROLE_KEY` | 🔒 **secreta** | `src/lib/supabase/admin.ts` | todas as telas com dados: o servidor lê o banco com esta chave |
| `NEXT_PUBLIC_APP_URL` | 🌐 público | `src/lib/constants.ts:7` | **falha silenciosa, veja abaixo** |

### ⚠️ `NEXT_PUBLIC_APP_URL` é a mais perigosa da lista

Ela tem um fallback:

```ts
// src/lib/constants.ts:5
export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
}
```

E `getConsultaUrl()` usa esse valor para montar a URL que vai **dentro do QR
code** de cada caravaneiro (`src/app/(caravaneiro)/app/qr/page.tsx:19` e
`src/components/admin/caravaneiro-qr-dialog.tsx:24`).

Sem a variável, o site sobe normalmente, o painel funciona, os QR codes são
gerados — e todos apontam para `http://localhost:3000`. Ninguém descobre até
alguém tentar escanear um, o que acontece **na chamada, no domingo de manhã,
durante a campanha**. Use `https://`: a leitura por câmera exige HTTPS.

### Sobre os nomes alternativos

O código aceita `NEXT_PUBLIC_SUPABASE_ANON_KEY` no lugar de
`PUBLISHABLE_KEY`, e `SUPABASE_SECRET_KEY` no lugar de `SERVICE_ROLE_KEY`
(`src/lib/supabase/env.ts:20-33`). É compatibilidade com o painel antigo do
Supabase. **Cadastre só um nome de cada par** — dois nomes para a mesma coisa
é como se cria a situação de trocar a chave em um lugar e esquecer do outro.

---

## 2. Só na máquina de quem desenvolve

Ficam no `.env.local`. **Não cadastre no Netlify.**

| Variável | Público? | Para quê |
|---|---|---|
| `DATABASE_URL` | 🔒 **secreta** | `prisma generate`, `npm run test:db` e a checagem de schema do `npm run check:env` |
| `SEED_ADMIN_EMAIL` | — | `npm run db:seed`, que cria o primeiro administrador |
| `SEED_ADMIN_PASSWORD` | 🔒 **secreta** | idem |
| `SEED_ADMIN_NAME` | — | idem (opcional, tem padrão) |

### Por que `DATABASE_URL` não vai para produção

Nenhum arquivo de `src/` importa `src/lib/prisma.ts` — verificável com
`git grep '@/lib/prisma' -- src`, que não retorna nada. Em runtime a aplicação
fala com o banco só por `supabase-js`, usando a `SERVICE_ROLE_KEY`.

Cadastrá-la no Netlify não faria o site funcionar melhor: só colocaria a senha
do banco, que é a credencial mais forte do projeto, num lugar a mais.

### Por que o seed não roda em produção

`npm run db:seed` cria um login de administrador. Roda **uma vez**, da máquina
de quem instala, contra o mesmo banco que a produção usa. Se as `SEED_ADMIN_*`
estivessem no Netlify, cada deploy poderia recriar ou sobrescrever o admin —
e a senha do administrador estaria guardada no painel de deploy.

---

## 3. Opcionais

| Variável | Situação |
|---|---|
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | alternativa a `PUBLISHABLE_KEY`; use uma ou outra |
| `SUPABASE_SECRET_KEY` | alternativa a `SERVICE_ROLE_KEY`; use uma ou outra |
| `SEED_ADMIN_NAME` | padrão: `Administrador` |

`NODE_ENV` aparece em `src/lib/prisma.ts`, mas o Next.js define sozinho. Não
cadastre.

---

## 4. Resumo para copiar no Netlify

São **quatro**:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_APP_URL
```

Depois de cadastrar: **Deploys → Trigger deploy → Clear cache and deploy site**.
Variável de ambiente só entra no bundle em build novo — mudar e não republicar
não tem efeito nenhum.

E no Supabase: **Authentication → URL Configuration** → a URL do site em
Redirect URLs, senão o login redireciona para o lugar errado.

---

## 5. `npm run check:env`

Verifica duas coisas independentes:

**Variáveis** — presença, formato, placeholders esquecidos, chave secreta
trocada com a pública, e senha de seed que veio da documentação (essas são
recusadas: uma senha de exemplo que escapa para produção é uma porta aberta
com a senha publicada no repositório).

**Schema** — se `DATABASE_URL` estiver presente, conecta e confere que o banco
apontado é mesmo o migrado: as 10 tabelas, RLS ligado em todas, os 5 triggers
de `updated_at`, as 12 colunas de instante em `timestamptz` e as 3 datas
escolhidas que precisam continuar **sem** fuso.

Isso pega o caso em que as variáveis estão todas certas mas apontam para um
projeto onde ninguém rodou `supabase db push`. Nele o site sobe, o login
funciona, e a falha só aparece na primeira campanha.

Sem `DATABASE_URL` a checagem de schema é pulada, com aviso — não é erro.
