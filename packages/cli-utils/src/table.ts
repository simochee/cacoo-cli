import consola from "consola";

export function formatTable(headers: string[], rows: string[][]): string {
  const widths = headers.map((h, i) => {
    const colValues = rows.map((r) => (r[i] ?? "").length);
    return Math.max(h.length, ...colValues);
  });

  const formatRow = (row: string[]): string =>
    row.map((cell, i) => (cell ?? "").padEnd(widths[i])).join("  ");

  const headerLine = formatRow(headers);
  const lines = rows.map(formatRow);
  return [headerLine, ...lines].join("\n");
}

export function printTable(headers: string[], rows: string[][]): void {
  consola.log(formatTable(headers, rows));
}
