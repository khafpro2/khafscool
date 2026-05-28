#!/usr/bin/env node
/** Regenerate macbook-hero-ai.webp from PNG (uses sharp from web/ via Next). */
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(join(root, 'web/package.json'));
const sharp = require('sharp');

const heroDir = join(root, 'web/public/media/hero');
const png = join(heroDir, 'macbook-hero-ai.png');
const webp = join(heroDir, 'macbook-hero-ai.webp');

await sharp(png).webp({ quality: 82, effort: 6 }).toFile(webp);
console.log(`Wrote ${webp}`);
