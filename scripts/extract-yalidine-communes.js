const fs = require("fs");

const SOURCE_URL = "https://www.yalidine.com/nos-agences/";

const decode = (value) =>
  value
    .replace(/&amp;/g, "&")
    .replace(/&#039;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, " ")
    .replace(/&eacute;/gi, "é")
    .replace(/&Eacute;/gi, "É")
    .replace(/&ecirc;/gi, "ê")
    .replace(/&agrave;/gi, "à")
    .replace(/&ccedil;/gi, "ç")
    .replace(/&iuml;/gi, "ï")
    .replace(/&ocirc;/gi, "ô")
    .replace(/&ucirc;/gi, "û")
    .replace(/&rsquo;/gi, "’")
    .replace(/<[^>]*>/g, "")
    .trim();

const slug = (value) =>
  decode(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[’'`]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const extractRows = (html) => {
  const marker = "<tr><td>";
  let idx = 0;
  const rows = [];

  for (;;) {
    const start = html.indexOf(marker, idx);
    if (start === -1) break;

    const end = html.indexOf("</tr>", start);
    if (end === -1) break;

    const row = html.slice(start, end);
    const cells = row.split("</td><td>").map((cell, index) => {
      if (index === 0) return cell.replace("<tr><td>", "");
      return cell;
    });

    if (cells.length >= 3) {
      const codeRaw = decode(cells[0]);
      const wilaya = decode(cells[1]);
      const commune = decode(cells[2]);
      const code = Number(codeRaw.replace(/\D/g, ""));

      if (Number.isFinite(code) && wilaya && commune) {
        rows.push({
          code,
          wilayaCode: Math.floor(code / 10000),
          wilaya,
          commune,
          wilayaSlug: slug(wilaya),
          communeSlug: slug(commune),
        });
      }
    }

    idx = end + 5;
  }

  return rows;
};

const dedupeRows = (rows) => {
  const unique = new Map();
  for (const row of rows) {
    if (!row.wilayaCode || !row.wilayaSlug || !row.communeSlug) continue;
    const key = `${row.wilayaCode}|${row.communeSlug}`;
    if (!unique.has(key)) unique.set(key, row);
  }

  return Array.from(unique.values()).sort(
    (a, b) =>
      a.wilayaCode - b.wilayaCode ||
      a.commune.localeCompare(b.commune, "fr", { sensitivity: "base" }),
  );
};

const run = async () => {
  const response = await fetch(SOURCE_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${SOURCE_URL}: ${response.status}`);
  }

  const html = await response.text();
  fs.writeFileSync(".tmp_yalidine_nos_agences.html", html);

  const rows = extractRows(html);
  const data = dedupeRows(rows);
  const wilayaCodes = [...new Set(data.map((entry) => entry.wilayaCode))].sort(
    (a, b) => a - b,
  );

  console.log(`rows=${rows.length}`);
  console.log(`unique_communes=${data.length}`);
  console.log(`wilayas=${wilayaCodes.length} [${wilayaCodes.join(",")}]`);
  console.log(
    "sample=",
    data.slice(0, 10).map((item) => ({
      wilayaCode: item.wilayaCode,
      wilaya: item.wilaya,
      commune: item.commune,
      communeSlug: item.communeSlug,
    })),
  );

  fs.writeFileSync(".tmp_yalidine_communes.json", JSON.stringify(data, null, 2));
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
