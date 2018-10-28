/* eslint-disable global-require,no-underscore-dangle */

// Webpack require fix
const langmodules = {
  de: require('./de'),
  en: require('./en'),
  es: require('./es'),
  fr: require('./fr'),
  ja: require('./ja'),
  zh: require('./zh')
};

exports.setLanguage = function(language) {
  exports.language = language;

  const langfile = langmodules[language];
  exports.translations = langfile.translations;
};

exports.getLocales = () => Object.keys(langmodules);

exports.__ = (translation, ...translations) => {
  const split = translation.split(/\./);

  if (split.length === 0) {
    return translation;
  }

  let lang = exports.translations;
  let obj;

  for (let i = 0; i < split.length; ++i) {
    obj = lang[split[i]];
    lang = obj;
  }

  for (let i = 0; i < translations.length; ++i) {
    lang = lang.replace('%s', translations[i])
  }

  return lang;
};

exports.setLanguage('en');
