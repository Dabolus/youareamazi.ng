import type { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import path from 'path';
import { renderFile } from 'ejs';
import { decode } from './helpers/utils';

const pathToTemplateData: Record<
  string,
  { templateName: string; contentType: string }
> = {
  'index.html': {
    templateName: 'index',
    contentType: 'text/html',
  },
  'sitemap.xml': {
    templateName: 'sitemap',
    contentType: 'application/xml',
  },
  'robots.txt': {
    templateName: 'robots',
    contentType: 'text/plain',
  },
  'site.webmanifest': {
    templateName: 'site.webmanifest',
    contentType: 'application/manifest+json',
  },
  'browserconfig.xml': {
    templateName: 'browserconfig',
    contentType: 'application/xml',
  },
};

export const handler: APIGatewayProxyHandlerV2 = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  const config = pathToTemplateData[event.pathParameters?.file || 'index.html'];

  if (!config) {
    return {
      statusCode: 404,
      body: 'Not found',
    };
  }

  const { templateName, contentType } = config;
  const buildOutput: Record<string, string>[] = JSON.parse(
    process.env.BUILD_OUTPUT!,
  );

  const rendered = await renderFile(
    path.join(__dirname, 'templates', 'ejs', `${templateName}.ejs`),
    {
      name: decode(event.requestContext.domainPrefix),
      encodedName: event.requestContext.domainPrefix,
      // Add the domain prefix to each URL in the build output array
      buildOutput: buildOutput.map(obj =>
        Object.fromEntries(
          Object.entries(obj).map(([key, val]) => [
            key,
            val.startsWith('/assets')
              ? `${process.env.STATIC_ASSETS_BASE_URL}/apps/motivation${val}`
              : val,
          ]),
        ),
      ),
    },
    { async: true },
  );

  return {
    statusCode: 200,
    headers: {
      'content-type': contentType,
    },
    body: rendered,
  };
};
