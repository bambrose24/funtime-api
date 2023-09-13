// run a script like
// npm run run-script -- make-email-unique.ts
// with package.json entry of
// "run-script": "ts-node -r tsconfig-paths/register src/scripts/run.ts"
// REMINDER TO CHANGE THE DB URL

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
execSync(`npx ts-node -r tsconfig-paths/register ${scriptPath}`, {
  stdio: 'inherit',
});
