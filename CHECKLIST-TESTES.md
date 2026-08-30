# Checklist de testes — primeira ida ao ar

Roteiro manual para depois do primeiro deploy, **antes** de abrir o sistema para
a equipe. Marque o que passar; qualquer item que falhar vira problema no domingo
de campanha, quando é caro.

Pré-requisitos: `supabase db push` aplicado, as 4 variáveis cadastradas no
Netlify, `npm run db:seed` rodado uma vez.

---

## 1. Fuso horário — os três primeiros são a mudança mais visível

Estes três itens verificam a correção de fuso feita antes da estreia. Os dois
primeiros **mudaram de comportamento**; o terceiro é teste de não-regressão.

- [ ] **`/admin/doacoes` — coluna de data.**
      Lance uma doação **depois das 21h** (horário de Teresina) e confira a data
      exibida. Deve mostrar o **dia do lançamento**, não o dia seguinte.
      *Antes exibia o dia seguinte.*
      Depende de: migration `20260828020000` + `formatarData()`.

- [ ] **`/app/campanhas` — "Presença registrada · <data e hora>".**
      Registre uma presença e confira a hora. Deve ser a **hora local de
      Teresina**. *Antes exibia a hora UTC, 3 horas adiantada: presença às 19:00
      aparecia como 22:00.*
      Depende de: `formatarDataHora()`.

- [ ] **`/admin/tarefas` — coluna Prazo (NÃO-regressão).**
      Crie uma tarefa com prazo e confira. Deve exibir **o dia escolhido no
      formulário**. Se aparecer um dia a menos, alguém trocou
      `formatarDataEscolhida()` por `formatarData()`.

> Por que os três: `timestamptz` e data escolhida em formulário exigem
> tratamento **oposto**. Aplicar o fuso na família errada erra o dia nos dois
> sentidos. Ver o cabeçalho de `src/lib/format-date.ts`.

---

## 2. QR code — exige HTTPS

- [ ] Abrir `/app/qr` como caravaneiro e conferir que o QR aparece.
- [ ] **Escanear o QR com outro celular** e confirmar que abre a página de
      consulta **do site publicado**, não `http://localhost:3000`.
      Se abrir localhost, falta `NEXT_PUBLIC_APP_URL` no Netlify.
- [ ] Abrir `/admin/campanhas/[id]/chamada` no celular e confirmar que o
      navegador **pede permissão de câmera**. Se não pedir, o site não está em
      HTTPS ou a permissão foi negada antes.

---

## 3. Login e papéis

- [ ] Entrar com o admin criado pelo seed.
- [ ] Confirmar que o admin **não** consegue abrir `/app` como caravaneiro nem
      o contrário (redireciona por papel).
- [ ] Sair e confirmar que `/admin` redireciona para `/login`.
- [ ] Abrir `/campanhas` e `/participar` **deslogado** — devem funcionar.

---

## 4. Fluxo de campanha, ponta a ponta

- [ ] Criar campanha, mudar para **ativa**.
- [ ] Convocar ao menos um caravaneiro.
- [ ] Fazer a chamada pelos **dois** caminhos: escanear o QR e marcar na lista.
- [ ] Encerrar a campanha e lançar uma arrecadação.
- [ ] Conferir o relatório em `/admin/relatorios`.

---

## 5. Segurança

- [ ] Com a **publishable key** (a que vai no navegador), tentar ler uma tabela
      direto pela API e confirmar que **não vem dado**:

      curl "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/caravaneiros?select=*" \
        -H "apikey: $CHAVE_PUBLICA"

      O esperado é `[]`. Se vierem nomes e telefones, o RLS não está aplicado —
      **pare o deploy**.

- [ ] Entrar como caravaneiro e tentar se promover a admin pela API. Deve
      falhar (a política `users_update_own` foi removida de propósito).

---

## 6. Backup e keep-alive

- [ ] Rodar **Backup do banco** por `workflow_dispatch` e confirmar que fica
      verde e gera o artifact.
- [ ] Baixar o artifact e conferir que descompacta:
      `gzip -t backup-*.sql.gz && zcat backup-*.sql.gz | head`
- [ ] Rodar **Keep-alive do Supabase** e confirmar verde.
- [ ] Conferir no healthchecks.io que os **dois checks** saíram de "novo" para
      "up".
- [ ] Testar o alarme de verdade: pausar um dos checks ou esperar a janela
      estourar, e confirmar que **o e-mail chega na caixa da instituição**.
      Um alarme nunca testado não é um alarme.

---

## 7. Depois de tudo verde

- [ ] Trocar a senha do admin criado pelo seed.
- [ ] Guardar quem tem acesso ao painel do Supabase, do Netlify e do GitHub —
      e confirmar que **não é uma pessoa só**.
