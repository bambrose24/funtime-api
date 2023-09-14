import {env} from '../../src/config';
import winston, {createLogger, format, transport} from 'winston';
import {WinstonTransport as AxiomTransport} from '@axiomhq/winston';
import {Console} from 'winston/lib/winston/transports';
import {getUser} from '@shared/auth/user';

const axiomTransport = new AxiomTransport({
  dataset: 'funtime_api_logs', // defaults to process.env.AXIOM_DATASET
  token: process.env.AXIOM_TOKEN, // defaults to process.env.AXIOM_TOKEN
  orgId: 'funtime-ywin', // defaults to process.env.AXIOM_ORG_ID
});

const consoleTransport = new winston.transports.Console({format: winston.format.simple()});

const transports = env === 'production' ? [axiomTransport] : [consoleTransport];

const cronOrServer: 'cron' | 'server' =
  process.env.FUNTIME_RUN_SERVER === 'true' ? 'server' : 'cron';

function getDefaultLoggingMeta() {
  const meta: Record<any, any> = {service: 'funtime-api', env, serverApp: cronOrServer};

  try {
    const user = getUser();
    console.log('trying to log and found user', JSON.stringify(user));
    if (user?.dbUser) {
      meta.userId = user.dbUser.uid;
      meta.email = user.dbUser.email;
    } else if (user?.supabase) {
      if (user.supabase.email) {
        meta.email = user.supabase.email;
      }
    }
  } catch (e) {
    // cant use logger lol
  }
  return meta;
}

const winstonLogger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    format.errors({stack: true}),
    format.splat(),
    format.json()
  ),
  defaultMeta: getDefaultLoggingMeta(),
  transports: transports,
  exceptionHandlers: transports,
  rejectionHandlers: transports,
});

type Logger = {
  info: (message: any, meta?: object) => typeof winstonLogger;
  error: (message: any, meta?: object) => typeof winstonLogger;
};

export const logger: Logger = {
  ...winstonLogger,
  info: (message, meta = {}) => {
    const globalMeta = getDefaultLoggingMeta();
    winstonLogger.info(message, {...meta, ...globalMeta});
    return winstonLogger;
  },
  error: (message, meta = {}) => {
    const globalMeta = getDefaultLoggingMeta();
    winstonLogger.error(message, {...meta, ...globalMeta});
    return winstonLogger;
  },
};

// export const logger = createLogger({
//   level: 'info',
//   format: winston.format.json(),
//   transports: [
//     new winston.transports.File({
//       filename: 'info.log',
//     }),
//   ],
// });
