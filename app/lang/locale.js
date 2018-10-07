/* eslint-disable func-names */
const i18n = require('i18n');

const path = require('path');

exports.configurei18n = function(defaultLocale = 'en') {
  i18n.configure({
    locales: ['en', 'de', 'es', 'fr', 'ja', 'zh'],
    directory: path.join(__dirname, 'lang'),
    objectNotation: true,
    register: global,
    defaultLocale
  });
};
