/**
 * Formatação de data e hora — ponto único do sistema.
 *
 * POR QUE ISTO EXISTE
 * As páginas que exibem data são Server Components. O `toLocaleDateString` roda
 * no servidor, e o servidor do Netlify roda em UTC — nunca no fuso de quem está
 * olhando a tela. Sem passar `timeZone` explicitamente, uma doação registrada às
 * 22h de 15/03 em Teresina aparecia como 16/03, porque em UTC o dia já virou.
 *
 * DOIS TIPOS DE VALOR, DOIS TRATAMENTOS
 *
 * 1. INSTANTE — quando algo aconteceu. Vem de coluna `timestamptz` e chega com
 *    offset: "2026-03-16T01:00:00+00:00". Precisa ser convertido para o fuso
 *    local com `timeZone`, senão exibe a hora UTC.
 *      -> formatarData / formatarDataHora / formatarHora
 *
 * 2. DATA ESCOLHIDA — um dia que o usuário selecionou num <input type="date">.
 *    Vem de coluna `timestamp` sem fuso e chega sem offset:
 *    "2026-03-15T00:00:00". NÃO representa um instante: representa o dia 15,
 *    ponto. Aplicar `timeZone` aqui faz o dia RECUAR 24h (medido: 15/03 vira
 *    14/03). Por isso é formatada por recorte de string, sem passar por Date.
 *      -> formatarDataEscolhida
 *
 * Usar a função errada troca o dia exibido. Na dúvida: veio de data_inicio,
 * data_fim ou prazo? É data escolhida. Qualquer outra coisa é instante.
 *
 * ---------------------------------------------------------------------------
 * DEPENDÊNCIA DE MIGRATION — leia antes de mexer
 * ---------------------------------------------------------------------------
 * As funções de INSTANTE (formatarData, formatarDataHora, formatarHora) só
 * produzem o resultado certo se a coluna de origem for `timestamptz`. É o que
 * a migration 20260828020000_timestamptz_instantes.sql passou a garantir para
 * created_at, updated_at e presencas.created_at.
 *
 * Contra um banco SEM essa migration, a coluna ainda é `timestamp` sem fuso e
 * o PostgREST devolve a string sem offset ("2026-03-16T01:00:00"). Aí o
 * JavaScript interpreta o valor no fuso DO PROCESSO, e o resultado depende de
 * onde o código roda. Medido, para a mesma doação (22h BRT de 15/03):
 *
 *   ambiente          coluna timestamptz      coluna timestamp (sem migration)
 *   ----------------  ----------------------  --------------------------------
 *   TZ=UTC (Netlify)  15/03/2026, 22:00  OK   15/03/2026, 22:00  OK (por acaso)
 *   TZ=UTC-3 (dev)    15/03/2026, 22:00  OK   16/03/2026, 01:00  ERRADO
 *   TZ=UTC+9          15/03/2026, 22:00  OK   15/03/2026, 13:00  ERRADO
 *
 * Repare no modo de falha: em produção (UTC) o erro NÃO aparece, porque o fuso
 * do processo coincide com o fuso em que o valor foi gravado. Ele só se
 * manifesta em máquina de desenvolvimento. Ou seja, se o banco de dev não
 * receber as migrations novas, os dois ambientes divergem — e o ambiente que
 * mostra o erro é justamente o que ninguém usa para conferir.
 *
 * As funções de DATA ESCOLHIDA (formatarDataEscolhida) não têm essa
 * dependência: elas leem a string e nunca constroem um Date.
 *
 * Se um dia data_inicio/data_fim/prazo forem convertidos para timestamptz ou
 * DATE, esta separação precisa ser revista.
 */

/** Teresina/PI — UTC-3, sem horário de verão. */
export const FUSO_HORARIO = "America/Fortaleza";

const LOCALE = "pt-BR";

type Entrada = string | Date | null | undefined;

function paraDate(valor: Entrada): Date | null {
  if (valor == null || valor === "") return null;
  const d = valor instanceof Date ? valor : new Date(valor);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Instante -> "15/03/2026" no fuso local. */
export function formatarData(valor: Entrada): string {
  const d = paraDate(valor);
  if (!d) return "";
  return d.toLocaleDateString(LOCALE, { timeZone: FUSO_HORARIO });
}

/** Instante -> "15/03/2026, 19:00" no fuso local. */
export function formatarDataHora(valor: Entrada): string {
  const d = paraDate(valor);
  if (!d) return "";
  return d.toLocaleString(LOCALE, {
    timeZone: FUSO_HORARIO,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Instante -> "19:00" no fuso local. */
export function formatarHora(valor: Entrada): string {
  const d = paraDate(valor);
  if (!d) return "";
  return d.toLocaleTimeString(LOCALE, {
    timeZone: FUSO_HORARIO,
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Data escolhida pelo usuário -> "15/03/2026".
 *
 * Lê os componentes ano-mês-dia direto da string, sem construir um Date. Isso a
 * torna imune ao fuso do processo: o dia exibido é sempre o dia gravado, rode
 * onde rodar. Aceita "2026-03-15" e "2026-03-15T00:00:00".
 */
export function formatarDataEscolhida(valor: Entrada): string {
  if (valor == null || valor === "") return "";

  const texto = valor instanceof Date ? valor.toISOString() : String(valor);
  const m = texto.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return "";

  const [, ano, mes, dia] = m;
  return `${dia}/${mes}/${ano}`;
}
