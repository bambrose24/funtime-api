import {env} from '../../src/config';
import winston, {createLogger, format} from 'winston';
import {WinstonTransport as AxiomTransport} from '@axiomhq/winston';
import {Console} from 'winston/lib/winston/transports';
import {getUser} from '@shared/auth/user';

const axiomTransport = new AxiomTransport({
  dataset: 'funtime_api_logs', // defaults to process.env.AXIOM_DATASET
  token: process.env.AXIOM_TOKEN, // defaults to process.env.AXIOM_TOKEN
  orgId: 'funtime-ywin', // defaults to process.env.AXIOM_ORG_ID
});

const transports = env === 'production' ? [axiomTransport] : [axiomTransport];

const cronOrServer: 'cron' | 'server' =
  process.env.FUNTIME_RUN_SERVER === 'true' ? 'server' : 'cron';

function getDefaultLoggingMeta() {
  const meta: Record<any, any> = {service: 'funtime-api', env, serverApp: cronOrServer};

  try {
    const user = getUser();
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

export const logger = createLogger({
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

// export const logger = createLogger({
//   level: 'info',
//   format: winston.format.json(),
//   transports: [
//     new winston.transports.File({
//       filename: 'info.log',
//     }),
//   ],
// });
