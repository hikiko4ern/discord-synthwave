// @ts-check

const fs = require('fs');
const path = require('path');
const sass = require('sass');

const constants = require('./constants.json');
const FILE = path.resolve('src', 'main.scss');
const DIST = path.resolve(path.join(...constants.DIST));

const package = require('../../package.json');
const { author, version } = package;
const repoUrl = package.repository.url.replace('.git', '');

/* -------------------------------- renderer -------------------------------- */

/**
 * @param {string} file
 * @param {string} data
 * @param {string} filename
 * @param {(data: string) => string} mutateScss
 * @param {(data: string) => string} mutateCss
 */
const render = (file, data, filename, mutateScss, mutateCss) =>
  sass.render(
    {
      file,
      data: typeof mutateScss === 'function' ? mutateScss(data) : data,
      sourceMap: false,
      outputStyle: 'compressed'
    },
    (err, res) => {
      if (err) {
        throw err;
      }

      const css = res.css;
      const data = typeof mutateCss === 'function' ? mutateCss(css.toString()) : css;

      fs.writeFile(path.join(DIST, filename), data, { encoding: 'utf-8' }, err => {
        if (err) {
          throw err;
        }

        console.info('[css]', filename, 'done');
      });
    }
  );

/* --------------------------------- helpers -------------------------------- */

/**
 */

/**
 * @typedef {(data: string) => string} Codemod
 * @param  {...Codemod} mods
 * @returns {Codemod}
 */
const composeCodemods = (...mods) =>
  /** @type {Codemod} */
  data => mods.reduce((str, mod) => mod(str), data);

/* -------------------------------- codemods -------------------------------- */

/** @param {string} replaceValue */
const prependClassesWith = replaceValue =>
  /** @param {string} data */
  data => data.replace(/([.,#][^\n,{}]+(?:,|{))/gm, replaceValue);

/** @param {string} data */
const makeAllRulesImportant = data =>
  data.replace(/((?:(?:[\w\d])-*)*\:[^;}]*)/gm, '$1 !important');

/** @param {string} data */
const addBetterDiscordMeta = data =>
  [
    `//META{"name":"SynthWave '84","description":"Port of Robb Owen's SynthWave'84 theme for VS Code","author":"${author}","version":"${version}","source":"${repoUrl}"}*//`,
    data
  ].join('\n');

/* --------------------------------- render --------------------------------- */

try {
  fs.mkdirSync(DIST, { recursive: true });
} catch (error) {
  if (error.code !== 'EEXIST') throw error;
}

const data = fs.readFileSync(FILE, 'utf-8');

// BetterDiscord
render(
  FILE,
  data,
  constants.BetterDiscord.css,
  makeAllRulesImportant,
  composeCodemods(prependClassesWith('.markup-2BOw-j $1'), addBetterDiscordMeta)
);

// EnhancedDiscord
render(FILE, data, constants.EnhancedDiscord.css, undefined, prependClassesWith('.theme-dark $1'));
