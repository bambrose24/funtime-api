import {env} from '../../src/config';
import winston, {createLogger, format} from 'winston';
import {WinstonTransport as AxiomTransport} from '@axiomhq/winston';
import {Console} from 'winston/lib/winston/transports';

const axiomTransport = new AxiomTransport({
  dataset: 'funtime_api_logs', // defaults to process.env.AXIOM_DATASET
  token: process.env.AXIOM_TOKEN, // defaults to process.env.AXIOM_TOKEN
  orgId: 'funtime-ywin', // defaults to process.env.AXIOM_ORG_ID
});

const transports = env === 'production' ? [axiomTransport] : [axiomTransport];

const cronOrServer: 'cron' | 'server' =
  process.env.FUNTIME_RUN_SERVER === 'true' ? 'server' : 'cron';

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
  defaultMeta: {service: 'funtime-api', env, serverApp: cronOrServer},
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
