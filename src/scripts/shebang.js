import { promises as fs } from 'node:fs';

async function addShebang() {
  try {
    const filePath = 'dist/ui/server/entry.mjs';
    const shebang = '#! /usr/bin/env node\n';
    const data = await fs.readFile(filePath, 'utf8');
    if (data.startsWith(shebang)) return;
    const newData = shebang + data;
    await fs.writeFile(filePath, newData, 'utf8');
    console.log('Success shebang added.');
  } catch (err) {
    console.error('Error editing file:', err);
  }
}

addShebang();
