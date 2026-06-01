const requiredEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
};

export const getJwtSecret = (): string => {
  const secret = requiredEnv('JWT_SECRET');
  if (secret.length < 32 || secret.startsWith('replace-with')) {
    throw new Error('JWT_SECRET must be a real secret with at least 32 characters');
  }
  return secret;
};
