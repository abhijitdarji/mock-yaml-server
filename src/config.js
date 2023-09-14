import { __dirname } from "./utils.js";

const defaultConfig = {
    port: 3000,
    watchDir: process.cwd()
};

let _config = {
    port: defaultConfig.port,
    watchDir: defaultConfig.watchDir
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