import type { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import path from 'path';
import { renderFile } from 'ejs';
import { decode } from './helpers/utils';

const pathToTemplateData: Record<
  string,
  { templateName: string; contentType: string }
> = {
  '/': {
    templateName: 'index',
    contentType: 'text/html',
  },
  '/sitemap.xml': {
    templateName: 'sitemap',
    contentType: 'application/xml',
  },
  '/robots.txt': {
    templateName: 'robots',
    contentType: 'text/plain',
  },
};

export const handler: APIGatewayProxyHandlerV2 = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  const { templateName, contentType } = pathToTemplateData[event.rawPath];
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
