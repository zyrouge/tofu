export const isProduction = () => process.env.NODE_ENV === "production";
export const getEnvMode = () => process.env.NODE_ENV ?? "unknown";
