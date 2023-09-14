import { watch } from 'chokidar';
import yargs from 'yargs';
import { isAbsolute, resolve, basename } from 'path';
import { fork } from 'child_process';
import { __dirname, logBanner } from './utils.js';
import chalk from 'chalk';
import { cliOptions } from './config.js';

const argv = yargs(process.argv.slice(2)).options(cliOptions)
    .alias('help', 'h')
    .argv;


// resolve relative folder path to absolute path
const watchDir = !isAbsolute(argv.folder) ? resolve(argv.folder) : argv.folder;

const watcher = watch(watchDir, {
    ignoreInitial: true
});

logBanner("Mock YAML Server");

watcher.on('all', (event, path) => {

    // get file name that changed
    const fileName = basename(path);

    // if the file is a yaml file, restart the server
    if (fileName?.endsWith('.yaml')) {

        console.log(chalk.yellow(`File ${fileName} has been ${event}`));

        restartChildProcess(true);
    }
});

let childProcess = null;

const restartChildProcess = (isRestart) => {

    if (childProcess) {
        childProcess.kill();
    }

    childProcess = fork(`${__dirname}/server.js`, process.argv.slice(2),
        {
            stdio: 'inherit',
            env: {
                ...process.env,
                "APP_RESTARTED": isRestart
            }

        });

    childProcess.on('exit', (code) => {

        if (code === 1) {
            setTimeout(() => {
                process.exit(code);
            }, 1000);
        }
    });
}

restartChildProcess(false);