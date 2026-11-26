import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import manifest from "../../app/manifest.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../..");

function pngSize(path: string) {
  const buf = readFileSync(path);
  assert.equal(buf[0], 0x89);
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

describe("web app manifest", () => {
  it("declares HomelyBlock identity and safe install settings", () => {
    const data = manifest();
    assert.equal(data.name, "HomelyBlock");
    assert.equal(data.short_name, "HomelyBlock");
    assert.equal(data.display, "standalone");
    assert.equal(data.start_url, "/");
    assert.equal(data.scope, "/");
    assert.equal(data.theme_color, "#244c3a");
    assert.equal(data.background_color, "#f7f6f0");
    assert.ok(!String(data.start_url).includes("token"));
    assert.ok(!String(data.start_url).includes("?"));
    assert.ok(data.icons?.some((icon) => icon.purpose === "maskable"));
    assert.ok(data.icons?.some((icon) => icon.sizes === "192x192"));
    assert.ok(data.icons?.some((icon) => icon.sizes === "512x512"));
    const shortcuts = data.shortcuts ?? [];
    for (const shortcut of shortcuts) {
      assert.ok(
        shortcut.url === "/sign-in" || shortcut.url === "/societies",
        `unexpected shortcut ${shortcut.url}`,
      );
    }
  });

  it("ships icon files matching declared dimensions", () => {
    assert.deepEqual(pngSize(join(ROOT, "public/icons/icon-192.png")), {
      width: 192,
      height: 192,
    });
    assert.deepEqual(pngSize(join(ROOT, "public/icons/icon-512.png")), {
      width: 512,
      height: 512,
    });
    assert.deepEqual(pngSize(join(ROOT, "public/icons/icon-maskable-512.png")), {
      width: 512,
      height: 512,
    });
    assert.deepEqual(pngSize(join(ROOT, "public/icons/apple-touch-icon.png")), {
      width: 180,
      height: 180,
    });
  });
});
