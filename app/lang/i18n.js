import i18n from 'i18next';
import Backend from 'i18next-sync-fs-backend';
import { reactI18nextModule } from 'react-i18next';

import path from 'path';

// Load all language files.
import '../views/main/lang/en';

i18n
  .use(Backend)
  .use(reactI18nextModule)
  .init({
    ns: 'translation',
    defaultNS: 'translation',
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true',
    interpolation: {
      escapeValue: false
    },
    initImmediate: false,
    react: {
      wait: true
    },
    backend: {
      loadPath: path.join(__dirname, './lang/{{lng}}.json'),
      addPath: path.join(__dirname, './lang/{{lng}}.missing.json'),
      jsonIndent: 4
    }
  });

export default i18n;
