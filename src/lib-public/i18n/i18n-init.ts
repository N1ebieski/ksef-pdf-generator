import i18next from 'i18next';
import en from './lang/en.json' with { type: 'json' };
import pl from './lang/pl.json' with { type: 'json' };

export const i18nReady: Promise<void> = i18next
  .init({
    lng: 'pl',
    debug: true,
    resources: {
      en: { translation: en },
      pl: { translation: pl },
    },
  })
  .then(() => undefined);
