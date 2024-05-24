export interface ListFolderOptions {
  files: string[];
  folders: string[];
  recursive: boolean;
}

export interface APIInfo {
  description: string;
  title: string;
  version: string;
  servers: Array<{
    description: string;
    url: string;
  }>;
}

export interface ResponseData {
  content: string;
  status: number;
  schema: string;
}

export interface RequestSchema {
  name: string;
  body: { [key: string]: any };
  response: ResponseData;
}

export interface FolderSchema {
  schemas: Array<RequestSchema>;
  request: RequestFile;
  requestSchemaName: string;
}

export interface OpenApiObject {
  [key: string]: {
    info: APIInfo;
    schemas: FolderSchema[];
  };
}

export interface RequestFile {
  body: { [key: string]: any };
  form: { [key: string]: any };
  headers: { [key: string]: any };
  queries: { [key: string]: any };
  params: { [key: string]: any };
  contentType: string;
  description: string;
  method: string;
  path: string;
  tag: string;
}

export interface CreateSwaggerParams {
  request: RequestFile;
  requestSchemaName: string;
  responses: ResponseData[];
}
