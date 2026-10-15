import { ui, defaultLang } from './ui';

export function getLangFromUrl(url: URL) {
  const [, lang] = url.pathname.split('/');
  if (lang in ui) return lang as keyof typeof ui;
  return defaultLang;
}

export function useTranslations(lang: keyof typeof ui) {
  return function t(key: string, ...args: any[]) {
    let translation: any;
    
    // Check if the exact key exists (flat keys with dots)
    if (ui[lang] && key in ui[lang]) {
      translation = (ui[lang] as any)[key];
    } else if (ui[defaultLang] && key in ui[defaultLang]) {
      translation = (ui[defaultLang] as any)[key];
    } else {
      // Fallback to nested key lookup
      const keys = key.split('.');
      translation = ui[lang];
      for (const k of keys) {
        if (translation && typeof translation === 'object' && k in translation) {
          translation = translation[k];
        } else {
          let fallback: any = ui[defaultLang];
          for (const fbK of keys) {
              if (fallback && typeof fallback === 'object' && fbK in fallback) {
                  fallback = fallback[fbK];
              } else {
                  fallback = undefined;
                  break;
              }
          }
          translation = fallback || key;
          break;
        }
      }
    }
    
    if (typeof translation === 'string' && args.length > 0) {
      if (typeof args[0] === 'object') {
        const params = args[0];
        return translation.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k) => params[k] !== undefined ? params[k] : `{{${k}}}`);
      }
    }
    
    return translation;
  }
}
