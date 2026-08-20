const MAX_BACKEND_CSV_CHARACTERS = 12_000_000;

export function parseBackendCsv(input: string) {
  if (!input || input.length > MAX_BACKEND_CSV_CHARACTERS) return [];

  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  const commitField = () => {
    row.push(field);
    field = "";
  };
  const commitRow = () => {
    commitField();
    if (row.some((value) => value.length > 0)) rows.push(row);
    row = [];
  };

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];

    if (quoted) {
      if (character === '"' && input[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        field += character;
      }
      continue;
    }

    if (character === '"' && field.length === 0) {
      quoted = true;
    } else if (character === ",") {
      commitField();
    } else if (character === "\n") {
      commitRow();
    } else if (character !== "\r") {
      field += character;
    }
  }

  if (quoted) return [];
  if (field.length > 0 || row.length > 0) commitRow();
  if (rows.length < 2) return [];

  const [headerRow, ...dataRows] = rows;
  const headers = headerRow.map((header, index) => (index === 0 ? header.replace(/^\uFEFF/, "") : header).trim());
  if (headers.some((header) => !header)) return [];

  return dataRows.map((values) => Object.fromEntries(
    headers.map((header, index) => [header, values[index] || ""]),
  ));
}
