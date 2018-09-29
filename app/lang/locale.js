const i18n = require('i18n');

exports.configurei18n = function() {
  i18n.configure({
    locales: ['en', 'de', 'es', 'fr', 'ja', 'zh'],
    directory: require('path').join(__dirname, 'lang'),
    objectNotation: true,
    register: global,
    defaultLocale: 'en'
  });
};
