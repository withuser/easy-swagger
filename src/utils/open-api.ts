import generateSchema from 'generate-schema';
import { getJsonSchemaReader, getOpenApiWriter, makeConverter } from 'typeconv';
import { httpStatusTextByCode } from 'http-status-ts';
import {
  CreateSwaggerParams,
  RequestFile,
  RequestSchema,
} from 'src/@types/types';

export const toJsonSchema = (name: string, json: any) => {
  if (!json) return null;
  if (json['$schema']) return json;
  return generateSchema.json(name, json);
};

export const createSwaggerDefinitions = async (
  title: string,
  version: string,
  schemas: Omit<RequestSchema, 'response'>[] = []
): Promise<string> => {
  const reader = getJsonSchemaReader();
  const writer = getOpenApiWriter({
    format: 'yaml',
    schemaVersion: '3.0.0',
    title,
    version,
  });
  const { convert } = makeConverter(reader, writer) as any;
  const definitions: { [key: string]: any } = {};
  schemas.forEach(({ name, body }) => {
    const schema = toJsonSchema(name, body);
    if (schema) definitions[name] = toJsonSchema(name, body);
  });

  const { data } = await convert({ data: { definitions } });
  return data;
};

export const createSwaggerDocApi = (
  path: string,
  docs: CreateSwaggerParams[]
) => {
  const yml = docs.map(
    (doc) => `
      ${doc.request.method.toLowerCase()}:
        summary: ${doc.request.description}
        tags: [${doc.request.tag}]
        ${getParameters(doc.request) ? 'parameters:' : ''}
        ${getParameters(doc.request)}
        ${
          !requiredBody(doc.request)
            ? ''
            : `
        requestBody:
          required: true
          content:
            ${doc.request.contentType}:
              schema:
                $ref: '#/components/schemas/${doc.requestSchemaName}'
        `
        }
        responses:${doc.responses
          .map(
            (response) => `
          '${response.status}':
            description: ${httpStatusTextByCode(response.status)}
            ${setHeaders(response.headers)}
            content:
              ${response.content}:
                schema:
                  $ref: '#/components/schemas/${response.schema}'
      `
          )
          .join('')}`
  );
  return `
    ${path}:
      ${yml}`;
};

export const requiredBody = (req: RequestFile): boolean => {
  const method = req.method.toUpperCase();
  if (method === 'GET' || method === 'DELETE') {
    return false;
  }

  return !req.body || !Object.keys(req.body).length;
};

export const setHeaders = (headers: { [key: string]: any }) => {
  if (!headers || !Object.keys(headers).length) return '';

  const strHeaders = Object.entries(headers).map(
    ([key, value]) => `
              ${key}:
                schema:
                  type: ${typeof value}`
  );

  return `headers:
    ${strHeaders.join('')}
  `;
};

export const setParameters = (
  params: { [key: string]: any },
  type: string
): string => {
  if (!params || !Object.keys(params).length) return '';

  return Object.entries(params)
    .map(
      ([key, value]) => `
        - in: ${type}
          name: ${key}
          schema:
            type: ${typeof value}
  `
    )
    .join('');
};

export const getParameters = (req: RequestFile) => {
  const headers = setParameters(req.headers, 'header');
  const params = setParameters(req.params, 'path');
  const queries = setParameters(req.queries, 'query');

  return headers + params + queries;
};
