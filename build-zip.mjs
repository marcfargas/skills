#!/usr/bin/env node
/**
 * Build skills.zip — a portable archive of all skills for easy download and install.
 * Uses `npm pack` to get the exact published file list, then zips them.
 *
 * Usage: node build-zip.mjs
 * Output: dist/skills.zip
 */

import { execSync } from "node:child_process";
import {
  mkdirSync,
  readFileSync,
  writeFileSync,
  unlinkSync,
  statSync,
  existsSync,
} from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(__dirname, "package.json"), "utf8"));

// Use npm pack --json to get the exact file list that npm would publish
console.log("📦 Collecting files from package.json...");
const packOutput = execSync("npm pack --dry-run --json 2>/dev/null", {
  cwd: __dirname,
  encoding: "utf8",
});
const packInfo = JSON.parse(packOutput);
const files = packInfo[0].files.map((f) => f.path);

console.log(`   Found ${files.length} files`);

// Create dist directory
const distDir = join(__dirname, "dist");
mkdirSync(distDir, { recursive: true });

const zipPath = join(distDir, "skills.zip");

// Remove existing zip
if (existsSync(zipPath)) unlinkSync(zipPath);

// Write file list to temp file, then zip
const listFile = join(distDir, ".zipfiles");
writeFileSync(listFile, files.join("\n"));

try {
  execSync(`zip -q "${zipPath}" -@ < "${listFile}"`, {
    cwd: __dirname,
    stdio: ["pipe", "pipe", "pipe"],
    shell: true,
  });
} catch {
  // Fallback: PowerShell on Windows
  const paths = files.map((f) => `'${f}'`).join(",");
  execSync(
    `pwsh -NoProfile -Command "Compress-Archive -Path @(${paths}) -DestinationPath '${zipPath}' -Force"`,
    { cwd: __dirname, stdio: ["pipe", "pipe", "pipe"] }
  );
}

unlinkSync(listFile);

// Report
const size = statSync(zipPath).size;
const sizeKB = (size / 1024).toFixed(1);
console.log(`✅ Built: dist/skills.zip (${sizeKB} KB, ${files.length} files)`);
console.log(`   Version: ${pkg.version}`);
