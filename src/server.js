import express, { Router, json } from 'express'
import cors from 'cors'
import { registerAPIRoutes, registerEchoRoute, registerGetAllDBRoute } from './api/routes.js'
import yargs from 'yargs'
import { registerSwaggerRoutes } from './api/swagger.js'
import { resolve, join } from 'path'
import { setConfig, cliOptions } from './config.js'
import { readdirSync, readFileSync } from 'fs'
import { load } from 'js-yaml'
import { validateSchema } from './api/resource-schema.js'
import { seedDB } from './db/db.js'
import { __dirname, logTable } from './utils.js'
import { initDB } from './db/db.js'
import chalk from 'chalk'


const router = Router();

const app = express()

const argv = yargs(process.argv.slice(2)).options(cliOptions)
    .alias('help', 'h')
    .argv;


const watchDir = resolve(argv.folder);

setConfig({
    port: argv.port,
    watchDir: watchDir,
    darkTheme: argv['dark-theme'],
    server: argv.server
})

const PORT = argv.port;

app.use(cors());

app.get('/', (req, res) => {
    res.send('<html><body>Mock YAML Server: Visit <a href="/api-docs">Swagger UI<a> for API documentation</body></html>');
});

app.use(json());
app.use('/assets', express.static(join(__dirname, 'assets')))

registerEchoRoute(router);
registerGetAllDBRoute(router);

let resourceCount = 0;

const readFolder = (folderPath) => {

    const files = readdirSync(folderPath).filter(file => file.endsWith('.mock.yaml') || file.endsWith('.mock.yml'));

    if (!files.length) return false;

    if (files.length) {
        resourceCount = files.length;
        initDB(watchDir);
    }

    for (const file of files) {
        const filePath = `${folderPath}/${file}`;
        const fileData = readFileSync(filePath, 'utf8');
        const parsedData = load(fileData);
        const validateSchemaResult = validateSchema(parsedData);

        if (validateSchemaResult.error) {
            console.log(`Error parsing ${file}: ${validateSchemaResult.error}`);
            return;
        }

        seedDB(parsedData, parsedData.seed || 1);

        registerAPIRoutes(router, parsedData);
    }

    return true;

}

const found = readFolder(watchDir);

if (!found) {
    console.log(chalk.red(`No YAML files found in ${watchDir}`));
    process.exit(1);
}

app.use(router);

registerSwaggerRoutes(app);

app.listen(PORT, () => {

    logTable([
        ['Watch Folder', watchDir],
        ['Resources', resourceCount],
        ['Port', PORT],
        ['API Url', `http://localhost:${PORT}/api`],
        ['Swagger UI', `http://localhost:${PORT}/api-docs`]
    ]);

});