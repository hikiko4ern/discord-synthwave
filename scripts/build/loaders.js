// @ts-check

import fs from 'fs-extra';
import path from 'node:path';
import { URL } from 'node:url';

/* -------------------------------- constants ------------------------------- */

import constants from './constants.json' assert { type: 'json' };
const DIST = path.resolve(path.join(...constants.DIST_LOADERS));

/* --------------------------------- package -------------------------------- */

import pkg from '../../package.json' assert { type: 'json' };

const repoUrl = pkg.repository.url.replace('.git', '');

const { version } = pkg;
const [, user, repo] = new URL(repoUrl).pathname.replace('.git', '').split('/');

/* --------------------------------- helpers -------------------------------- */

/** @param {string} name */
const importUrl = name =>
  `@import url('https://rawcdn.githack.com/${user}/${repo}/v${version}/${constants.DIST.join('/')}/${name}');`;

/**
 * @param {string} filename
 * @param {string} data
 */
const createLoader = (filename, data) => {
  fs.writeFileSync(path.join(DIST, filename), data.endsWith('\n') ? data : `${data}\n`, {
    encoding: 'utf-8'
  });
  console.info('[loader]', filename, 'done');
};

/* ---------------------------------- data ---------------------------------- */

const EnhancedDiscord = [
  `/*
  Port of Robb Owen's SynthWave'84 theme for VS Code
  GitHub repo: ${repoUrl}
  Robb Owen's GitHub: https://github.com/robb0wen
*/`,
  importUrl(constants.EnhancedDiscord.css)
].join('\n');

/* ---------------------------------- build --------------------------------- */

fs.ensureDirSync(DIST);

// EnhancedDiscord
createLoader(constants.EnhancedDiscord.loader, EnhancedDiscord);
