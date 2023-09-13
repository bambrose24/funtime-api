import {env} from 'src/config';
import {createLogger, format} from 'winston';
import {WinstonTransport as AxiomTransport} from '@axiomhq/winston';

const axiomTransport = new AxiomTransport({
  dataset: 'funtime_api_logs', // defaults to process.env.AXIOM_DATASET
  token: process.env.AXIOM_TOKEN, // defaults to process.env.AXIOM_TOKEN
  orgId: 'funtime-ywin', // defaults to process.env.AXIOM_ORG_ID
});

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
  transports: [axiomTransport],
  exceptionHandlers: [axiomTransport],
  rejectionHandlers: [axiomTransport],
});
