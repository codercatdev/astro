import * as fs from 'fs';
import { fileURLToPath } from 'url';

const copies = 5000;

const file = 'using-mdx';
const root = fileURLToPath(new URL(`../src/content/blog`, import.meta.url));

for (const i of Object.keys(Array(copies).fill())) {
	fs.copyFileSync(`${root}/${file}.mdx`, `${root}/${file}-${i}.mdx`)
}