<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Projeto e referências

Luz da Esperança é um sistema de gestão de campanhas e caravaneiros, com interface em português brasileiro e uso prioritário no celular.

- [README.md](README.md): instalação, fluxos e contratos do banco.
- [DEPLOY-VARIAVEIS.md](DEPLOY-VARIAVEIS.md): configuração do Netlify e variáveis por ambiente.
- [CHECKLIST-TESTES.md](CHECKLIST-TESTES.md): cenários manuais para os fluxos alterados, especialmente datas, QR e permissões.
- [PENDENCIAS.md](PENDENCIAS.md): decisões adiadas e perguntas da instituição. Contém registros históricos; confirme o estado real dos ambientes antes de usar suas anotações como diagnóstico atual.

## Comandos e validação

- Ao alterar dependências, use o Node de `.nvmrc` e gere o `package-lock.json` com npm 10: `npx npm@10.9.8 install --package-lock-only`. O npm 11 pode omitir entradas opcionais exigidas pelo `npm ci` do CI; um deploy bem-sucedido no Netlify não valida o lock. Detalhes no [README](README.md#node-e-o-package-lockjson).
- Para mudanças de código, rode `npm run lint`, `npm run build` e os testes pertinentes. O build inclui `prisma generate`; o CI atual verifica apenas a sincronização do SQL gerado.
- Não há script `npm test`. Execute os arquivos afetados com `node --import tsx --test <arquivo.test.ts>`; os testes locais das restrições de cadastro estão no [README](README.md#cadastros-sem-duplicidade).
- Ao alterar o vínculo de rotas, use `node --import tsx scripts/test-rotas-vinculadas.ts` em banco de teste. O script depende de `DATABASE_URL`, executa a migration e cria dados dentro de uma transação revertida ao final.
- Para diagnosticar ambiente e schema, use `npm run check:env`. A conferência do banco requer `DATABASE_URL`; sem ela, essa parte é pulada.
- Alterações apenas de documentação exigem conferir referências e coerência das instruções; não precisam de build ou testes de aplicação.

## Banco de dados

- **A fonte de verdade é `supabase/migrations/`.** Faça alterações de schema em novas migrations. Para aplicar o schema, use `supabase db push`. Não use `npm run db:migrate` nem `npm run db:push`: eles operam sobre o schema Prisma desatualizado.
- O runtime acessa o banco por `supabase-js`. O Prisma permanece para geração no build e para o seed; `prisma/schema.prisma` não descreve todo o banco real. Não introduza acesso via Prisma em `src/` como parte de uma alteração incidental.
- Ao alterar migrations, regenere `supabase/deploy-producao.sql` com `npm run db:deploy-sql` e confira com `npm run db:deploy-sql -- --check`. Não edite o arquivo gerado à mão. Se uma nova migration não for idempotente, registre-a em `NAO_IDEMPOTENTES` de `scripts/gerar-deploy-sql.ts` para manter correto o aviso gerado.
- Não execute `supabase/OBSOLETO-setup-completo.sql` nem `supabase/OBSOLETO-rls.sql`. O SQL consolidado também contém migrations não idempotentes: em caso de aplicação parcial, siga as instruções do cabeçalho antes de repetir a execução.

## Autenticação e ambiente

- `getDb()` e `createAdminClient()` usam a service role e ignoram RLS. Mantenha esses acessos no servidor e exija `requireSessionUser(["admin"])`, de `src/lib/auth/session.ts`, dentro de cada Server Action administrativa antes do acesso privilegiado. A proteção do layout ou do middleware não substitui essa verificação.
- Ao alterar cadastro, papel ou ativação de usuários, preserve a sincronização entre Supabase Auth, `public.users`, o cadastro de caravaneiro e `app_metadata`; os helpers estão em `src/lib/auth/users.ts`.
- A configuração local fica em `.env.local`; `.env.example` contém apenas placeholders. `DATABASE_URL` e `SEED_ADMIN_*` são usados nas ferramentas locais, não na configuração do site no Netlify. O seed cria o administrador no banco apontado e não deve integrar o deploy.
- Ao alterar QR ou configuração de publicação, preserve `NEXT_PUBLIC_APP_URL` com a URL pública correta: sua ausência gera QR apontando para localhost. A câmera da chamada exige HTTPS fora do localhost.

## Datas e regras de negócio

- Para exibir instantes, use `formatarData`, `formatarDataHora` ou `formatarHora` de `src/lib/format-date.ts`, que aplicam o fuso `America/Fortaleza` de Teresina. As colunas de instante são `timestamptz`; não dependa do fuso do processo no Netlify.
- `campanhas.data_inicio` e `tarefas.prazo` são datas escolhidas, sem fuso. Use `formatarDataEscolhida` e preserve o dia informado. Campanhas novas têm uma única data; `data_fim` permanece apenas como dado legado.
- Uma coleta vinculada acompanha as rotas atuais da distribuição até a personalização explícita. Preserve a cópia e o desligamento da sincronização na RPC transacional `personalizar_rotas_coleta`, inclusive a proteção contra cópias duplicadas. Campanhas antigas não são vinculadas por nome ou data. O contrato completo está no [README](README.md#distribuição-e-coleta-com-as-mesmas-rotas).
- Ao registrar presença, preserve a exigência de campanha `ATIVA` nos caminhos manual e QR.
- Doações avulsas e arrecadações de campanha têm fluxos distintos; `created_at` registra o lançamento, não a coleta. Antes de unificar esses fluxos, mudar o significado da data exibida ou redefinir a relação entre rotas avulsas e campanhas, consulte as perguntas da instituição em [PENDENCIAS.md](PENDENCIAS.md). Não escolha uma resposta de negócio durante uma correção técnica.

## Mudanças adiadas

Correções em `src/components/navigation-progress.tsx`, migração de middleware para proxy e revisão da idempotência de migrations antigas foram adiadas pelo usuário. Faça-as somente quando forem parte do escopo solicitado. Atualizações do Next.js também devem ser tratadas em tarefa própria; a anotação histórica de reavaliação em `PENDENCIAS.md` não é autorização para atualizar dependências.
