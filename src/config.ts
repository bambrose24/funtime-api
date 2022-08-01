type Env = "development" | "production";

export type Config = {
  port: number;
};

const configMap: Record<Env, Config> = {
  development: {
    port: 3001,
  },
  production: {
    port: 8080,
  },
};

let environment: Env = "production";

if (process.env.ENV) {
  environment = process.env.ENV as Env;
}

console.log(`env: ${environment}`);

export const env = environment;
export default configMap[env];
