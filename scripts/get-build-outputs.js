const { promises: fs } = require('fs');
const path = require('path');

module.exports['ejs-renderer'] = async () => {
  const raw = await fs.readFile(
    path.join(__dirname, '../static/apps/motivation/index.html'),
    'utf8',
  );

  const tagsTree = raw
    .split(/[\r\n]+/)
    .filter(Boolean)
    .map(row => {
      const tag = row.slice(1, row.indexOf(' '));
      const attributes = Object.fromEntries(
        Array.from(row.matchAll(/\s*(\w+)(?:="([^"]+)")[\s>]*/g)).map(
          ([, key, val]) => [key, val],
        ),
      );

      return {
        tag,
        ...attributes,
      };
    });

  return JSON.stringify(tagsTree);
};
