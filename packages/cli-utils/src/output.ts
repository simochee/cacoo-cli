export function outputJson(data: unknown, fields?: string): void {
  let output = data;

  if (fields) {
    const fieldList = fields.split(",").map((f) => f.trim());
    if (Array.isArray(data)) {
      output = data.map((item) => filterFields(item, fieldList));
    } else if (typeof data === "object" && data !== null) {
      output = filterFields(data as Record<string, unknown>, fieldList);
    }
  }

  const json = process.stdout.isTTY ? JSON.stringify(output, null, 2) : JSON.stringify(output);
  process.stdout.write(json + "\n");
}

export function outputResult<T>(
  data: T,
  jsonFlag: string | undefined,
  defaultFormat: (data: T) => void,
): void {
  if (jsonFlag !== undefined) {
    outputJson(data, jsonFlag || undefined);
  } else {
    defaultFormat(data);
  }
}

function filterFields(obj: Record<string, unknown>, fields: string[]): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const field of fields) {
    if (field in obj) {
      result[field] = obj[field];
    }
  }
  return result;
}
