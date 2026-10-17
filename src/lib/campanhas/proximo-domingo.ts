/** Domingo estritamente posterior à data escolhida, sem depender do fuso local. */
export function proximoDomingo(valor: string | null): string {
  if (!valor) return "";
  const dia = valor.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dia)) return "";
  const data = new Date(`${dia}T00:00:00Z`);
  if (Number.isNaN(data.getTime()) || data.toISOString().slice(0, 10) !== dia) {
    return "";
  }
  data.setUTCDate(data.getUTCDate() + (7 - data.getUTCDay()));
  return data.toISOString().slice(0, 10);
}
