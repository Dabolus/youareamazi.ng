import { Middleware } from 'koa';
import { registerFont, createCanvas, Image, loadImage } from 'canvas';
import TextToSvg from 'text-to-svg';
import pngToIco from 'png-to-ico';
import path from 'path';
import fs from 'fs';

const fontPath = path.resolve(__dirname, 'fonts/google-sans-bold.ttf');

registerFont(fontPath, {
  family: 'Product Sans',
  weight: 'bold',
});

const textToSvg = TextToSvg.loadSync(fontPath);

const baseTemplatesPath = path.resolve(__dirname, 'templates');

const compressor = 1;
const minFontSize = -Infinity;
const maxFontSize = Infinity;

const squareIconPromise = loadImage(
  path.resolve(baseTemplatesPath, 'icon-square.png'),
);
const roundIconPromise = loadImage(
  path.resolve(baseTemplatesPath, 'icon-round.png'),
);

interface ImageTemplate {
  background?: Promise<Image>;
  width: number;
  height: number;
  type: 'png' | 'svg' | 'ico';
}

interface TextTemplate {
  content: string;
  type: 'text';
  fileType: string;
}

const jsonEscapeMap: Record<string, string> = {
  '\b': '\\b',
  '\f': '\\f',
  '\n': '\\n',
  '\r': '\\r',
  '\t': '\\t',
  '"': '\\"',
  '\\': '\\\\',
};

type Template = ImageTemplate | TextTemplate;

const templatesConfig: Record<string, Template> = {
  'opengraph.png': {
    background: loadImage(path.resolve(baseTemplatesPath, 'opengraph.png')),
    width: 2400,
    height: 1260,
    type: 'png',
  },
  'android-chrome-512x512.png': {
    background: squareIconPromise,
    width: 512,
    height: 512,
    type: 'png',
  },
  'android-chrome-192x192.png': {
    background: squareIconPromise,
    width: 192,
    height: 192,
    type: 'png',
  },
  'apple-touch-icon.png': {
    background: squareIconPromise,
    width: 180,
    height: 180,
    type: 'png',
  },
  'favicon-194x194.png': {
    background: roundIconPromise,
    width: 194,
    height: 194,
    type: 'png',
  },
  'favicon-32x32.png': {
    background: roundIconPromise,
    width: 32,
    height: 32,
    type: 'png',
  },
  'favicon-16x16.png': {
    background: roundIconPromise,
    width: 16,
    height: 16,
    type: 'png',
  },
  'favicon.ico': {
    background: roundIconPromise,
    width: 256,
    height: 256,
    type: 'ico',
  },
  'mstile-310x310.png': {
    width: 310,
    height: 310,
    type: 'png',
  },
  'mstile-310x150.png': {
    width: 310,
    height: 150,
    type: 'png',
  },
  'mstile-150x150.png': {
    width: 150,
    height: 150,
    type: 'png',
  },
  'mstile-70x70.png': {
    width: 70,
    height: 70,
    type: 'png',
  },
  'safari-pinned-tab.svg': {
    width: 16,
    height: 16,
    type: 'svg',
  },
  'site.webmanifest': {
    content: fs.readFileSync(
      path.resolve(baseTemplatesPath, 'site.webmanifest'),
      'utf8',
    ),
    type: 'text',
    fileType: 'application/manifest+json',
  },
};

const templatesRegex = new RegExp(
  `\\/images\\/icons\\/(${Object.keys(templatesConfig).join('|')})`,
);

const icons: () => Middleware<{ name: string }> = () => async (ctx, next) => {
  const templateName = ctx.request.path.match(templatesRegex)?.[1];

  if (!templateName) {
    return next();
  }

  const { [templateName]: template } = templatesConfig;

  switch (template.type) {
    case 'png':
    case 'svg':
    case 'ico': {
      const { background, width, height, type = 'png' } = template;

      const nameFontSize = Math.max(
        Math.min(width / (compressor * 10), maxFontSize),
        minFontSize,
      );
      const youAreAmazingFontSize = width * 0.07;

      if (type === 'svg') {
        const baseOptions = {
          x: width / 2,
          y: height / 2,
        };

        const namePath = textToSvg.getD(ctx.state.name, {
          ...baseOptions,
          fontSize: nameFontSize,
          anchor: 'center bottom',
        });
        const youAreAmazingPath = textToSvg.getD('you are amazing', {
          ...baseOptions,
          fontSize: youAreAmazingFontSize,
          anchor: 'center top',
        });

        ctx.type = 'svg';
        ctx.body = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="${namePath} ${youAreAmazingPath}"/></svg>`;
      } else {
        const canvas = createCanvas(width, height);
        const context = canvas.getContext('2d');

        if (background) {
          const image = await background;

          context.drawImage(image, 0, 0, width, height);
        }

        context.font = `bold ${nameFontSize}px 'Google Sans'`;
        context.textAlign = 'center';
        context.textBaseline = 'bottom';
        context.fillStyle = '#fff';
        context.fillText(ctx.state.name, width / 2, height / 2);

        context.font = `bold ${youAreAmazingFontSize}px 'Google Sans'`;
        context.textBaseline = 'top';
        context.fillText('you are amazing', width / 2, height / 2);

        const png = canvas.toBuffer('image/png');

        if (template.type === 'ico') {
          const ico = await pngToIco(png);

          ctx.type = 'ico';
          ctx.body = ico;
        } else {
          ctx.type = 'png';
          ctx.body = png;
        }
      }

      break;
    }
    case 'text': {
      const { content, fileType } = template;

      ctx.type = fileType;
      // TODO: use replaceAll instead
      ctx.body = content.replace(
        /{{name}}/g,
        ctx.state.name.replace(
          /([\b\f\n\r\t\"\\])/g,
          (_, match) => jsonEscapeMap[match],
        ),
      );
    }
  }

  return next();
};

export default icons;
