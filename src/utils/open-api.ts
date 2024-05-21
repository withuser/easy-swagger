import generateSchema from 'generate-schema';
import { getJsonSchemaReader, getOpenApiWriter, makeConverter } from 'typeconv';
import { httpStatusTextByCode } from 'http-status-ts';
import { EndPointInfoDoc, RequestSchema, ResponseData } from 'src/@types/types';

export const toJsonSchema = (name: string, json: any) => {
  if (!json) return null;
  if (json['$schema']) return json;
  return generateSchema.json(name, [json]);
};

export const createSwaggerDefinitions = async (
  title: string,
  version: string,
  schemas: RequestSchema[] = []
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
  schemas.forEach(({ name, json }) => {
    const schema = toJsonSchema(name, json);
    if (schema) definitions[name] = toJsonSchema(name, json);
  });

  const { data } = await convert({ data: { definitions } });
  return data;
};

export const createSwaggerDocApi = (
  path: string,
  docs: { request: EndPointInfoDoc; responses: ResponseData[] }[]
) => {
  const yml = `
    ${docs
      .map(
        (doc) =>
          `
        ${doc.request.method.toLowerCase()}:
          summary: ${doc.request.summary}
          tags: [${doc.request.tag}]
          ${
            !doc.request.requestBody
              ? ''
              : `
          requestBody:
            required: true
            content:
              ${doc.request.content}:
                schema:
                  $ref: '#/components/schemas/${doc.request.schema}'
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
