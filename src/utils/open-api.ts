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
  const yml = `
    ${docs
      .map(
        (doc) =>
          `
        ${doc.request.method.toLowerCase()}:
          summary: ${doc.request.description}
          tags: [${doc.request.tag}]
          ${
            requiredBody(doc.request)
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
          responses:
            ${doc.responses
              .map(
                (response) => `
                '${response.status}':
                    description: ${httpStatusTextByCode(response.status)}
                    content:
                      ${response.content}:
                        schema:
                          $ref: '#/components/schemas/${response.schema}'
              `
              )
              .join('')}
      `
      )
      .join('')}
  `;
  return `
    ${path}:
      ${yml}
    `;
};

export const requiredBody = (req: RequestFile): boolean => {
  return Boolean(
    !req.body ||
      !Object.keys(req.body).length ||
      req.method.toUpperCase() === 'GET' ||
      req.method.toUpperCase() === 'DELETE'
  );
};
