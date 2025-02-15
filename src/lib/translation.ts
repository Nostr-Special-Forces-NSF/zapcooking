import { translate as googletranslate } from 'google-translate-api-browser';
import type { TranslateOption } from './state';

export async function translate(translateOption: TranslateOption, string: string) {
  if (translateOption.option == 'google') {
    const gTranslate = googletranslate(translateOption.data);
    const e = await gTranslate(string, { to: translateOption.lang });
    return e;
  }
  return '';
}
