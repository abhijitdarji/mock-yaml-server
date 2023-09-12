import chalk from "chalk";

const __dirname = new URL('.', import.meta.url).pathname;

const logBanner = (message) => {

    if (process.env.APP_RESTARTED == "true") return;

    const banner = chalk.bgBlue.white.bold(' '.repeat(10) + message + ' '.repeat(10));

    const bannerWidth = message.length + 20;

    const separator = chalk.bgBlue(' '.repeat(bannerWidth));

    console.log(separator);
    console.log(banner);
    console.log(separator);
    console.log("\n");
}

const logTable = (data) => {

    if (process.env.APP_RESTARTED == "true") return;

    data.forEach(([label, value]) => {
        const labelPadding = ' '.repeat(20 - label.length);
        console.log(`${chalk.cyan.bold(label + ':')}${labelPadding}${value}`);
    });
}

export { __dirname, logBanner, logTable };