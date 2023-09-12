import { writeFileSync, readFileSync } from 'fs';
import { createSchema } from 'genson-js';
import { serveFiles, setup } from 'swagger-ui-express';
import { getConfig } from '../config.mjs';
import { join } from 'path';

const doc = {
    openapi: '3.0.0',
    info: {
        version: '1.0.0',
        title: 'Mock Data API',
        description: 'Documentation for the mock data API',
    },
    servers: [
        {
            url: "/api/",
            description: "localhost"
        }
    ],
    tags: [],
    paths: {}
};

const getHeaders = (headers) => {
    if (headers) {
        return headers.reduce((acc, header) => {
            const key = Object.keys(header)[0];
            acc[key] = {
                schema: {
                    type: "string"
                },
                example: header[key]
            };
            return acc;
        }, {});
    }

    return {};
}

const updateSwagger = (router) => {


    for (const route of router) {

        route.path = route.path.replace('/api', '');
        const swaggerPath = route.path.replace(/:(\w+)/g, '{$1}');

        if (doc.tags.findIndex(tag => tag.name === route.resource) === -1) {
            doc.tags.push({
                name: route.resource,
                description: `Mocked ${route.resource} endpoints`
            });
        }

        // add all methods for the current path
        doc.paths[swaggerPath] = route.methods.reduce((acc, method) => {
            // add the method to the path
            const methodLower = method.method.toLowerCase();

            let methodDesc = {
                description: '',
                tags: [
                    route.resource
                ],
                parameters: [],
                requestBody: {},
                responses: {
                    200: {
                        description: 'Success OK',
                        content: {
                            'application/json': {
                                schema: method.example?.data ? createSchema(method.example.data) : {},
                                example: method.example?.data ? method.example.data : {}
                            }
                        },
                        ...method.example?.headers ? { headers: getHeaders(method.example.headers) } : {}
                    }
                }
            }

            if (route.path.indexOf(':id') > -1) {
                methodDesc.parameters.push({
                    name: "id",
                    in: "path",
                    description: "ID of item to return",
                    required: true,
                    schema: {
                        type: "integer",
                        example: 1
                    }
                });
            }

            switch (methodLower) {
                case 'get':

                    if (route.path === '/echo') {
                        methodDesc.parameters.push({
                            name: "query",
                            in: "query",
                            description: "Query parameters",
                            required: false,
                            schema: {
                                type: "object",
                                example: {
                                    "name": "John Doe",
                                    "age": 20
                                }
                            }
                        });
                    }

                    break;
                case 'put':

                    methodDesc.requestBody = {
                        description: `${route.resource} type object`,
                        required: true,
                        content: {
                            'application/json': {
                                schema: createSchema(method.example.data),
                                example: method.example.data
                            }
                        }
                    }

                    break;
                case 'post':

                    methodDesc.requestBody = {
                        description: `${route.resource} type object`,
                        required: true,
                        content: {
                            'application/json': {
                                schema: createSchema(method.example.data),
                                example: method.example.data
                            }
                        }
                    }

                    break;
                case 'delete':

                    break;

                default:
                    break;
            }

            acc[methodLower] = methodDesc;

            return acc;
        }, {});


    }

}

const registerSwaggerRoutes = (router) => {

    const outputFile = join(getConfig().watchDir, 'swagger.json');
    // write swagger.json file
    writeFileSync(outputFile, JSON.stringify(doc, null, 2), { encoding: 'utf8' })


    var options = {
        swaggerOptions: {
            url: "/api-docs/swagger.json",
        },
    }
    router.get("/api-docs/swagger.json", async (req, res) => {
        const swaggerDocument = JSON.parse(readFileSync(outputFile, 'utf8'));
        res.send(swaggerDocument);
    });
    router.use('/api-docs', serveFiles(undefined, options), setup(undefined, options));
}

export { updateSwagger, registerSwaggerRoutes };