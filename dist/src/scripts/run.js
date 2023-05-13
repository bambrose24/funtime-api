"use strict";
// run a script like
// npm run run-script -- make-email-unique.ts
// with package.json entry of
// "run-script": "ts-node -r tsconfig-paths/register src/scripts/run.ts"
// REMINDER TO CHANGE THE DB URL
Object.defineProperty(exports, "__esModule", { value: true });
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
const path_1 = require("path");
const child_process_1 = require("child_process");
const scriptPath = (0, path_1.resolve)(__dirname, scriptName);
console.log(`Running script: ${scriptPath}`);
(0, child_process_1.execSync)(`npx ts-node -r tsconfig-paths/register ${scriptPath}`, {
    stdio: 'inherit',
});
