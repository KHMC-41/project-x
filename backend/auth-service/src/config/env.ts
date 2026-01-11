export enum EnvVar {
  NODE_ENV = 'NODE_ENV',
  PORT = 'PORT',
  DATABASE_URL = 'DATABASE_URL',
  JWT_SECRET = 'JWT_SECRET',
  JWT_EXPIRES_IN = 'JWT_EXPIRES_IN',
}

export enum NodeEnv {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

function getEnvVar(key: EnvVar): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function getNodeEnv(): NodeEnv {
  const value = getEnvVar(EnvVar.NODE_ENV);
  if (!Object.values(NodeEnv).includes(value as NodeEnv)) {
    throw new Error(`Invalid NODE_ENV: ${value}. Must be one of: ${Object.values(NodeEnv).join(', ')}`);
  }
  return value as NodeEnv;
}

export const env = {
  nodeEnv: getNodeEnv(),
  port: parseInt(getEnvVar(EnvVar.PORT), 10),
  databaseUrl: getEnvVar(EnvVar.DATABASE_URL),
  jwtSecret: getEnvVar(EnvVar.JWT_SECRET),
  jwtExpiresIn: getEnvVar(EnvVar.JWT_EXPIRES_IN),
};
