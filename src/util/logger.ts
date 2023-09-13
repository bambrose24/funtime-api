import {env} from 'src/config';
import {createLogger, format} from 'winston';
import {WinstonTransport as AxiomTransport} from '@axiomhq/winston';

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
  defaultMeta: {service: 'funtime-api', env},
  transports: [
    //
    // - Write to all logs with level `info` and below to `quick-start-combined.log`.
    // - Write all logs error (and below) to `quick-start-error.log`.
    //
    new AxiomTransport({
      dataset: 'funtime_api_logs', // defaults to process.env.AXIOM_DATASET
      token: process.env.AXIOM_TOKEN, // defaults to process.env.AXIOM_TOKEN
      orgId: 'funtime-ywin', // defaults to process.env.AXIOM_ORG_ID
    }),
  ],
});
