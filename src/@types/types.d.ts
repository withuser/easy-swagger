export interface ListFolderOptions {
  files: string[];
  folders: string[];
  recursive: boolean;
}

export interface Format {
  title: string;
  version: string;
  servers: Array<{
    description: string;
    url: string;
  }>;
}

export interface EndPointInfo {
  content: string;
  method: string;
  summary: string;
  path: string;
  tag: string;
}

export interface EndPointInfoDoc extends EndPointInfo {
  requestBody: boolean;
  schema: string;
}


export interface ResponseData {
  content: string;
  status: number;
  schema: string;
}

export interface RequestSchema {
  name: string;
  json: any;
  response: ResponseData | null;
}

export interface FolderSchema {
  schemas: Array<RequestSchema>;
  request: EndPointInfoDoc;
}

export interface OpenApiObject {
  [key: string]: {
    info: Format;
    schemas: FolderSchema[];
  };
}
