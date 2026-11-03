import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildArchive } from "../scripts/build-archive.mjs";
import { createArchiveIndex, searchArchive } from "../src/archive-search.js";
import { createAnalyticsRoutes } from "../src/analytics-routes.js";
import { articleHref, groupHref } from "../src/library-routes.js";

test("build separa sistemas sem perder conteúdo; catálogo leve e rotas continuam equivalentes", async () => {
  const root = await mkdtemp(join(tmpdir(), "archive-build-"));
  try {
    const source = await readFile(
      new URL("../src/content.json", import.meta.url),
      "utf8",
    );
    const systems = JSON.parse(source);
    await mkdir(join(root, "src"));
    await writeFile(join(root, "src/content.json"), source);
    const { catalog, assets } = await buildArchive(root);
    assert.ok(Buffer.byteLength(JSON.stringify(catalog)) < 10000);
    assert.equal(assets.length, systems.length * 2);
    const published = JSON.parse(
      await readFile(join(root, "src/generated/analytics-routes.json"), "utf8"),
    );
    const actualRoutes = createAnalyticsRoutes(catalog, [], published);
    const originalRoutes = createAnalyticsRoutes(systems);
    for (const [i, system] of systems.entries()) {
      assert.equal("sections" in catalog[i], false);
      assert.equal("sheet" in catalog[i], false);
      assert.equal(catalog[i].sectionCount, system.sections.length);
      const data = JSON.parse(
        await readFile(join(root, "public", catalog[i].dataUrl), "utf8"),
      );
      assert.deepEqual(data, system);
      const search = JSON.parse(
        await readFile(join(root, "public", catalog[i].searchUrl), "utf8"),
      );
      assert.deepEqual(
        searchArchive(search, "vida"),
        searchArchive(createArchiveIndex([system]), "vida"),
      );
      for (const entry of system.sections)
        for (const href of [
          articleHref(system.id, entry),
          groupHref(system.id, entry.category, entry.group),
        ])
          assert.equal(
            actualRoutes.pathFor(href),
            originalRoutes.pathFor(href),
          );
    }
    assert.equal(actualRoutes.pathFor("#/busca?q=Nome%20privado"), null);
    assert.equal(actualRoutes.pathFor("#/favoritos"), "/favoritos");
    assert.equal(actualRoutes.pathFor("#/recentes"), "/recentes");
    const again = await buildArchive(root);
    assert.deepEqual(
      again.catalog,
      catalog,
      "nomes com hash são estáveis para conteúdo igual",
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
