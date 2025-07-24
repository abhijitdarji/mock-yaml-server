import { updateSwagger } from './swagger.js';
import { generateMockData } from './mock-data.js';
import { db } from '../db/db.js';
import pluralize from 'pluralize';

const apiBase = '/api';

const registerEchoRoute = (router) => {

    router.get(`${apiBase}/echo`, (req, res) => {
        res.send(req.query)
    })

    updateSwagger([{
        resource: 'echo',
        path: `${apiBase}/echo`,
        methods: [{ method: 'GET' }]
    }]);
}

const registerGetAllDBRoute = (router) => {

    router.get(`${apiBase}/_db`, (req, res) => {
        res.send(db.data)
    })

    updateSwagger([{
        resource: 'DB',
        path: `${apiBase}/_db`,
        methods: [{ method: 'GET' }]
    }]);
}

const registerAPIRoutes = (router, definition) => {

    const resource = pluralize.plural(`${definition.resource.toLowerCase()}`);
    const path = `${apiBase}/${resource}`;
    const pathId = `${path}/:id`;
    const randomPath = `${apiBase}/_random/${resource}`;

    let swaggerPaths = [];
    let example = { data: generateMockData(definition), headers: definition.headers };


    const setResponseHeaders = (res, headers) => {
        if (headers) {
            for (const header of headers) {
                const key = Object.keys(header)[0];
                res.setHeader(key, header[key]);
            }
        }
    }


    // define the router function for the current file
    router.get(randomPath, (req, res) => {

        let fakeData = generateMockData(definition);

        setResponseHeaders(res, definition.headers);

        // Set-Cookie: foo=bar; Max-Age=1; Domain=localhost; Path=/; Expires=Mon, 28 Aug 2023 21:23:37 GMT; HttpOnly; Secure; SameSite=Strict
        if (definition.cookies) {
            for (const cookie of definition.cookies) {
                res.cookie(cookie.name, cookie.value, cookie.options);
            }
        }

        res.send(fakeData);
    });

    swaggerPaths.push({
        resource: resource,
        path: randomPath,
        methods: [{ method: 'GET', example: example }]
    });


    // get an item by id
    router.get(pathId, (req, res) => {

        const data = db.getItemById(definition.resource, parseInt(req.params.id));

        setResponseHeaders(res, definition.headers);

        if (!data) {
            res.status(404);
            res.send({ message: `No ${resource} found with id ${req.params.id}` });
            return;
        }

        res.send(data);
    });

    // replace an item by id
    router.put(pathId, (req, res) => {

        const data = db.getItemById(definition.resource, parseInt(req.params.id));

        setResponseHeaders(res, definition.headers);

        if (!data) {
            res.status(404);
            res.send({ message: `No ${resource} found with id ${req.params.id}` });
            return;
        }

        const updatedItem = req.body;

        db.updateItemById(definition.resource, parseInt(req.params.id), updatedItem);

        db.write();

        res.send(updatedItem);
    });

    // partially update an item by id (PATCH)
    router.patch(pathId, (req, res) => {

        const data = db.getItemById(definition.resource, parseInt(req.params.id));

        setResponseHeaders(res, definition.headers);

        if (!data) {
            res.status(404);
            res.send({ message: `No ${resource} found with id ${req.params.id}` });
            return;
        }

        // Merge existing data with partial update
        const updatedItem = { ...data, ...req.body, id: parseInt(req.params.id) };

        db.updateItemById(definition.resource, parseInt(req.params.id), updatedItem);
        db.write();

        res.send(updatedItem);
    });


    // delete an item by id
    router.delete(pathId, (req, res) => {

        const data = db.getItemById(definition.resource, parseInt(req.params.id));

        setResponseHeaders(res, definition.headers);

        if (!data) {
            res.status(404);
            res.send({ message: `No ${resource} found with id ${req.params.id}` });
            return;
        }

        db.data[definition.resource] = db.data[definition.resource].filter(item => item.id !== parseInt(req.params.id));

        db.write();

        res.status(204);
        res.send();
    });

    swaggerPaths.push({
        resource: resource,
        path: pathId,
        methods: [
            { method: 'GET', example: example },
            { method: 'PUT', example: example },
            { method: 'PATCH', example: example },
            { method: 'DELETE', example: example }
        ]
    });

    // get all items
    router.get(path, (req, res) => {

        const data = db.data[definition.resource];

        setResponseHeaders(res, definition.headers);

        res.send(data);

    });

    // add an item
    router.post(path, (req, res) => {

        const data = db.data[definition.resource];

        setResponseHeaders(res, definition.headers);

        const newItem = req.body;

        db.data[definition.resource].push(newItem);

        db.write();

        res.status(201);
        res.send(newItem);
    });


    swaggerPaths.push({
        resource: resource,
        path: path,
        methods: [
            { method: 'GET', example: { data: [{ ...example.data }], headers: definition.headers } },
            { method: 'POST', example: example }
        ]
    });

    updateSwagger(swaggerPaths);

}

export { registerAPIRoutes, registerEchoRoute, registerGetAllDBRoute }
