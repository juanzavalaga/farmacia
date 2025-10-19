
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths are relative to the script's location
const tsvPath = path.resolve(__dirname, '../../catalogoproductos.tsv');
const outputPath = path.resolve(__dirname, '../public/data/catalog.json');

async function parseTsv() {
  try {
    const tsvData = await fs.readFile(tsvPath, 'utf-8');
    const lines = tsvData.trim().split('\r\n'); // Adjusted for Windows line endings

    if (lines.length < 2) {
      console.error('Error: TSV file is empty or has only a header.');
      process.exit(1);
    }

    const headers = lines[0].split('\t').map(h => h.trim());
    const jsonData = lines.slice(1).map(line => {
      const values = line.split('\t');
      const entry = {};
      headers.forEach((header, index) => {
        // Sanitize keys to be valid JavaScript identifiers
        const key = header.replace(/[^a-zA-Z0-9_]/g, '_');
        entry[key] = values[index] ? values[index].trim() : '';
      });
      return entry;
    });

    await fs.writeFile(outputPath, JSON.stringify(jsonData, null, 2));
    console.log(`Successfully converted TSV to JSON at ${outputPath}`);

  } catch (error) {
    console.error('An error occurred during the parsing process:', error);
    process.exit(1);
  }
}

parseTsv();
