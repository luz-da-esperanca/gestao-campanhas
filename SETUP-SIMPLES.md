# Configuração em 4 passos (sem enrolação)

## Passo 1 — Criar as tabelas no Supabase (só uma vez)

> ⚠️ **Mudou.** Este passo mandava rodar `supabase/setup-completo.sql`.
> Aquele arquivo ficou para trás: cobre só as duas primeiras migrations e
> monta um banco incompleto, que a aplicação não consegue usar. Ele foi
> renomeado para `supabase/OBSOLETO-setup-completo.sql` e **não deve ser
> executado**. A fonte de verdade do schema é `supabase/migrations/`.

### Jeito preferencial — Supabase CLI

```bash
supabase link --project-ref SEU-PROJECT-REF
supabase db push
```

Isso aplica as migrations de `supabase/migrations/` na ordem correta e
registra o que já foi aplicado, então é seguro repetir.

### Plano B — colar no SQL Editor

Se o CLI não funcionar na sua máquina:

1. Abra o SQL Editor do **seu** projeto:
   `https://supabase.com/dashboard/project/SEU-PROJECT-REF/sql/new`
2. Abra o arquivo `supabase/deploy-producao.sql`
3. Copie **tudo**, cole no SQL Editor, clique **Run**
4. Deve aparecer "Success" (verde)

**Atenção:** algumas migrations antigas não são idempotentes. Se o script
falhar no meio, não basta rodar de novo — veja as instruções no topo do
`supabase/deploy-producao.sql`.

---

## Passo 2 — Pegar o DATABASE_URL (na tela que você já abriu)

Na janela **"Connect to your project"**:

1. No topo, clique na aba **Direct connection string** (NÃO fique em Framework)
2. Tipo: **URI**
3. Modo: **Session** (Session pooler)
4. Clique **Copy**
5. Cole no `.env.local` em `DATABASE_URL=`
6. Troque `[YOUR-PASSWORD]` pela senha do banco que você definiu

**Atenção:** a aba **Framework** só mostra URL e publishable key — isso NÃO é o DATABASE_URL.

Alternativa: https://supabase.com/dashboard/project/SEU-PROJECT-REF/settings/database → Connection string

A linha final fica assim (exemplo, a sua será parecida):

```
DATABASE_URL=postgresql://postgres.SEU-PROJECT-REF:sua-senha-do-banco@aws-0-sa-east-1.pooler.supabase.com:5432/postgres
```

---

## Passo 3 — Colar no `.env.local`

Abra o arquivo `.env.local` na pasta do projeto.

O Supabase pode mostrar `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — **é a mesma coisa** que `ANON_KEY`. Use o nome que o painel mostrar.

Exemplo completo:

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJECT-REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
DATABASE_URL=postgresql://postgres.SEU-PROJECT-REF:sua-senha-do-banco@....pooler.supabase.com:5432/postgres
NEXT_PUBLIC_APP_URL=http://localhost:3000
SEED_ADMIN_EMAIL=admin@luzespe.local
SEED_ADMIN_PASSWORD=change-me-123456
SEED_ADMIN_NAME=Administrador
```

**Apague o `#` da linha DATABASE_URL** e cole a string inteira que você copiou no passo 2.

Salve o arquivo.

Verifique:

```bash
npm run check:env
```

Tem que aparecer tudo `[OK]`.

---

## Passo 4 — Criar o admin e abrir o site

```bash
npm run db:seed
npm run dev
```

Abra http://localhost:3000 e entre com:

- E-mail: o que está em `SEED_ADMIN_EMAIL` (ex: admin@luzespe.local)  
- Senha: o que está em `SEED_ADMIN_PASSWORD` (ex: change-me-123456)  

---

## Vercel (depois que funcionar no PC)

No site da Vercel → seu projeto → **Settings → Environment Variables**

Adicione **as mesmas** variáveis do `.env.local`:

| Nome | Valor |
|------|--------|
| NEXT_PUBLIC_SUPABASE_URL | https://SEU-PROJECT-REF.supabase.co |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | (igual ao .env.local) |
| SUPABASE_SERVICE_ROLE_KEY | (igual ao .env.local) |
| DATABASE_URL | (igual ao .env.local) |
| NEXT_PUBLIC_APP_URL | https://SEU-SITE.vercel.app |
| SEED_ADMIN_* | opcional no Vercel |

Depois: **Deployments → Redeploy**.

No Supabase: **Authentication → URL Configuration** → adicione a URL da Vercel em Redirect URLs.

O seed (`npm run db:seed`) rode **no seu PC** uma vez — o banco é o mesmo da Vercel.
