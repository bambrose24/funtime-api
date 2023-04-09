export type Env = "development" | "staging" | "production";

export type Config = {
  port: number;
};

const configMap: Record<Env, Config> = {
  development: {
    port: 3001,
  },
  staging: {
    port: 8080,
  },
  production: {
    port: 8080,
  },
};

let environment: Env = "production";

if (process.env.FUNTIME_ENV) {
  environment = process.env.FUNTIME_ENV as Env;
}

console.log(`env: ${environment}`);

export const env = environment;
const config = configMap[env];

export default config;
