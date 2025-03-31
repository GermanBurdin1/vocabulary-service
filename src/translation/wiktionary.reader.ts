import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

export class WiktionaryReader {
  private filePath = path.join(__dirname, '..', '..', 'data', 'frwiktionary.jsonl');

  async find(word: string, targetLang: 'ru' | 'en'): Promise<any[]> {
    const results: any[] = [];

    const fileStream = fs.createReadStream(this.filePath);
    const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

    for await (const line of rl) {
      if (!line.trim()) continue;

      const entry = JSON.parse(line);
      if (entry.word?.toLowerCase() !== word.toLowerCase()) continue;

      const translations = entry.senses?.flatMap(sense =>
        (sense.translations || []).filter(t => t.lang === targetLang)
      );

      if (translations.length > 0) {
        results.push({ word: entry.word, pos: entry.pos, translations });
      }
    }

    return results;
  }
}
