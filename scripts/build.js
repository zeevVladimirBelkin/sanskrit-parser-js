import { copyFile, mkdir } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const dist = new URL("dist/", root);
const files = [
  ["src/index.js", "index.js"],
  ["LICENSE", "LICENSE"],
  ["NOTICE.md", "NOTICE.md"],
];

await mkdir(dist, { recursive: true });
await Promise.all(files.map(([source, target]) =>
  copyFile(new URL(source, root), new URL(target, dist))
));
