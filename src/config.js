import { __dirname } from "./utils.js";

const defaultConfig = {
    port: 3000,
    watchDir: process.cwd(),
    darkTheme: false,
    server: 'localhost'
};

let _config = {
    port: defaultConfig.port,
    watchDir: defaultConfig.watchDir,
    darkTheme: defaultConfig.darkTheme,
    server: defaultConfig.server
};

const cliOptions = {
    port: {
        alias: 'p',
        describe: 'Port number',
        default: defaultConfig.port,
    },
    folder: {
        alias: 'f',
        describe: 'Folder to watch',
        default: defaultConfig.watchDir,
    },
    "dark-theme": {
        alias: 'd',
        describe: 'Swagger UI dark theme',
        default: defaultConfig.darkTheme,
        boolean: true
    },
    server: {
        alias: 's',
        describe: 'Swagger UI server name',
        default: defaultConfig.server
    }
};

const getConfig = () => {
    return _config;
}

const setConfig = (config) => {

    _config = {
        ..._config,
        ...config
    }

    return _config;
}

export { cliOptions, getConfig, setConfig };