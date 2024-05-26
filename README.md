# EASY SWAGGER

This package allows you to create your swagger documentation in a simple and easy way.

## Getting Started

Install package

```bash
# npm
npm install easy-swagger
# yarn
yarn add easy-swagger
```

Create swagger document

```bash
npx easy-swagger --root=./src
```

Generate interactive API 

```bash
npx easy-swagger-ui
```

## Folder structure

### API with controllers

```sh
└── src/
    └── api-name/
        └── api-version/
            ├── api.json
            └── controller-name/
                └── service-name/
                    ├── request.json
                    └── status-code/
                        └── response.json
```

#### Example:

```sh
└── src/
    └── pets/
        └── v1/
        │   ├── api.json
        │   └── users/
        │   │   └── login/
        │   │       ├── request.json
        │   │       └── 200/
        │   │       │   └── response.json
        │   │       └── 401/
        │   │       │   └── response.json
        │   │       └── 500/
        │   │           └── response.json
        │   └── stores/
        │       └── inventory/
        │           ├── request.json
        │           └── 200/
        │           │   └── response.json
        │           └── 400/
        │               └── response.json
        └── v2/
            ├── api.json
            └── users/
            │   └── sign-in/
            │       ├── request.json
            │       └── 200/
            │       │   └── response.json
            │       └── 401/
            │          └── response.json
            └── stores/
                └── inventory/
                    ├── request.json
                    └── 200/
                    │   └── response.json
                    └── 500/
                        └── response.json
```

### API without controllers

```sh
└── src/
    └── api-name/
        └── api-version/
            ├── api.json
            └── service-name/
                ├── request.json
                └── status-code/
                    └── response.json
```

#### Example:

```sh
└── src/
    └── pets/
        └── v1/
        │   ├── api.json
        │   └── login/
        │   │   ├── request.json
        │   │   └── 200/
        │   │   │   └── response.json
        │   │   └── 401/
        │   │   │   └── response.json
        │   │   └── 500/
        │   │       └── response.json
        │   └── inventory/
        │       ├── request.json
        │       └── 200/
        │       │   └── response.json
        │       └── 400/
        │           └── response.json
        └── v2/
            ├── api.json
            └── sign-in/
            │   ├── request.json
            │   └── 200/
            │   │   └── response.json
            │   └── 401/
            │       └── response.json
            └── inventory/
                ├── request.json
                └── 200/
                │   └── response.json
                └── 500/
                    └── response.json
```

### Documents

#### `api.json`

```json
{
  "title": "API name",
  "description": "API description",
  "version": "v1",
  "servers": [
    {
      "description": "Production server URL",
      "url": "https://api.example.com/v1"
    },
    {
      "description": "Test server URL",
      "url": "https://test.example.com/v1"
    }
  ]
}
```

| Key          | Description                 | Type Value |
|--------------|-----------------------------|------------|
| title        | The name of the API         | string     |
| description  | A description of the API    | string     |
| version      | The version of the API      | string     |
| servers      | List of server objects      | list       |

**Server list:**

| Key          | Description                 | Type Value |
|--------------|-----------------------------|------------|
| description  | A description of the server | string     |
| url          | The URL of the server       | string     |


#### `request.json`

```json
{
  "body": {
    "username": "",
    "password": "",
    "level": 10
  },
  "headers": {
    "token": "Bearer token",
    "x-api-key": "api-key"
  },
  "queries": {
    "limit": 10,
    "page": 1,
    "search": ""
  },
  "params": {
    "id": 10
  },
  "form": {},
  "contentType": "application/json",
  "method": "post",
  "description": "Generic description",
  "path": "/controller/endpoint/{id}",
  "tag": "tag-group"
}
```

| Key          | Description                    | Type Value |
|--------------|--------------------------------|------------|
| body         | Request body parameters        | Object     |
| headers      | Request headers                | Object     |
| queries      | URL query parameters           | Object     |
| params       | URL path parameters            | Object     |
| form         | Form data parameters           | Object     |
| contentType  | Content type of the request    | string     |
| method       | HTTP method                    | string     |
| description  | Description of the request     | string     |
| path         | Endpoint path                  | string     |
| tag          | Tag group                      | string     |

#### `response.json`

```json
{
  "body": {
    "message": "",
    "success": true,
    "errores": []
  },
  "headers": {
    "token": "Bearer token",
    "time-stamp": ""
  }
}
```

| Key          | Description              | Type Value |
|--------------|--------------------------|------------|
| body         | Response body parameters | Object     |
| headers      | Response headers         | Object     |

## License

The Easy Swagger is licensed under the [CC-BY-NC-4.0 license](https://creativecommons.org/licenses/by-nc/4.0/).
