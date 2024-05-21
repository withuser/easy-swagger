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
import { Format, OpenApiObject } from './@types/types';

export default async function main(args: string[]) {
  const rootDir = args[0]?.split('=')[1];

  if (!args.length || !rootDir) throw Error('Invalid params, set root dir');

  const { folders, files } = listAllFiles(rootDir, { recursive: true });

  if (!folders.length) throw Error('Not found projects');

  const formats = files.filter((e) => e.endsWith('/format.json'));

  if (!formats.length) throw Error('Project without format file');

  const openAPi: OpenApiObject = {};
  const dirProjects = formats.map((e) => e.substring(0, e.lastIndexOf('/')));
  dirProjects.forEach((dir) => {
    const { files } = listAllFiles(dir, { recursive: true });
    const infoFiles = files.filter((e) => e.endsWith('info.json'));

    if (!infoFiles.length) throw Error('Not found info files');

    const slashCount = [...new Set(infoFiles.map((e) => e.split('/').length))];

    if (slashCount.length > 1) throw Error('Inconsistent folder structure');

    const apiInfo = readJSONFile<Format>(dir + '/format.json');

    if (!apiInfo) throw Error(`Not found format documento in ${dir}`);

    openAPi[apiInfo.title + '_' + apiInfo.version] = {
      info: apiInfo,
      schemas: infoFiles
        .map((e) => e.substring(0, e.lastIndexOf('/')))
        .map(getSchemasFromFolders),
    };
  });

  for (const api of Object.values(openAPi)) {
    const doc = await createSwaggerDefinitions(
      api.info.title,
      api.info.version,
      api.schemas.map((e) => e.schemas).flat()
    );

    const apis = [];
    const mapSchema = new Map();

    api.schemas.forEach((schema) => {
      const data = mapSchema.get(schema.request.path);
      const responses = schema.schemas.map((e) => e.response).filter((e) => e);
      const newData = { request: schema.request, responses };
      mapSchema.set(schema.request.path, data ? [...data, newData] : [newData]);
    });

    for (const [path, docs] of mapSchema) {
      apis.push(createSwaggerDocApi(path, docs));
    }

    const isSave = await saveDocs(
      `${rootDir}/out/yml/${api.info.title.replaceAll(' ', '-')}.yml`,
      doc.replace('{}', `\ ${apis.join('\r\n')}`)
    );

    if (!isSave) {
      throw Error(`Error when creating yml file of ${api.info.title}`);
    }
  }
}

main(process.argv.slice(2));
