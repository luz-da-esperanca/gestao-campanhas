# Pendências carregadas entre tarefas — Luz da Esperança

## TAREFA 5 (docs) — ENCERRADA em 2026-08-30

Tudo o que estava listado aqui foi feito. Registro do que mudou:

1. **Âncora quebrada — resolvida.** O heading criado é exatamente
   `## Schema do banco e o papel do Prisma` (README.md:32), e os dois links
   do README que apontam para `#schema-do-banco-e-o-papel-do-prisma` resolvem.
   Conferido por script que aplica a regra de slug do GitHub.

2. **Vercel -> Netlify — feito, varrendo o repositório inteiro.**
   Além dos dois docs mapeados, a varredura achou `public/vercel.svg`
   (asset do scaffold, sem nenhuma referência no código — removido) e a
   entrada `.vercel` no .gitignore (mantida, com `.netlify/` ao lado).
   As menções que sobram neste arquivo são registro histórico.

3. **Projeto morto — 6 referências viraram `SEU-PROJECT-REF`.**
   Ver a seção abaixo.

4. **`npm run db:deploy-sql -- --check` documentado** na tabela de scripts do
   README, com a descrição do que ele faz e do exit 1.

5. **Extra, achado na varredura:** o README apontava para
   `https://github.com/CarlosDVSS/Luz-Esperan-a`, que não é o repositório
   deste projeto. Corrigido para `luz-da-esperanca/gestao-campanhas`.

6. **Extra:** a senha de exemplo `Carlinhos05` em SETUP-SIMPLES.md:46 parecia
   uma senha real de alguém. Trocada por texto genérico, a pedido do usuário,
   que ficou de falar com quem passou o projeto.

## Para a TAREFA 4 (deploy-producao.sql)
- Cabeçalho deve avisar: migrations init/rls/presenca NÃO são idempotentes;
  script interrompido no meio não pode ser simplesmente recolado.
- Incluir a 7a migration 20260828000000_rls_completo.sql.

## Para a TAREFA 6 (backup.yml) — exigências do usuário
- (a) query real ao banco, servindo de keep-alive
- (b) falhar RUIDOSAMENTE se não conectar (sem continue-on-error, sem || true)
- (c) documentar que o monitor externo aponta para /campanhas (lê o banco),
      não para a raiz. /cadastro e /_not-found são estáticas, não servem.
- Contexto confirmado pelo usuário: não há API/CLI para despausar o Supabase;
  90 dias pausado = perde restore de 1 clique; 1 ano = projeto removido.

## Para a TAREFA 7 (check:env) — APROVADO pelo usuário, fazer junto num único diff

Além do que a Tarefa 7 já prevê (checklist de variáveis), acrescentar a
scripts/check-env.ts uma verificação de SCHEMA:

  - Consultar o tipo das colunas de instante e FALHAR se alguma ainda for
    `timestamp without time zone` -> significa banco sem a migration
    20260828020000_timestamptz_instantes.sql.
  - Mensagem sugerida: "[FALHA] banco sem a migration 20260828020000 —
    rode `supabase db push`. Datas serão exibidas erradas em dev."
  - Motivo (decidido na Tarefa 3.6): console.warn em Server Component morre no
    log do Netlify; o check:env pega a divergência no momento em que ela nasce,
    que é a configuração do ambiente. Sem overhead em runtime.
  - Usuário pediu explicitamente para NÃO tocar check-env.ts duas vezes:
    fazer isto e o checklist de variáveis no MESMO diff.

## PROJETO MORTO clgvsxgbivqgmvmehegm — ENCERRADO em 2026-08-30

Confirmado pelo usuário em 2026-08-28: esse projeto NÃO EXISTE MAIS.

Decisão tomada: trocar por **placeholder `SEU-PROJECT-REF`**, e não pelo ref do
projeto novo, para o doc não envelhecer de novo. Aplicado nos 6 pontos:

  SETUP-SIMPLES.md   link do dashboard, 2 exemplos de DATABASE_URL,
                     NEXT_PUBLIC_SUPABASE_URL, tabela de variáveis do painel
  scripts/test-db-connection.ts:35   mensagem de ajuda

`.env.local.example:7` saiu da lista porque o arquivo foi apagado na Tarefa 8.2.

Sobram duas menções ao ref morto, ambas deliberadas:
  supabase/config.toml   comentário histórico explicando por que o id mudou
  PENDENCIAS.md          este registro

## TAREFAS 8.1 e 8.2 — ENCERRADAS em 2026-08-28

### Exposição de credenciais — ITEM ENCERRADO E REVISADO EM 2026-08-28

**CORREÇÃO IMPORTANTE:** a "exposição histórica" que discutimos NUNCA EXISTIU.
O usuário confirmou que o projeto NUNCA foi versionado — foi recebido por zip,
sem repositório e sem histórico. Não havia repositório em
github.com/CarlosDVSS/Luz-Esperan-a com essas credenciais; aquela URL vinha do
README do zip. As credenciais só estiveram no disco local do usuário.

Consequências:
- NÃO houve exposição pública. Nada foi coletado por scanners.
- NÃO existe histórico para reescrever (nada de git filter-repo / BFG).
- A rotação feita em 2026-08-28 foi precaução, não remediação. Correta de
  qualquer forma, mas o risco era baixo desde o começo.

Credenciais rotacionadas mesmo assim (projeto kqeavgvlqshmdawrsyaj):
  1. SUPABASE_SERVICE_ROLE_KEY (sb_secret_) — ignora RLS, acesso total
  2. NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (sb_publishable_)
  3. senha do banco, dentro da DATABASE_URL
Verificado por varredura: nenhuma das antigas aparece em nenhum arquivo.

### Consolidação dos arquivos de ambiente — FEITO
- `.env.example` recriado do zero, só placeholders, com SEU-PROJECT-REF,
  organizado por obrigatoriedade (produção / só local / opcionais).
- `.env.local` passou a ser o arquivo real (valores rotacionados), por ser o
  nome que o projeto cita em 12 lugares (server.ts:9, admin.ts:16,
  login-form.tsx:28, seed.ts:19, check-env.ts:50, README.md:15,
  SETUP-SIMPLES.md x6). Nenhum lugar manda preencher `.env`.
- `.gitignore`: removida a linha órfã `!.env.local.example`.
- VERIFICADO: `npm run check:env` -> 6/6 [OK], exit 0.
  `npm run dev` -> Ready, /login HTTP 200 sem "Supabase não configurado",
  / redireciona para /login?redirect=%2F (e NÃO para ?error=config).

### PENDENTE — dois arquivos redundantes, aguardando confirmação do usuário
- `.env` (889 B) — idêntico ao `.env.local`. Redundante: perde precedência
  para o `.env.local`, então é inerte, mas duplica segredos em disco.
- `.env.local.example` (523 B) — o segundo template. Contém o ref do projeto
  MORTO (clgvsxgbivqgmvmehegm) e placeholders piores que os do `.env.example`.
  Não é mais protegido pelo .gitignore (a linha `!` foi removida e nenhum
  padrão o cobre), então seria commitado como está.
  Recomendação: apagar os dois. Backup do `.env` original está em
  scratchpad/env-backup/.env.ORIGINAL

## Para a TAREFA 8 (segredos) — já observado
- .env.example tem segredos REAIS (service role, publishable key, senha do banco
  em DATABASE_URL, projeto kqeavgvlqshmdawrsyaj).
- SETUP-SIMPLES.md linha ~21 original: exemplo de senha "Carlinhos05".
- supabase/config.toml: project_id = clgvsxgbivqgmvmehegm (projeto antigo/dev).
- NÃO é repositório git -> não há histórico para varrer.

## Decisões do usuário a respeitar
- navigation-progress.tsx: NÃO corrigir (fica para depois da 1a campanha).
- Não subir para next 16.3.3 (reavaliar em 30 dias).
- middleware -> proxy: depois de produção estabilizada.
- Não corrigir idempotência das migrations antigas (já aplicadas em dev).

## SINCRONIZAR O PROJETO DE DESENVOLVIMENTO — não esquecer

O projeto de desenvolvimento (supabase/config.toml -> project_id
clgvsxgbivqgmvmehegm) recebeu apenas as 6 migrations originais. As TRÊS novas
precisam ser aplicadas lá também:

  20260828000000_rls_completo.sql
  20260828010000_updated_at_triggers.sql
  20260828020000_timestamptz_instantes.sql

  supabase link --project-ref clgvsxgbivqgmvmehegm
  supabase db push

POR QUE ISTO IMPORTA MAIS DO QUE PARECE
Sem a 20260828020000, as colunas de instante continuam `timestamp` sem fuso em
dev, e as funções formatarData/formatarDataHora (src/lib/format-date.ts)
produzem resultado DIFERENTE nos dois ambientes. Medido, mesma doação (22h BRT
de 15/03):

  ambiente          com a migration        sem a migration
  ----------------  ---------------------  ----------------------
  TZ=UTC (Netlify)  15/03/2026, 22:00 OK   15/03/2026, 22:00 OK (por acaso)
  TZ=UTC-3 (dev)    15/03/2026, 22:00 OK   16/03/2026, 01:00 ERRADO

O modo de falha é traiçoeiro: em produção o erro NÃO aparece, porque o fuso do
processo coincide com o fuso em que o valor foi gravado. Só se manifesta na
máquina de desenvolvimento. Um bug reportado em dev pareceria erro do helper,
quando na verdade é o banco de dev desatualizado.

Sem a 20260828000000, dev também fica com 8 tabelas SEM RLS — ou seja, um
ambiente com segurança diferente da produção.

## PARA O CHECKLIST-TESTES.md (quando existir) — pedido do usuário

Primeira mudança VISÍVEL ao usuário do projeto. Incluir com DESTAQUE:

  [ ] /admin/doacoes — coluna de data.
      Doação lançada após 21h BRT deve exibir o DIA DO LANÇAMENTO em horário
      de Teresina, não o dia seguinte. Antes exibia o dia seguinte.
      Depende de: migration 20260828020000 + formatarData().

  [ ] /app/campanhas — "Presença registrada · <data e hora>".
      Deve exibir a hora local de Teresina. Antes exibia a hora UTC,
      3 horas adiantada (presença às 19:00 aparecia como 22:00).
      Depende de: formatarDataHora().

  [ ] /admin/tarefas — coluna Prazo (teste de NÃO-regressão).
      Deve continuar exibindo o dia escolhido no formulário. Se aparecer um
      dia a menos, alguém trocou formatarDataEscolhida por formatarData.


# =====================================================================
# DECISÕES DA INSTITUIÇÃO — perguntas em aberto
# =====================================================================
# Não são bugs técnicos. São regras de negócio que ninguém do time técnico
# pode decidir sozinho. Cada uma tem consequência técnica diferente conforme
# a resposta. Descritas SEM recomendação, a pedido do usuário.
#
# CONTEXTO QUE O USUÁRIO TROUXE E MUDA A ANÁLISE:
#   As campanhas acontecem DOMINGO DE MANHÃ. Doação lançada à noite quase
#   nunca é doação recebida à noite — é digitação posterior do que foi
#   coletado de manhã. `created_at` é carimbo de DIGITAÇÃO, não data da
#   coleta. Se alguém lançar na segunda, a doação sai datada de segunda e o
#   relatório da campanha de domingo fica errado, sem nenhum bug envolvido.

## PERGUNTA 1 — A data exibida numa doação deve ser o dia da campanha ou o dia do lançamento?

O que já está medido:
  - `arrecadacoes.created_at` é preenchido por DEFAULT CURRENT_TIMESTAMP, no
    instante do INSERT. Depois da migration 20260828020000 é `timestamptz`, e
    o helper `formatarData` exibe corretamente no fuso America/Fortaleza.
  - Ou seja: hoje a tela /admin/doacoes exibe, corretamente, o DIA DA DIGITAÇÃO.
  - `arrecadacoes` tem `campanha_id` (nullable), mas o fluxo de doação avulsa
    (createDoacaoAction) NÃO o preenche.

Consequência técnica de cada resposta:

  (a) "Deve ser o dia do LANÇAMENTO"
      -> Nada a fazer. O comportamento atual já é esse e está correto.
      -> Risco aceito: relatório por data não corresponde ao dia da coleta.

  (b) "Deve ser o dia da CAMPANHA"
      -> `created_at` deixa de servir para exibição; vira só auditoria.
      -> Exige que toda doação tenha `campanha_id` preenchido, e a tela passa
         a exibir `campanhas.data_inicio` no lugar de `created_at`.
      -> Implica tornar `campanha_id` obrigatório em arrecadacoes (hoje é
         nullable) e mudar o formulário de /admin/doacoes para exigir a
         campanha. Migration + mudança de formulário + backfill se já houver
         dados.
      -> Amarra esta pergunta à PERGUNTA 2: só faz sentido se o fluxo
         escolhido for o vinculado a campanha.

  (c) "Deve ser uma data da COLETA, informada pelo usuário"
      -> Coluna nova, ex. `arrecadacoes.data_coleta DATE`, preenchida por
         <input type="date">.
      -> Por ser data escolhida (não instante), deve ser formatada com
         `formatarDataEscolhida`, NUNCA com `formatarData` — aplicar fuso numa
         data escolhida recua o dia em 24h (medido: 15/03 vira 14/03).
      -> Migration + campo novo no formulário. Não exige campanha_id.

## PERGUNTA 2 — Qual das duas telas de arrecadação a equipe vai usar de fato?

O que já está medido (item 1 da Tarefa 3):
  A tabela `arrecadacoes` acumulou dois conjuntos de colunas DISJUNTOS:
    - fase 2, via `campanhas.ts -> createArrecadacao`:
        campanha_id, item_id, descricao_outros, quantidade, observacao,
        registrado_por   (item vem do catálogo `item_catalogo`)
    - fase 3, via `admin/cadastro-actions.ts -> createDoacaoAction`:
        item (texto livre), doador, status, quantidade, observacao
  Cada caminho deixa o outro nulo. Reproduzido em Postgres:
    /admin/doacoes (SELECT sem filtro) mostra as linhas de campanha com
    Item e Doador EM BRANCO:
        item     | quantidade | doador   | status
        ---------+------------+----------+---------
                 |         10 |          | recebida   <- veio da campanha
        Cobertor |          5 | Dona Ana | recebida   <- avulsa
    listArrecadacoes(campanhaId) (.eq campanha_id) NÃO enxerga as avulsas.

Consequência técnica de cada resposta:

  (a) "Só o fluxo VINCULADO A CAMPANHA (item do catálogo)"
      -> Remover /admin/doacoes e createDoacaoAction.
      -> Colunas item, doador, status ficam órfãs; migration para removê-las.
      -> Ganha-se o catálogo padronizado (item_catalogo) e o resumo por
         campanha (getArrecadacaoResumo) passa a valer para tudo.
      -> Perde-se o campo "doador", que não existe no fluxo de campanha.

  (b) "Só o fluxo AVULSO (texto livre)"
      -> Remover createArrecadacao e a aba de arrecadação dentro da campanha.
      -> Colunas campanha_id, item_id, descricao_outros, registrado_por ficam
         órfãs; `item_catalogo` inteira deixa de ser usada (e sua seed de 20
         itens vira código morto).
      -> Perde-se o resumo por campanha.

  (c) "As duas, são coisas diferentes"
      -> Separar em duas tabelas, ou no mínimo filtrar /admin/doacoes por
         `campanha_id IS NULL` para parar de listar linhas em branco.
      -> Filtro é correção de 1 linha; separar em duas tabelas é migration +
         reescrita das duas telas.
      -> Precisa definir se o relatório final soma as duas ou não.

## PERGUNTA 3 — Rota pertence a uma campanha ou existe de forma independente?

O que já está medido (item 2 da Tarefa 3):
  - `createRotaAction` (/admin/rotas) grava nome/bairro/responsavel, SEM
    campanha_id e SEM path.
  - `saveRota` (mapa dentro da campanha) grava nome/campanha_id/path.
  - Reproduzido: rota criada em /admin/rotas nunca aparece no mapa da
    campanha, e a rota do mapa aparece em /admin/rotas sem bairro/responsável.
        nome         | bairro | responsavel | campanha_id
        -------------+--------+-------------+------------
        Rota Centro  | Centro | Joao        |              <- avulsa
        Rota do Mapa |        |             | aaaa...      <- do mapa
  - Menos grave que a PERGUNTA 2: a tela /admin/rotas exibe campanha_id, então
    dá para distinguir visualmente.

Consequência técnica de cada resposta:

  (a) "Rota SEMPRE pertence a uma campanha"
      -> `rotas.campanha_id` vira NOT NULL (migration).
      -> /admin/rotas passa a exigir escolher a campanha, ou some e o cadastro
         acontece só dentro da campanha.
      -> Rotas avulsas existentes precisariam de backfill (hoje: banco vazio,
         custo zero).

  (b) "Rota é um cadastro REUTILIZÁVEL entre campanhas"
      -> `campanha_id` sai de `rotas` e vira tabela de ligação
         (campanha_rotas), permitindo a mesma rota em várias campanhas.
      -> Migration maior; muda saveRota, listRotasByCampanha e o mapa.
      -> Ganha-se reaproveitar o desenho do mapa entre campanhas.

  (c) "São duas coisas diferentes (rota simples x rota desenhada)"
      -> Manter como está e apenas deixar explícito na UI, ex. filtrar
         /admin/rotas por `campanha_id IS NULL` ou rotular a origem.
      -> Menor custo; convive com a ambiguidade.
