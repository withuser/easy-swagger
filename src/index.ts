#! /usr/bin/env node
import {
  getSchemasFromFolders,
  listAllFiles,
  readJSONFile,
  saveDocs,
} from './utils/files.js';
import {
  createSwaggerDefinitions,
  createSwaggerDocApi,
} from './utils/open-api.js';
import { APIInfo, CreateSwaggerParams, OpenApiObject } from './@types/types';

export default async function main(args: string[]) {
  const rootDir = args[0]?.split('=')[1];

  if (!args.length || !rootDir) throw Error('Invalid params, set root dir');

  const { folders, files } = listAllFiles(rootDir, { recursive: true });

  if (!folders.length) throw Error('Not found projects');

  const formats = files.filter((e) => e.endsWith('/api.json'));

  if (!formats.length) throw Error('Project without API file');

  const openAPi: OpenApiObject = {};
  const dirProjects = formats.map((e) => e.substring(0, e.lastIndexOf('/')));
  dirProjects.forEach((dir) => {
    const { files } = listAllFiles(dir, { recursive: true });
    const requestFiles = files.filter((e) => e.endsWith('request.json'));

    if (!requestFiles.length) throw Error('Not found info files');

    const slashCount = [
      ...new Set(requestFiles.map((e) => e.split('/').length)),
    ];

    if (slashCount.length > 1) throw Error('Inconsistent folder structure');

    const apiInfo = readJSONFile<APIInfo>(dir + '/api.json');

    if (!apiInfo) throw Error(`Not found API documento in ${dir}`);

    openAPi[apiInfo.title + '_' + apiInfo.version] = {
      info: apiInfo,
      schemas: requestFiles
        .map((e) => e.substring(0, e.lastIndexOf('/')))
        .map(getSchemasFromFolders),
    };
  });

  for (const api of Object.values(openAPi)) {
    const apis = [];
    const mapSchema = new Map<string, CreateSwaggerParams[]>();

    api.schemas.forEach((schema) => {
      const data = mapSchema.get(schema.request.path);
      const newData: CreateSwaggerParams = {
        request: schema.request,
        requestSchemaName: schema.requestSchemaName,
        responses: schema.schemas.map((e) => e.response),
      };
      mapSchema.set(schema.request.path, data ? [...data, newData] : [newData]);
    });

    for (const [path, docs] of mapSchema) {
      apis.push(createSwaggerDocApi(path, docs));
    }

    const fileId = api.info.title + '-' + api.info.version;
    const filename = `${fileId.replaceAll(' ', '-')}.yml`;
    const doc = await createSwaggerDefinitions(
      api.info.title,
      api.info.version,
      api.schemas
        .map(({ schemas, request, requestSchemaName: name }) => [
          ...schemas,
          { name, body: request.body },
        ])
        .flat()
    );
    const ymlContent = doc.replace('{}', `\ ${apis.join('\r\n')}`);
    const isSave = await Promise.all([
      saveDocs(`./out/${filename}`, ymlContent),
      saveDocs(`./ui/client/docs/yml/${filename}`, ymlContent, true),
    ]);

    if (isSave.includes(false)) {
      throw Error(`Error when creating yml file of ${api.info.title}`);
    }
  }

  // save json ui
  await saveDocs(
    './ui/client/docs/json/open-api.json',
    JSON.stringify(
      Object.values(openAPi).map((api) => ({
        description: api.info.description,
        path: `${api.info.title.replaceAll(' ', '-')}/${api.info.version}`,
        title: api.info.title,
      }))
    ),
    true
  );
}

main(process.argv.slice(2));
