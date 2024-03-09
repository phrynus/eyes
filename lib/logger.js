const log4js = require("log4js");

log4js.configure({
  appenders: {
    dateFile: {
      type: "dateFile",
      layout: {
        type: "pattern",
        pattern: "[%z][%d{yyyy-MM-dd hh:mm:ss.SSS}] [%p] - %m%n",
      },
      filename: "logs/log",
      pattern: "yyyy-MM-dd.log",
      maxLogSize: 10485760,
      backups: 3,
      compress: true,
      alwaysIncludePattern: true,
    },
    console: {
      type: "console",
      layout: {
        type: "pattern",
        pattern: "[%z][%d{yyyy-MM-dd hh:mm:ss.SSS}][%p] - %m",
      },
    },
  },
  categories: {
    default: {
      appenders: [
        // 'dateFile',
        "console",
      ],
      // level: 'debug',
      level: "trace",
    },
  },
});

let logger = log4js.getLogger();

module.exports = logger;
