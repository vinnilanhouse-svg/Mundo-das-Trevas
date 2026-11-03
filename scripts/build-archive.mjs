import { readFile, writeFile, mkdir, rm } from "node:fs/promises";
import { createHash } from "node:crypto";
import { fileURLToPath, pathToFileURL } from "node:url";
import { resolve } from "node:path";
import { createArchiveIndex } from "../src/archive-search.js";
import { articleHref, groupHref } from "../src/library-routes.js";

export async function buildArchive(
  root = fileURLToPath(new URL("../", import.meta.url)),
) {
  const systems = JSON.parse(
    await readFile(resolve(root, "src/content.json"), "utf8"),
  );
  const dataDir = resolve(root, "public/data/archive");
  const generated = resolve(root, "src/generated");
  await rm(dataDir, { recursive: true, force: true });
  await mkdir(dataDir, { recursive: true });
  await mkdir(generated, { recursive: true });
  const catalog = [];
  const routes = new Set();
  const assets = [];
  async function asset(name, data) {
    const bytes = JSON.stringify(data);
    const hash = createHash("sha256").update(bytes).digest("hex").slice(0, 12);
    const filename = `${name}.${hash}.json`;
    await writeFile(resolve(dataDir, filename), bytes);
    assets.push({ filename, bytes: Buffer.byteLength(bytes) });
    return `/data/archive/${filename}`;
  }
  for (const system of systems) {
    const { sections, sheet, ...metadata } = system;
    const dataUrl = await asset(system.id, system);
    const searchUrl = await asset(
      `search-${system.id}`,
      createArchiveIndex([system]),
    );
    catalog.push({
      ...metadata,
      sectionCount: sections.length,
      dataUrl,
      searchUrl,
    });
    for (const section of sections) {
      routes.add(articleHref(system.id, section));
      routes.add(groupHref(system.id, section.category, section.group));
    }
  }
  await writeFile(resolve(generated, "catalog.json"), JSON.stringify(catalog));
  await writeFile(
    resolve(generated, "analytics-routes.json"),
    JSON.stringify([...routes]),
  );
  return { catalog, assets };
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  const { catalog, assets } = await buildArchive();
  console.log(
    `Acervo preparado: ${catalog.length} sistemas independentes; catálogo inicial de ${Buffer.byteLength(JSON.stringify(catalog))} bytes.`,
  );
  for (const asset of assets)
    console.log(`${asset.filename}: ${(asset.bytes / 1024).toFixed(0)} KiB`);
}
