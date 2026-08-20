import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");
const binary = (path) => readFile(new URL(path, root));

const readPngSize = async (path) => {
  const image = await binary(path);
  assert.equal(image.subarray(1, 4).toString("ascii"), "PNG");
  return {
    width: image.readUInt32BE(16),
    height: image.readUInt32BE(20),
  };
};

test("favicon and install icons use square MScrape symbol assets", async () => {
  const [icon, appleIcon, pwa192, pwa512, favicon] = await Promise.all([
    readPngSize("app/icon.png"),
    readPngSize("app/apple-icon.png"),
    readPngSize("public/icons/mscrape-192.png"),
    readPngSize("public/icons/mscrape-512.png"),
    binary("app/favicon.ico"),
  ]);

  assert.deepEqual(icon, { width: 512, height: 512 });
  assert.deepEqual(appleIcon, { width: 180, height: 180 });
  assert.deepEqual(pwa192, { width: 192, height: 192 });
  assert.deepEqual(pwa512, { width: 512, height: 512 });
  assert.deepEqual([...favicon.subarray(0, 4)], [0, 0, 1, 0]);
  assert.equal(favicon.readUInt16LE(4), 3);
});

test("metadata no longer advertises the horizontal logo as a favicon", async () => {
  const [layout, manifest] = await Promise.all([
    source("app/layout.tsx"),
    source("public/manifest.webmanifest"),
  ]);

  assert.doesNotMatch(layout, /icons:\s*\{/);
  assert.match(layout, /\/media\/mscrape-brand\.png/);
  assert.doesNotMatch(layout, /\/media\/mscrape-logo\.png/);

  const webManifest = JSON.parse(manifest);
  assert.deepEqual(
    webManifest.icons.map(({ src, sizes }) => ({ src, sizes })),
    [
      { src: "/icons/mscrape-192.png", sizes: "192x192" },
      { src: "/icons/mscrape-512.png", sizes: "512x512" },
    ],
  );
});
