// translation.entity.ts
export class Translation {
  id: number;
  source: string;
  target: string;
  sourceLang: 'ru' | 'fr' | 'en';
  targetLang: 'ru' | 'fr' | 'en';
  meaning: string; 
  example?: string;
}
