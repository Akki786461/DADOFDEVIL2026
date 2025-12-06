const chalk = require('chalk');
const moment = require('moment-timezone');
const fs = require('fs-extra');
const path = require('path');

const logDir = path.join(__dirname, '../system/database/botdata/logs');
fs.ensureDirSync(logDir);

const getTime = () => moment().tz('Asia/Karachi').format('hh:mm:ss A');
const getDate = () => moment().tz('Asia/Karachi').format('DD/MM/YYYY');
const getDateTime = () => `${getTime()} || ${getDate()}`;

const writeLog = (type, message) => {
  const date = moment().tz('Asia/Karachi').format('YYYY-MM-DD');
  const logFile = path.join(logDir, `${date}.log`);
  const logEntry = `[${getDateTime()}] [${type}] ${message}\n`;
  fs.appendFileSync(logFile, logEntry);
};

const logs = {
  info: (title, ...args) => {
    const message = args.join(' ');
    console.log(chalk.blue(`[${getTime()}]`), chalk.cyan(`[${title}]`), message);
    writeLog('INFO', `[${title}] ${message}`);
  },

  success: (title, ...args) => {
    const message = args.join(' ');
    console.log(chalk.green(`[${getTime()}]`), chalk.greenBright(`[${title}]`), message);
    writeLog('SUCCESS', `[${title}] ${message}`);
  },

  error: (title, ...args) => {
    const message = args.join(' ');
    console.log(chalk.red(`[${getTime()}]`), chalk.redBright(`[${title}]`), message);
    writeLog('ERROR', `[${title}] ${message}`);
  },

  warn: (title, ...args) => {
    const message = args.join(' ');
    console.log(chalk.yellow(`[${getTime()}]`), chalk.yellowBright(`[${title}]`), message);
    writeLog('WARN', `[${title}] ${message}`);
  },

  command: (name, user, threadID) => {
    console.log(
      chalk.magenta(`[${getTime()}]`),
      chalk.magentaBright('[COMMAND]'),
      chalk.white(`${name}`),
      chalk.gray('by'),
      chalk.cyan(user),
      chalk.gray('in'),
      chalk.yellow(threadID)
    );
    writeLog('COMMAND', `${name} by ${user} in ${threadID}`);
  },

  event: (type, threadID) => {
    console.log(
      chalk.blue(`[${getTime()}]`),
      chalk.blueBright('[EVENT]'),
      chalk.white(type),
      chalk.gray('in'),
      chalk.yellow(threadID)
    );
    writeLog('EVENT', `${type} in ${threadID}`);
  }
};

module.exports = logs;
