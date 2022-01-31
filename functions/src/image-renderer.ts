import type { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { registerFont, createCanvas, loadImage } from 'canvas';
import TextToSvg from 'text-to-svg';
import pngToIco from 'png-to-ico';
import path from 'path';
import { decode } from './helpers/utils';

const fontPath = path.join(
  __dirname,
  'assets',
  'fonts',
  'google-sans-bold.ttf',
);

registerFont(fontPath, {
  family: 'Google Sans',
  weight: 'bold',
});

const textToSvg = TextToSvg.loadSync(fontPath);

const compressor = 1;
const minFontSize = -Infinity;
const maxFontSize = Infinity;

interface ImageTemplate {
  backgroundTemplateName?: string;
  width: number;
  height: number;
  type: 'png' | 'svg+xml' | 'x-icon';
}

const templatesConfig: Record<string, ImageTemplate> = {
  'opengraph.png': {
    backgroundTemplateName: 'opengraph.png',
    width: 2400,
    height: 1260,
    type: 'png',
  },
  'android-chrome-512x512.png': {
    backgroundTemplateName: 'icon-square.png',
    width: 512,
    height: 512,
    type: 'png',
  },
  'android-chrome-192x192.png': {
    backgroundTemplateName: 'icon-square.png',
    width: 192,
    height: 192,
    type: 'png',
  },
  'apple-touch-icon.png': {
    backgroundTemplateName: 'icon-square.png',
    width: 180,
    height: 180,
    type: 'png',
  },
  'favicon-194x194.png': {
    backgroundTemplateName: 'icon-round.png',
    width: 194,
    height: 194,
    type: 'png',
  },
  'favicon-32x32.png': {
    backgroundTemplateName: 'icon-round.png',
    width: 32,
    height: 32,
    type: 'png',
  },
  'favicon-16x16.png': {
    backgroundTemplateName: 'icon-round.png',
    width: 16,
    height: 16,
    type: 'png',
  },
  'favicon.ico': {
    backgroundTemplateName: 'icon-round.png',
    width: 256,
    height: 256,
    type: 'x-icon',
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
    type: 'svg+xml',
  },
};

export const handler: APIGatewayProxyHandlerV2 = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  if (
    !event.pathParameters?.image ||
    !templatesConfig[event.pathParameters.image]
  ) {
    return {
      statusCode: 404,
      body: 'Not found',
    };
  }

  const name = decode(event.requestContext.domainPrefix);
  const {
    backgroundTemplateName,
    width,
    height,
    type = 'png',
  } = templatesConfig[event.pathParameters.image];

  const nameFontSize = Math.max(
    Math.min(width / (compressor * 10), maxFontSize),
    minFontSize,
  );
  const youAreAmazingFontSize = width * 0.07;

  if (type === 'svg+xml') {
    const baseOptions = {
      x: width / 2,
      y: height / 2,
    };

    const namePath = textToSvg.getD(name, {
      ...baseOptions,
      fontSize: nameFontSize,
      anchor: 'center bottom',
    });
    const youAreAmazingPath = textToSvg.getD('you are amazing', {
      ...baseOptions,
      fontSize: youAreAmazingFontSize,
      anchor: 'center top',
    });

    return {
      statusCode: 200,
      headers: {
        'content-type': `image/${type}`,
      },
      body: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="${namePath} ${youAreAmazingPath}"/></svg>`,
    };
  } else {
    const canvas = createCanvas(width, height);
    const context = canvas.getContext('2d');

    if (backgroundTemplateName) {
      const image = await loadImage(
        path.join(__dirname, 'templates', 'image', backgroundTemplateName),
      );

      context.drawImage(image, 0, 0, width, height);
    }

    context.font = `bold ${nameFontSize}px 'Google Sans'`;
    context.textAlign = 'center';
    context.textBaseline = 'bottom';
    context.fillStyle = '#fff';
    context.fillText(name, width / 2, height / 2);

    context.font = `bold ${youAreAmazingFontSize}px 'Google Sans'`;
    context.textBaseline = 'top';
    context.fillText('you are amazing', width / 2, height / 2);

    const png = canvas.toBuffer('image/png');

    if (type !== 'x-icon') {
      return {
        statusCode: 200,
        headers: {
          'content-type': `image/${type}`,
        },
        body: png.toString('base64'),
        isBase64Encoded: true,
      };
    }

    const ico = await pngToIco(png);

    return {
      statusCode: 200,
      headers: {
        'content-type': `image/${type}`,
      },
      body: ico.toString('base64'),
      isBase64Encoded: true,
    };
  }
};
