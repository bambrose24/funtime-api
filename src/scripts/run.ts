// run a script like
// npm run run-script -- make-email-unique.ts
// with package.json entry of
// "run-script": "ts-node -r tsconfig-paths/register src/scripts/run.ts"
// REMINDER TO CHANGE THE DB URL

import 'reflect-metadata';
import 'module-alias/register';

/* eslint-disable @typescript-eslint/no-unsafe-argument */
if (process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  require('dotenv').config();
}

const scriptName = process.argv[2];
let env = process.argv[3];

if (!scriptName) {
  console.error('Please provide the script name as the first argument.');
  process.exit(1);
}

if (!env) {
  env = 'production';
}
process.env.FUNTIME_ENV = env;

import {resolve} from 'path';
import {execSync} from 'child_process';
import {logger} from '@util/logger';

const scriptPath = resolve(__dirname, scriptName);

logger.info(`Running script: ${scriptPath}.ts`);
execSync(`npx ts-node -r module-alias/register ${scriptPath}`, {
  stdio: 'inherit',
});
