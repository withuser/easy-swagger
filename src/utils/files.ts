import fs, { promises } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { EndPointInfo, FolderSchema, ListFolderOptions } from '../@types/types';

/**
 * Reads a JSON file and parses it into a JavaScript object.
 *
 * @template T - The expected type of the parsed object.
 * @param {string} filePath - The path to the JSON file to read.
 * @returns {T | null} The contents of the JSON file parsed as an object of type `T`, or `null` if the file does not exist.
 *
 */
export function readJSONFile<T = any>(filePath: string): T | null {
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } else {
    return null;
  }
}

/**
 * Lists all files and folders within a specified directory.
 *
 * @param {string} baseDir - The base directory to start listing files and folders.
 * @param {Partial<ListFolderOptions>} [options={}] - Optional settings to control the listing process.
 * @param {string[]} [options.files] - Array to store found files.
 * @param {string[]} [options.folders] - Array to store found folders.
 * @param {boolean} [options.recursive=false] - Whether to list files and folders recursively.
 *
 * @returns {{ files: string[], folders: string[] }} An object containing arrays of file paths and folder paths.
 *
 */
export function listAllFiles(
  baseDir: string,
  options: Partial<ListFolderOptions> = {}
): { files: string[]; folders: string[] } {
  const defaultOptions: ListFolderOptions = {
    files: [],
    folders: [],
    recursive: false,
  };
  const args = { ...defaultOptions, ...options };
  const { files, folders, recursive } = args;
  const allDirs = fs.readdirSync(baseDir);

  allDirs.forEach((dir) => {
    const filePath = path.join(baseDir, dir);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      folders.push(filePath);
      if (recursive) listAllFiles(filePath, args);
    } else {
      files.push(filePath);
    }
  });

  return { files, folders };
}

/**
 * Retrieves schemas from the specified folder.
 *
 * @param {string} folder - The folder to read schemas from.
 * @returns {FolderSchema} An object representing the folder schema.
 *
 * @throws Will throw an error if the endpoint information file is not found.
 *
 */
export function getSchemasFromFolders(folder: string): FolderSchema {
  const { files, folders } = listAllFiles(folder, { recursive: true });
  const serviceName = folder.split('').pop()?.replaceAll('-', '_');
  const resSchemaName = `${serviceName}_REQUEST`.toUpperCase();

  const responseSchemas = folders.map((folder, index) => {
    const status = folder.split('/').pop() || '200';
    const schemaName = `${serviceName}_${status}`.toUpperCase();

    return {
      name: schemaName,
      json: readJSONFile(files[index]),
      response: {
        content: 'application/json',
        status: parseInt(status),
        schema: schemaName,
      },
    };
  });

  const jsonReq = readJSONFile(folder + '/request.json');
  const reqInfo = readJSONFile<EndPointInfo>(folder + '/info.json');

  if (!reqInfo) throw Error(`Endpoint without info file in ${folder}`);

  return {
    schemas: !jsonReq
      ? responseSchemas
      : [
          ...responseSchemas,
          {
            name: resSchemaName,
            json: readJSONFile(folder + '/request.json'),
            response: null,
          },
        ],
    request: {
      ...reqInfo,
      requestBody: Boolean(jsonReq),
      schema: resSchemaName,
    },
  };
}

/**
 * Saves the provided content to a JSON file at a specified path.
 * If the necessary directories do not exist, they will be created.
 *
 * @param {string} filename - The name of the file to save.
 * @param {string} content - The content to write to the file.
 * @returns {Promise<boolean>} - A promise that resolves to `true` if the file was saved successfully, or `false` if an error occurred.
 *
 */
export async function saveDocs(
  filename: string,
  content: string
): Promise<boolean> {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const dirPath = path.join(__dirname, 'out');
    const filePath = path.join(dirPath, filename);
    const dirname = path.dirname(filePath);

    if (!fs.existsSync(dirname)) {
      fs.mkdirSync(dirname, { recursive: true });
    }

    await promises.writeFile(filePath, content, 'utf8');
    return true;
  } catch (error) {
    return false;
  }
}
