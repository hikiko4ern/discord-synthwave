// @ts-check

const fs = require('fs');
const URL = require('url').URL;
const path = require('path');

/* -------------------------------- constants ------------------------------- */

const constants = require('./constants.json');
const DIST = path.resolve(path.join(...constants.DIST_LOADERS));

/* --------------------------------- package -------------------------------- */

const package = require('../../package.json');

const repoUrl = package.repository.url.replace('.git', '');

const { author, version } = package;
const [, user, repo] = new URL(repoUrl).pathname.replace('.git', '').split('/');

/* --------------------------------- helpers -------------------------------- */

/** @param {string} name */
const importUrl = name =>
  `@import url('https://rawcdn.githack.com/${user}/${repo}/v${version}/${constants.DIST.join(
    '/'
  )}/${name}');`;

/**
 * @param {string} filename
 * @param {string} data
 */
const createLoader = (filename, data) =>
  fs.writeFile(
    path.join(DIST, filename),
    data.endsWith('\n') ? data : `${data}\n`,
    { encoding: 'utf-8' },
    err => {
      if (err) {
        throw err;
      }

      console.info('[loader]', filename, 'done');
    }
  );

/* ---------------------------------- data ---------------------------------- */

const BetterDiscord = [
  `//META{"name":"SynthWave '84","description":"Port of Robb Owen's SynthWave'84 theme for VS Code","author":"${author}","version":"${version}","source":"${repoUrl}"}*//`,
  importUrl(constants.BetterDiscord.css)
].join('\n');

const EnhancedDiscord = [
  `/*
  Port of Robb Owen's SynthWave'84 theme for VS Code
  GitHub repo: ${repoUrl}
  Robb Owen's GitHub: https://github.com/robb0wen
*/`,
  importUrl(constants.EnhancedDiscord.css)
].join('\n');

/* ---------------------------------- build --------------------------------- */

try {
  fs.mkdirSync(DIST, { recursive: true });
} catch (error) {
  if (error.code !== 'EEXIST') throw error;
}

// BetterDiscord
createLoader(constants.BetterDiscord.loader, BetterDiscord);

// EnhancedDiscord
createLoader(constants.EnhancedDiscord.loader, EnhancedDiscord);
