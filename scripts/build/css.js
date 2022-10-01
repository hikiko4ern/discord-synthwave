// @ts-check

import fs from 'fs-extra';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import sass from 'sass';

import constants from './constants.json' assert { type: 'json' };
const FILE = path.resolve('src', 'main.scss');
const DIST = path.resolve(path.join(...constants.DIST));

import pkg from '../../package.json' assert { type: 'json' };
const { author, version } = pkg;
const repoUrl = pkg.repository.url.replace('.git', '');

const META = {
  name: "SynthWave '84",
  description: "Port of Robb Owen's SynthWave'84 theme for VS Code",
  author,
  version,
  source: repoUrl
};
const META_HEADER = '//META' + JSON.stringify(META) + '*//';

/* -------------------------------- renderer -------------------------------- */

/**
 * @param {URL} url
 * @param {string} data
 * @param {string} filename
 * @param {((data: string) => string)=} mutateScss
 * @param {((data: string) => string)=} mutateCss
 */
const render = (url, data, filename, mutateScss, mutateCss) => {
  let { css } = sass.compileString(typeof mutateScss === 'function' ? mutateScss(data) : data, {
    style: 'compressed',
    url
  });

  css = typeof mutateCss === 'function' ? mutateCss(css) : css;

  fs.writeFileSync(path.join(DIST, filename), css, { encoding: 'utf-8' });

  console.info('[css]', filename, 'done');
};

/* --------------------------------- helpers -------------------------------- */

/**
 * @typedef {(data: string) => string} Codemod
 * @param  {...Codemod} mods
 * @returns {Codemod}
 */
const composeCodemods =
  (...mods) =>
  /** @type {Codemod} */
  data =>
    mods.reduce((str, mod) => mod(str), data);

/* -------------------------------- codemods -------------------------------- */

/** @param {string} replaceValue */
const prependClassesWith =
  replaceValue =>
  /** @param {string} data */
  data =>
    data.replace(/([^\r\n,{}]+)(,(?=[^}]*{)|\s*{)/gm, replaceValue + '$1$2');

/** @param {string} data */
const makeAllRulesImportant = data => data.replace(/((?:(?:[\w\d])-*)*\:[^;}]*)/gm, '$1 !important');

/** @param {string} data */
const addBetterDiscordMeta = data => META_HEADER + '\n' + data;

/* --------------------------------- render --------------------------------- */

fs.ensureDirSync(DIST);

const fileUrl = pathToFileURL(FILE);
const data = fs.readFileSync(FILE, 'utf-8');

// BetterDiscord
render(
  fileUrl,
  data,
  constants.BetterDiscord.css,
  makeAllRulesImportant,
  composeCodemods(prependClassesWith('.markup-2BOw-j '), addBetterDiscordMeta)
);

// EnhancedDiscord
render(fileUrl, data, constants.EnhancedDiscord.css, undefined, prependClassesWith('.theme-dark '));
