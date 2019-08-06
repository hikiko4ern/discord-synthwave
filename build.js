const fs = require('fs');
const sass = require('sass');

const sassOptions = {
  sourceMap: false,
  outputStyle: 'compressed'
};

// - - -

const render = data => sass.renderSync({ ...sassOptions, data }).css;

const renderBD = data =>
  render(
    data
      .replace(/^(\.hljs.* \{)$/gm, '#app-mount .da-markup $1')
      .replace(/^([\s]*(([\w\d])-*)*\:.*);$/gm, '$1 !important;')
  );

const renderED = data =>
  render(
    data
      .replace(/^(\.hljs.* \{)$/gm, '.theme-dark $1')
      .replace(/^([\s]*(([\w\d])-*)*\:.*);$/gm, '$1 !important;')
  );

// - - -

try {
  fs.mkdirSync('dist');
} catch (error) {
  if (error.code !== 'EEXIST') throw error;
}

data = fs.readFileSync('src/style.scss', 'utf-8');

fs.writeFileSync('dist/bd.css', renderBD(data));
fs.writeFileSync('dist/ed.css', renderED(data));
