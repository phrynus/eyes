import winston, { transports, format } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const { combine, timestamp, printf, colorize } = winston.format;

const levels = {
  error: 0,
  warn: 1,
  success: 2, // 新增自定义级别
  info: 3,
  http: 4,
  verbose: 5,
  debug: 6,
  silly: 7,
};

// 自定义日志格式
const customFormat = format.printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;
  if (Object.keys(metadata).length > 0) {
    msg += ` | ${JSON.stringify(metadata)}`;
  }
  return msg;
});

// 控制台 Transport 配置
const consoleTransport = new transports.Console({
  format: format.combine(format.colorize(), format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), customFormat),
  level: 'silly', // 控制台显示所有级别
});

// 文件 Transport 配置（按天轮换）
const fileTransport: DailyRotateFile = new DailyRotateFile({
  filename: 'logs/application-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '30d',
  format: format.combine(format.timestamp(), format.json()),
  level: 'http', // 文件记录到级别
});

// 创建 logger 实例
const logger = winston.createLogger({
  levels: levels,
  transports: [consoleTransport, fileTransport],
  exceptionHandlers: [new winston.transports.File({ filename: 'logs/exceptions.log' })],
});

// 自定义接口扩展 Winston Logger
interface CustomLogger extends winston.Logger {
  success: winston.LeveledLogMethod;
}

// 添加自定义日志级别
// (logger as CustomLogger).add('success', {
//   level: 'info',
//   message: 'Custom success message',
// });

export default logger as CustomLogger;
